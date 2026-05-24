// Sincronización vía Supabase (Postgres + Realtime) + cifrado AES-GCM E2E.
//
// Flujo:
//  1. Usuario hace login (email+password) → tenemos auth.user
//  2. Usuario introduce una passphrase → derivamos clave AES-GCM (PBKDF2)
//  3. Usuario elige share_id (por defecto "personal:<userId>")
//  4. startSync: pull inicial + suscribimos a realtime + persist hace push
//
// El servidor sólo ve la columna `snapshot` con bytes opacos en base64.
// Sin la passphrase, los datos no se pueden leer.

import { supabase, type SnapshotRow } from './supabase';
import { app } from './stores/app.svelte';
import type { ShoppingList, Product, Store, UserProfile } from './types';
import { STORES_SEED } from './data/stores';
import type { RealtimeChannel, User } from '@supabase/supabase-js';

interface SyncSnapshot {
  profile?: UserProfile;
  lists: Record<string, ShoppingList>;
  customProducts: Product[];
  customStores: Store[];
  updatedAt: number;
}

const PASSPHRASE_KEY = 'tucompra:passphrase';
const SHARE_ID_KEY = 'tucompra:shareId';

let cryptoKey: CryptoKey | null = null;
let channel: RealtimeChannel | null = null;
let suppress = false;
let lastAppliedAt = 0;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

export const syncStatus = $state({
  enabled: false,
  user: null as User | null,
  shareId: '',
  shares: [] as { share_id: string; added_at: string }[],
  passphraseSet: false,
  signalingConnected: false,    // para compat con UI antigua
  peers: 0,                     // alias usado por la UI antigua
  webrtcConns: 0,
  room: '',
  username: '',
  lastError: '',
  lastSyncAt: 0,
  log: [] as string[],
});

function log(msg: string): void {
  const t = new Date().toLocaleTimeString();
  syncStatus.log = [...syncStatus.log.slice(-19), `[${t}] ${msg}`];
  console.log('[sync]', msg);
}

// ─── Auth ───────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string): Promise<string | null> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return error.message;
  syncStatus.user = data.user ?? null;
  return null;
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return error.message;
  syncStatus.user = data.user ?? null;
  return null;
}

export async function signOutFromCloud(): Promise<void> {
  await stopSync();
  await supabase.auth.signOut();
  syncStatus.user = null;
  syncStatus.passphraseSet = false;
  cryptoKey = null;
  try {
    localStorage.removeItem(PASSPHRASE_KEY);
    localStorage.removeItem(SHARE_ID_KEY);
  } catch {}
}

/** Hidratar sesión existente al cargar la app. */
export async function hydrateAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  syncStatus.user = data.session?.user ?? null;
  if (syncStatus.user) {
    log(`👤 Sesión activa: ${syncStatus.user.email}`);
    // Restaura passphrase persistida (vive entre cierres del navegador).
    try {
      const pp = localStorage.getItem(PASSPHRASE_KEY);
      if (pp) {
        cryptoKey = await deriveKey(pp);
        syncStatus.passphraseSet = true;
        log('🔐 Passphrase restaurada');
      }
    } catch {}
  }

  supabase.auth.onAuthStateChange((event, session) => {
    syncStatus.user = session?.user ?? null;
    log(`🔄 Auth event: ${event}`);
  });
}

// ─── Crypto ─────────────────────────────────────────────────────────────

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('tucompra-supabase-v1'),
      iterations: 200_000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptToBase64(plaintext: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext),
  );
  const merged = new Uint8Array(iv.length + ct.byteLength);
  merged.set(iv, 0);
  merged.set(new Uint8Array(ct), iv.length);
  let bin = '';
  for (let i = 0; i < merged.length; i++) bin += String.fromCharCode(merged[i]);
  return btoa(bin);
}

