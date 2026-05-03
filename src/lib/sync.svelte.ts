// Sincronización entre dispositivos vía WebSocket público + AES-GCM.
//
// Antes usábamos y-webrtc P2P, pero las redes móviles (4G/5G con CGNAT)
// y firewalls domésticos restrictivos hacían que el handshake WebRTC
// fallara con frecuencia.
//
// Ahora: y-websocket contra `wss://demos.yjs.dev` (relay público
// mantenido por el equipo de Y.js). Funciona en cualquier red.
// Para que el servidor relay no pueda leer tus listas, el snapshot se
// cifra con AES-GCM usando una clave derivada del username con PBKDF2.

import { app } from './stores/app.svelte';
import type { ShoppingList, Product, Store, UserProfile } from './types';
import { STORES_SEED } from './data/stores';

interface SyncSnapshot {
  profile?: Omit<UserProfile, 'pinHash'>;
  lists: Record<string, ShoppingList>;
  customProducts: Product[];
  customStores: Store[];
  updatedAt: number;
}

// y-websocket Provider type — mantenemos genéricos para no importar
// estáticamente y poder hacer lazy load.
type AnyDoc = { getMap: (n: string) => AnyMap; destroy: () => void };
type AnyMap = {
  observe: (cb: () => void) => void;
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
};
type AnyProvider = {
  awareness: { getStates: () => Map<unknown, unknown>; on: (e: string, cb: () => void) => void };
  on: (e: string, cb: (data: unknown) => void) => void;
  destroy: () => void;
  disconnect: () => void;
};

let provider: AnyProvider | null = null;
let ydoc: AnyDoc | null = null;
let map: AnyMap | null = null;
let cryptoKey: CryptoKey | null = null;
let suppress = false;
let lastAppliedAt = 0;

export const syncStatus = $state({
  enabled: false,
  peers: 0,
  webrtcConns: 0,        // mantenido por compatibilidad con SyncDiag
  room: '',
  username: '',
  signalingConnected: false,
  lastError: '' as string,
  lastSyncAt: 0,
  log: [] as string[],
});

function log(msg: string): void {
  const t = new Date().toLocaleTimeString();
  syncStatus.log = [...syncStatus.log.slice(-19), `[${t}] ${msg}`];
  console.log('[sync]', msg);
}

// ─── Crypto helpers (AES-GCM 256, clave PBKDF2 desde username) ──────────

