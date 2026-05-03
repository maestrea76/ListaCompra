// Sincronización entre dispositivos al estilo Boardinggate.
//
// El usuario teclea el mismo username en sus dos equipos → ambos se unen
// a la misma "sala" WebRTC (calculada desde un hash del username) →
// intercambian el snapshot del estado peer-to-peer cifrado.

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
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

let provider: WebrtcProvider | null = null;
let ydoc: Y.Doc | null = null;
let map: Y.Map<unknown> | null = null;
let suppress = false;

// Estado reactivo expuesto a la UI.
export const syncStatus = $state({
  enabled: false,
  peers: 0,
  room: '',
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
  log(`⬇️ Aplicado snapshot remoto (${Object.keys(snap.lists).length} listas)`);
}

export async function startSync(): Promise<void> {
  if (provider) { log('Ya estaba activa.'); return; }
  const profile = app.state.profile;
  if (!profile) { log('No hay perfil — no arranco.'); return; }

  syncStatus.lastError = '';
  log(`Arrancando para "${profile.username}"…`);

  try {
    const room = await roomKey(profile.username);
    syncStatus.room = room;
    log(`Sala: ${room}`);

    ydoc = new Y.Doc();
    map = ydoc.getMap('tucompra');

    provider = new WebrtcProvider(room, ydoc, {
      // Servidores de signaling públicos de la comunidad Y.js.
      // Sólo se usan para que dos peers se descubran — no almacenan datos.
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-eu.fly.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
      ],
    });

    provider.on('status', (e: { connected: boolean }) => {
      syncStatus.signalingConnected = e.connected;
      log(e.connected ? '🟢 Signaling conectado' : '🔴 Signaling desconectado');
    });

    provider.on('peers', (e: { added: string[]; removed: string[] }) => {
      if (e.added.length) log(`👥 +${e.added.length} peer(s)`);
      if (e.removed.length) log(`👋 -${e.removed.length} peer(s)`);
    });

    provider.awareness.on('change', () => {
      const n = provider!.awareness.getStates().size - 1;
      syncStatus.peers = Math.max(0, n);
    });

    syncStatus.enabled = true;

    map.observe(() => {
      if (suppress) { suppress = false; return; }
      const remote = map?.get('snapshot') as SyncSnapshot | undefined;
      if (!remote) return;
      const localUpdatedAt = Math.max(
        ...Object.values(app.state.lists).map((l) => l.updatedAt), 0,
      );
      if (remote.updatedAt > localUpdatedAt) applySnapshot(remote);
    });

    pushNow();
    log('✅ Sync arrancado.');
  } catch (e) {
    syncStatus.lastError = (e as Error).message ?? String(e);
    log(`❌ Error: ${syncStatus.lastError}`);
    syncStatus.enabled = false;
  }
}

export function stopSync(): void {
  provider?.destroy();
  ydoc?.destroy();
  provider = null;
  ydoc = null;
  map = null;
  syncStatus.enabled = false;
  syncStatus.peers = 0;
  syncStatus.signalingConnected = false;
  log('Sync parado.');
}

export function pushNow(): void {
  if (!map) return;
  suppress = true;
  map.set('snapshot', buildSnapshot());
  syncStatus.lastSyncAt = Date.now();
  log('⬆️ Push snapshot');
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