async function decryptFromBase64(b64: string, key: CryptoKey): Promise<string> {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

export async function setPassphrase(pp: string): Promise<void> {
  cryptoKey = await deriveKey(pp);
  syncStatus.passphraseSet = true;
  try { localStorage.setItem(PASSPHRASE_KEY, pp); } catch {}
  log('🔐 Passphrase establecida (AES-GCM 256, PBKDF2-200k)');
  // Arranca la sync automáticamente. La sesión persiste entre cierres
  // del navegador, así que la próxima vez todo va solo.
  await startSync();
}

// ─── Snapshot ───────────────────────────────────────────────────────────

function buildSnapshot(): SyncSnapshot {
  const { profile, lists, products, stores } = app.state;
  const seedStoreIds = new Set(STORES_SEED.map((s) => s.id));
  return {
    profile,
    lists,
    customProducts: products.filter((p) => p.id.startsWith('custom-')),
    customStores: stores.filter((s) => !seedStoreIds.has(s.id) || s.edited),
    updatedAt: Date.now(),
  };
}

function applySnapshot(snap: SyncSnapshot): void {
  if (app.state.profile && snap.profile) {
    app.state.profile = snap.profile;
  }

  // Merge de listas lista a lista: ganamos la versión más reciente por storeId.
  // Nunca borramos una lista local que no esté en el snapshot remoto.
  const remoteLists = snap.lists ?? {};
  const merged: typeof remoteLists = { ...app.state.lists };
  for (const [id, remoteList] of Object.entries(remoteLists)) {
    const local = merged[id];
    if (!local || remoteList.updatedAt > local.updatedAt) {
      merged[id] = remoteList;
    }
  }
  app.state.lists = merged;

  const seedProducts = app.state.products.filter((p) => !p.id.startsWith('custom-'));
  app.state.products = [...seedProducts, ...(snap.customProducts ?? [])];
  const seedStoreIds = new Set(STORES_SEED.map((s) => s.id));
  // Mezcla tiendas: las del seed no editadas las dejamos como están,
  // sustituimos las editadas y custom por las del snapshot.
  const localUntouched = app.state.stores.filter(
    (s) => seedStoreIds.has(s.id) && !s.edited,
  );
  app.state.stores = [...localUntouched, ...(snap.customStores ?? [])];
  app.persist();
  syncStatus.lastSyncAt = Date.now();
  lastAppliedAt = snap.updatedAt;
  log(`⬇️ Aplicado snapshot remoto (${Object.keys(remoteLists).length} listas remotas, ${Object.keys(merged).length} tras merge)`);
}

// ─── Shares (membresía) ─────────────────────────────────────────────────

/** Devuelve todas las listas a las que el usuario está suscrito. */
export async function refreshShares(): Promise<void> {
  if (!syncStatus.user) return;
  const { data, error } = await supabase
    .from('tucompra_members')
    .select('share_id, added_at')
    .order('added_at', { ascending: true });
  if (error) {
    syncStatus.lastError = error.message;
    log(`❌ refreshShares: ${error.message}`);
    return;
  }
  syncStatus.shares = data ?? [];
}

/** Asegura que el usuario tiene su lista personal por defecto. */
async function ensurePersonalShare(): Promise<string> {
  const u = syncStatus.user!;
  const personal = `personal:${u.id}`;
  await supabase.from('tucompra_members').upsert({
    share_id: personal,
    user_id: u.id,
  }, { onConflict: 'share_id,user_id' });
  return personal;
}

/** Une al usuario actual a una lista compartida. */
export async function joinShare(shareId: string): Promise<string | null> {
  if (!syncStatus.user) return 'No has iniciado sesión.';
  const clean = shareId.trim();
  if (!clean) return 'Código vacío.';
  const { error } = await supabase.from('tucompra_members').insert({
    share_id: clean,
    user_id: syncStatus.user.id,
  });
  if (error && !error.message.includes('duplicate')) {
    return error.message;
  }
  await refreshShares();
  return null;
}

export async function leaveShare(shareId: string): Promise<void> {
  if (!syncStatus.user) return;
  await supabase.from('tucompra_members').delete()
    .eq('share_id', shareId)
    .eq('user_id', syncStatus.user.id);
  await refreshShares();
}

// ─── Sync ───────────────────────────────────────────────────────────────

export async function startSync(): Promise<void> {
  if (channel) { log('Ya estaba activa.'); return; }
  if (!syncStatus.user) { log('❌ Sin sesión Supabase.'); return; }
  if (!cryptoKey) { log('❌ Sin passphrase definida.'); return; }

  syncStatus.lastError = '';

  // Carga shares y elige el activo (último usado, o personal por defecto).
  await refreshShares();
  let shareId = '';
  try { shareId = localStorage.getItem(SHARE_ID_KEY) ?? ''; } catch {}
  if (!shareId || !syncStatus.shares.find((s) => s.share_id === shareId)) {
    shareId = await ensurePersonalShare();
    await refreshShares();
  }
  syncStatus.shareId = shareId;
  try { localStorage.setItem(SHARE_ID_KEY, shareId); } catch {}
  log(`🗂️ Lista activa: ${shareId}`);

  // Pull inicial
  await pullOnce();

  // Realtime
  channel = supabase.channel(`tucompra:${shareId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tucompra_snapshots',
      filter: `share_id=eq.${shareId}`,
    }, (payload) => {
      if (suppress) { suppress = false; return; }
      const row = payload.new as SnapshotRow | null;
      if (!row?.snapshot || !cryptoKey) return;
      decryptFromBase64(row.snapshot, cryptoKey)
        .then((json) => {
          const snap = JSON.parse(json) as SyncSnapshot;
          const localUpdatedAt = Math.max(
            ...Object.values(app.state.lists).map((l) => l.updatedAt), 0,
          );
          if (snap.updatedAt > Math.max(localUpdatedAt, lastAppliedAt)) {
            applySnapshot(snap);
          }
        })
        .catch((e) => log(`⚠️ Descifrado falló: ${(e as Error).message}`));
    })
    .subscribe((status) => {
      syncStatus.signalingConnected = status === 'SUBSCRIBED';
      log(`📡 Realtime: ${status}`);
    });

  syncStatus.enabled = true;
  try { localStorage.setItem('tucompra:sync:enabled', '1'); } catch {}
  log('✅ Sync arrancada.');

  // Push nuestro estado inicial (puede que el remoto sea más antiguo).
  pushNow();
}

async function pullOnce(): Promise<void> {
  if (!cryptoKey) return;
  const { data, error } = await supabase
    .from('tucompra_snapshots')
    .select('*')
    .eq('share_id', syncStatus.shareId)
    .maybeSingle();
  if (error) {
    log(`⚠️ Pull: ${error.message}`);
    return;
  }
  if (!data) {
    log('Sin snapshot remoto aún (lista nueva).');
    return;
  }
  try {
    const json = await decryptFromBase64(data.snapshot, cryptoKey);
    const snap = JSON.parse(json) as SyncSnapshot;
    const localUpdatedAt = Math.max(
      ...Object.values(app.state.lists).map((l) => l.updatedAt), 0,
    );
    if (snap.updatedAt > localUpdatedAt) {
      applySnapshot(snap);
    } else {
      log(`ℹ️ Local más reciente (${localUpdatedAt} > ${snap.updatedAt}); no aplicamos remoto.`);
    }
  } catch (e) {
    log(`⚠️ Descifrado inicial falló: ${(e as Error).message} (¿passphrase incorrecta?)`);
  }
}

export async function pushNow(): Promise<void> {
  if (!syncStatus.enabled || !cryptoKey || !syncStatus.shareId || !syncStatus.user) return;
  try {
    const snap = buildSnapshot();
    const enc = await encryptToBase64(JSON.stringify(snap), cryptoKey);
    suppress = true;
    const { error } = await supabase.from('tucompra_snapshots').upsert({
      share_id: syncStatus.shareId,
      snapshot: enc,
      updated_at: new Date().toISOString(),
      updated_by: syncStatus.user.id,
    });
    if (error) {
      log(`⚠️ Push: ${error.message}`);
    } else {
      syncStatus.lastSyncAt = Date.now();
    }
  } catch (e) {
    log(`⚠️ Cifrado falló: ${(e as Error).message}`);
  }
}

export function schedulePush(): void {
  if (!syncStatus.enabled) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 2000);
}

export async function switchShare(shareId: string): Promise<void> {
  await stopSync();
  syncStatus.shareId = shareId;
  try { localStorage.setItem(SHARE_ID_KEY, shareId); } catch {}
  await startSync();
}

export async function stopSync(): Promise<void> {
  if (channel) {
    await supabase.removeChannel(channel);
    channel = null;
  }
  syncStatus.enabled = false;
  syncStatus.signalingConnected = false;
  try { localStorage.removeItem('tucompra:sync:enabled'); } catch {}
  log('Sync parada.');
}

export function reconnect(): void {
  stopSync().then(() => setTimeout(() => startSync().catch(console.warn), 200));
}

export function syncWasEnabled(): boolean {
  try { return localStorage.getItem('tucompra:sync:enabled') === '1'; } catch { return false; }
}