async function deriveKey(username: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(username.toLowerCase().trim()),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('tucompra-v1-aes-gcm'),
      iterations: 150_000,
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
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
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

// ─── Snapshot helpers ──────────────────────────────────────────────────

async function roomKey(username: string): Promise<string> {
  const data = new TextEncoder().encode(`tucompra:${username.toLowerCase().trim()}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return 'tucompra-' + Array.from(new Uint8Array(buf)).slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildSnapshot(): SyncSnapshot {
  const { profile, lists, products, stores } = app.state;
  const profileSafe = profile ? (() => {
    const { pinHash: _ignore, ...rest } = profile;
    return rest;
  })() : undefined;
  const seedStoreIds = new Set(STORES_SEED.map((s) => s.id));
  return {
    profile: profileSafe,
    lists,
    customProducts: products.filter((p) => p.id.startsWith('custom-')),
    customStores: stores.filter((s) => !seedStoreIds.has(s.id)),
    updatedAt: Date.now(),
  };
}

function applySnapshot(snap: SyncSnapshot): void {
  if (app.state.profile && snap.profile) {
    app.state.profile = { ...snap.profile, pinHash: app.state.profile.pinHash };
  }
  app.state.lists = snap.lists ?? {};
  const seedProducts = app.state.products.filter((p) => !p.id.startsWith('custom-'));
  app.state.products = [...seedProducts, ...(snap.customProducts ?? [])];
  const seedStoreIds = new Set(STORES_SEED.map((s) => s.id));
  const seedStores = app.state.stores.filter((s) => seedStoreIds.has(s.id));
  app.state.stores = [...seedStores, ...(snap.customStores ?? [])];
  app.persist();
  syncStatus.lastSyncAt = Date.now();
  lastAppliedAt = snap.updatedAt;
  log(`⬇️ Aplicado snapshot remoto (${Object.keys(snap.lists).length} listas)`);
}

// ─── API pública ────────────────────────────────────────────────────────

export async function startSync(): Promise<void> {
  if (provider) { log('Ya estaba activa.'); return; }
  const profile = app.state.profile;
  if (!profile) { log('No hay perfil — no arranco.'); return; }

  syncStatus.lastError = '';
  log('Cargando módulos de sync…');

  let Y: typeof import('yjs');
  let WebsocketProvider: typeof import('y-websocket').WebsocketProvider;
  try {
    Y = await import('yjs');
    ({ WebsocketProvider } = await import('y-websocket'));
  } catch (e) {
    syncStatus.lastError = `Carga de módulos falló: ${(e as Error).message}`;
    log(`❌ ${syncStatus.lastError}`);
    return;
  }

  try {
    const room = await roomKey(profile.username);
    syncStatus.room = room;
    syncStatus.username = profile.username;
    log(`Username: "${profile.username}" → Sala: ${room}`);

    cryptoKey = await deriveKey(profile.username);
    log('🔐 Clave AES-GCM derivada (PBKDF2-150k)');

    ydoc = new Y.Doc() as unknown as AnyDoc;
    map = (ydoc as unknown as { getMap: (n: string) => AnyMap }).getMap('tucompra');

    provider = new WebsocketProvider(
      'wss://demos.yjs.dev/ws',
      room,
      ydoc as never,
    ) as unknown as AnyProvider;
    log('Conectando a wss://demos.yjs.dev/ws …');

    provider.on('status', (data) => {
      const status = (data as { status?: string }).status;
      syncStatus.signalingConnected = status === 'connected';
      log(`📡 Estado: ${status}`);
    });

    provider.on('sync', (data) => {
      const synced = !!data;
      log(synced ? '✅ Sync inicial completo' : '🔄 Re-sincronizando');
    });

    provider.on('connection-error', (data) => {
      const err = (data as Event).type ?? 'connection-error';
      log(`⚠️ ${err}`);
    });

    provider.awareness.on('change', () => {
      const n = provider!.awareness.getStates().size - 1;
      const previousPeers = syncStatus.peers;
      syncStatus.peers = Math.max(0, n);
      syncStatus.webrtcConns = syncStatus.peers; // alias para la UI
      if (previousPeers === 0 && syncStatus.peers > 0) {
        log(`🔗 Peer detectado → push`);
        pushNow();
      }
    });

    syncStatus.enabled = true;

    // Cuando llega un cambio en el Y.Map, descifra e intenta aplicar.
    map.observe(() => {
      if (suppress) { suppress = false; return; }
      const enc = map?.get('snapshot') as string | undefined;
      if (!enc || !cryptoKey) return;
      decryptFromBase64(enc, cryptoKey)
        .then((json) => {
          const snap = JSON.parse(json) as SyncSnapshot;
          // Sólo aplicamos si es más reciente que lo último que aplicamos
          // y que cualquier mutación local. Evita bucles.
          const localUpdatedAt = Math.max(
            ...Object.values(app.state.lists).map((l) => l.updatedAt), 0,
          );
          if (snap.updatedAt > Math.max(localUpdatedAt, lastAppliedAt)) {
            applySnapshot(snap);
          }
        })
        .catch((e) => {
          log(`⚠️ No se pudo descifrar snapshot: ${(e as Error).message}`);
        });
    });

    pushNow();
    try { localStorage.setItem('tucompra:sync:enabled', '1'); } catch {}
    log('✅ Sync arrancado.');
  } catch (e) {
    syncStatus.lastError = (e as Error).message ?? String(e);
    log(`❌ Error: ${syncStatus.lastError}`);
    syncStatus.enabled = false;
  }
}

export function stopSync(): void {
  provider?.disconnect();
  provider?.destroy();
  ydoc?.destroy();
  provider = null;
  ydoc = null;
  map = null;
  cryptoKey = null;
  syncStatus.enabled = false;
  syncStatus.peers = 0;
  syncStatus.webrtcConns = 0;
  syncStatus.signalingConnected = false;
  try { localStorage.removeItem('tucompra:sync:enabled'); } catch {}
  log('Sync parado.');
}

export function pushNow(): void {
  if (!map || !cryptoKey) return;
  const snap = buildSnapshot();
  const json = JSON.stringify(snap);
  encryptToBase64(json, cryptoKey)
    .then((enc) => {
      suppress = true;
      map!.set('snapshot', enc);
      syncStatus.lastSyncAt = Date.now();
    })
    .catch((e) => log(`⚠️ Cifrado falló: ${(e as Error).message}`));
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
export function schedulePush(): void {
  if (!map) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 400);
}

export function reconnect(): void {
  stopSync();
  setTimeout(() => startSync().catch(console.warn), 200);
}

export function syncWasEnabled(): boolean {
  try { return localStorage.getItem('tucompra:sync:enabled') === '1'; } catch { return false; }
}
