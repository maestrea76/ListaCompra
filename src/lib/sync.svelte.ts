// Sincronización entre dispositivos (lazy / opt-in).
//
// IMPORTANTE: yjs y y-webrtc se importan DINÁMICAMENTE dentro de
// startSync() para que un fallo de carga (polyfill faltante, paquete no
// instalado, navegador sin soporte) NO rompa el resto de la app.
// El usuario activa la sync desde el panel cuando le interesa.

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

// Tipos genéricos para no tener que importar yjs/y-webrtc estáticamente.
type AnyDoc = { getMap: (name: string) => AnyMap; destroy: () => void };
type AnyMap = {
  observe: (cb: () => void) => void;
  set: (key: string, value: unknown) => void;
  get: (key: string) => unknown;
};
type AnyProvider = {
  awareness: { getStates: () => Map<unknown, unknown>; on: (e: string, cb: () => void) => void };
  on: (e: string, cb: (data: { connected?: boolean; added?: string[]; removed?: string[] }) => void) => void;
  destroy: () => void;
};

let provider: AnyProvider | null = null;
let ydoc: AnyDoc | null = null;
let map: AnyMap | null = null;
let suppress = false;

export const syncStatus = $state({
  enabled: false,
  peers: 0,
  webrtcConns: 0,        // intentos de conexión WebRTC (incluye no establecidas)
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

/** Activa la sincronización. Carga yjs + y-webrtc dinámicamente. */
export async function startSync(): Promise<void> {
  if (provider) { log('Ya estaba activa.'); return; }
  const profile = app.state.profile;
  if (!profile) { log('No hay perfil — no arranco.'); return; }

  syncStatus.lastError = '';
  log(`Cargando módulos de sync…`);

  let Y: typeof import('yjs');
  let WebrtcProvider: typeof import('y-webrtc').WebrtcProvider;
  try {
    Y = await import('yjs');
    ({ WebrtcProvider } = await import('y-webrtc'));
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

    ydoc = new Y.Doc() as unknown as AnyDoc;
    map = (ydoc as unknown as { getMap: (n: string) => AnyMap }).getMap('tucompra');

    // Un único signaling server (el más estable) para asegurar que
    // ambos peers acaban en el MISMO servidor y se descubren mutuamente.
    // El `password` cifra el contenido del room — sólo otros dispositivos
    // con el mismo username pueden leer los datos.
    // STUN + TURN para que el handshake WebRTC funcione también detrás de
    // NATs simétricos / firewalls restrictivos (caso típico en oficinas
    // o redes domésticas con CGNAT). Open Relay Project ofrece TURN
    // público y gratuito.
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
      {
        urls: [
          'turn:openrelay.metered.ca:80',
          'turn:openrelay.metered.ca:443',
          'turn:openrelay.metered.ca:443?transport=tcp',
        ],
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ];

    // Múltiples signaling servers para redundancia.
    const signaling = [
      'wss://y-webrtc-eu.fly.dev',
      'wss://signaling.yjs.dev',
    ];

    // OJO: NO pasamos `password` deliberadamente. y-webrtc 10.x deriva la
    // sala "real" en el signaling server a partir de roomName+password,
    // y diferencias sutiles en codificación (TextEncoder vs UTF-16,
    // versiones diferentes, etc.) provocan que dos devices acaben en
    // salas distintas en el server aunque ambos calculen el mismo hash
    // localmente. Sin password, ambos van a la misma sala fija.
    // Trade-off: cualquiera con tu username puede entrar a tu sala.
    // El username ya es razonablemente único, y es lo que usa Boardinggate.
    provider = new WebrtcProvider(room, ydoc as never, {
      signaling,
      peerOpts: { config: { iceServers } },
    } as never) as unknown as AnyProvider;
    log(`Conectando a ${signaling.length} signaling server(s) + STUN/TURN…`);

    // Sondeo periódico del número de conexiones WebRTC intentadas.
    // Si tras unos segundos signaling=conectado pero webrtcConns=0,
    // significa que el otro peer no está activo en ese mismo momento.
    // Si webrtcConns>0 pero peers=0, la negociación WebRTC está fallando.
    setInterval(() => {
      if (!provider) return;
      const room = (provider as unknown as { room?: { webrtcConns?: Map<unknown, unknown> } }).room;
      syncStatus.webrtcConns = room?.webrtcConns?.size ?? 0;
    }, 1500);

    provider.on('status', (e) => {
      syncStatus.signalingConnected = !!e.connected;
      log(e.connected ? '🟢 Signaling conectado' : '🔴 Signaling desconectado');
    });

    provider.on('peers', (e) => {
      if (e.added?.length) {
        log(`👥 +${e.added.length} peer(s) → forzando push del snapshot`);
        // Cuando llega un peer nuevo, forzamos un push inmediato para que
        // reciba nuestro estado aunque acabe de entrar tarde.
        pushNow();
      }
      if (e.removed?.length) log(`👋 -${e.removed.length} peer(s)`);
    });

    provider.awareness.on('change', () => {
      const n = provider!.awareness.getStates().size - 1;
      const previousPeers = syncStatus.peers;
      syncStatus.peers = Math.max(0, n);
      // Si pasamos de 0 peers a >0, forzamos push también (a veces el
      // evento 'peers' llega tarde o no llega).
      if (previousPeers === 0 && syncStatus.peers > 0) {
        log(`🔗 Awareness detecta peer → push`);
        pushNow();
      }
    });

    // Heartbeat: cada 5s re-empujamos el snapshot. Muy poca carga (Y.js
    // sólo propaga deltas), pero garantiza que peers tardíos o con
    // conexiones inestables acaben recibiendo nuestros datos.
    const heartbeat = setInterval(() => {
      if (provider && map) {
        pushNow();
      } else {
        clearInterval(heartbeat);
      }
    }, 5000);

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

    // Recordamos la decisión para arrancar automáticamente la próxima vez.
    try { localStorage.setItem('tucompra:sync:enabled', '1'); } catch {}
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
  try { localStorage.removeItem('tucompra:sync:enabled'); } catch {}
  log('Sync parado.');
}

export function pushNow(): void {
  if (!map) return;
  suppress = true;
  map.set('snapshot', buildSnapshot());
  syncStatus.lastSyncAt = Date.now();
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

/** Verifica si el usuario activó sync previamente (la próxima vez auto-arranca). */
export function syncWasEnabled(): boolean {
  try { return localStorage.getItem('tucompra:sync:enabled') === '1'; } catch { return false; }
}
