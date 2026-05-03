// Sincronización entre dispositivos al estilo Boardinggate.
//
// El usuario teclea el mismo username en sus dos equipos → ambos se unen
// a la misma "sala" WebRTC (calculada desde un hash del username) →
// intercambian el snapshot del estado peer-to-peer cifrado.
//
// El PIN NO viaja a la sala — es local de cada dispositivo. Eso significa
// que distintos dispositivos pueden tener distintos PIN para la misma cuenta.
//
// Sólo se sincroniza lo personalizado (perfil sin pinHash, listas,
// productos custom, tiendas custom). El catálogo seed es local.

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { app } from './stores/app.svelte';
import type { ShoppingList, Product, Store, UserProfile } from './types';
import { STORES_SEED } from './data/stores';

interface SyncSnapshot {
  profile?: Omit<UserProfile, 'pinHash'>;
  lists: Record<string, ShoppingList>;
  customProducts: Product[];
  customStores: Store[];          // tiendas creadas/editadas por el usuario
  updatedAt: number;
}

let provider: WebrtcProvider | null = null;
let ydoc: Y.Doc | null = null;
let map: Y.Map<unknown> | null = null;

// Bandera para no reaccionar a nuestras propias escrituras al map.
let suppress = false;

// Estado expuesto reactivamente para la cabecera (indicador 🟢/⚪).
export const syncStatus = $state({ enabled: false, peers: 0 });

// ─── Helpers ──────────────────────────────────────────────────────────

async function roomKey(username: string): Promise<string> {
  const data = new TextEncoder().encode(`tucompra:${username.toLowerCase().trim()}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  // Sólo 16 hex chars (~64 bits) — suficiente para que dos usernames
  // distintos no colisionen y el nombre de sala sea legible en logs.
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
    // Llevamos también las tiendas que el usuario haya creado o editado
    // por encima del seed. Para simplificar, mandamos todas las que
    // tengan id no-seed o cuyo contenido difiera del seed por nombre.
    customStores: stores.filter((s) => !seedStoreIds.has(s.id)),
    updatedAt: Date.now(),
  };
}

function applySnapshot(snap: SyncSnapshot): void {
  // Conservamos el pinHash local — el PIN es por dispositivo.
  if (app.state.profile && snap.profile) {
    app.state.profile = {
      ...snap.profile,
      pinHash: app.state.profile.pinHash,
    };
  }

  app.state.lists = snap.lists ?? {};

  // Mezcla productos: seed + customs del snapshot
  const seedProducts = app.state.products.filter((p) => !p.id.startsWith('custom-'));
  app.state.products = [...seedProducts, ...(snap.customProducts ?? [])];

  // Mezcla tiendas: seed + customs del snapshot
  const seedStoreIds = new Set(STORES_SEED.map((s) => s.id));
  const seedStores = app.state.stores.filter((s) => seedStoreIds.has(s.id));
  app.state.stores = [...seedStores, ...(snap.customStores ?? [])];

  app.persist();
}

// ─── API pública ──────────────────────────────────────────────────────

/** Arranca la sincronización para el usuario actual. Idempotente. */
export async function startSync(): Promise<void> {
  if (provider) return;
  const profile = app.state.profile;
  if (!profile) return;

  const room = await roomKey(profile.username);
  ydoc = new Y.Doc();
  map = ydoc.getMap('tucompra');

  // y-webrtc usa por defecto los signaling servers públicos de la
  // comunidad Y.js — no requiere setup. Sólo intercambian "estoy aquí",
  // los datos van peer-to-peer cifrados.
  provider = new WebrtcProvider(room, ydoc);

  // Indicador de peers conectados.
  provider.awareness.on('change', () => {
    syncStatus.peers = provider!.awareness.getStates().size - 1; // sin contarme
  });
  syncStatus.enabled = true;

  // Estrategia "last-write-wins por timestamp": cuando llega un snapshot
  // con updatedAt mayor que el local, lo aplicamos. Si nuestro local es
  // más reciente, lo subimos al doc.
  map.observe(() => {
    if (suppress) { suppress = false; return; }
    const remote = map?.get('snapshot') as SyncSnapshot | undefined;
    if (!remote) return;
    const localUpdatedAt = Math.max(...Object.values(app.state.lists).map((l) => l.updatedAt), 0);
    if (remote.updatedAt > localUpdatedAt) {
      applySnapshot(remote);
    } else if (localUpdatedAt > remote.updatedAt) {
      pushNow();
    }
  });

  // Sube nuestro estado actual al cargar.
  pushNow();
}

export function stopSync(): void {
  provider?.destroy();
  ydoc?.destroy();
  provider = null;
  ydoc = null;
  map = null;
  syncStatus.enabled = false;
  syncStatus.peers = 0;
}

/** Empuja inmediatamente el snapshot actual al doc compartido. */
export function pushNow(): void {
  if (!map) return;
  suppress = true;
  map.set('snapshot', buildSnapshot());
}

// Debouncer para llamar a pushNow desde app.persist sin saturar.
let pushTimer: ReturnType<typeof setTimeout> | null = null;
export function schedulePush(): void {
  if (!map) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 400);
}
