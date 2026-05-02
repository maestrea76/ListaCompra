// Capa de persistencia local-first.
// Estrategia: todo el AppState vive en LocalStorage bajo una sola clave.
// Sincronización en la nube (opcional) — adapter mínimo via fetch a un
// endpoint REST que el usuario configure (Gist, HA, Firebase REST, lo que sea).

import type { AppState, UserProfile } from './types';
import { STORE_TYPES } from './data/storeTypes';
import { STORES_SEED } from './data/stores';
import { CATEGORIES_SEED } from './data/categories';
import { PRODUCTS_SEED } from './data/products';

const STORAGE_KEY = 'tucompra:state:v1';

/** Estado inicial cuando no hay nada en LocalStorage. */
export function createInitialState(): AppState {
  return {
    version: 1,
    storeTypes: STORE_TYPES,
    stores: STORES_SEED,
    categories: CATEGORIES_SEED,
    products: PRODUCTS_SEED,
    lists: {},
  };
}

export function loadState(): AppState {
  if (typeof localStorage === 'undefined') return createInitialState();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================
// Hash de PIN — SHA-256 con WebCrypto. No almacenamos el PIN en claro.
// ============================================================
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return (await hashPin(pin)) === hash;
}

// ============================================================
// Sincronización en la nube (opcional). Adapter genérico via REST.
// El usuario configura endpoint + token desde Ajustes; si no, todo
// queda en LocalStorage. Modo "compañero" (@MOVIL) tira de la misma clave
// del usuario base — quitando el sufijo — para compartir datos.
// ============================================================
export function resolveSyncUsername(profile: UserProfile): string {
  return profile.username.replace(/@MOVIL$/i, '');
}

export async function pushToCloud(state: AppState): Promise<void> {
  const p = state.profile;
  if (!p?.cloudSync.enabled || !p.cloudSync.endpoint) return;
  const username = resolveSyncUsername(p);
  await fetch(`${p.cloudSync.endpoint}/${encodeURIComponent(username)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(p.cloudSync.token ? { Authorization: `Bearer ${p.cloudSync.token}` } : {}),
    },
    // Nunca enviamos el pinHash a la nube — el PIN protege sólo el dispositivo.
    body: JSON.stringify({ ...state, profile: { ...p, pinHash: '' } }),
  });
}

export async function pullFromCloud(profile: UserProfile): Promise<AppState | null> {
  if (!profile.cloudSync.enabled || !profile.cloudSync.endpoint) return null;
  const username = resolveSyncUsername(profile);
  const res = await fetch(`${profile.cloudSync.endpoint}/${encodeURIComponent(username)}`, {
    headers: profile.cloudSync.token ? { Authorization: `Bearer ${profile.cloudSync.token}` } : {},
  });
  if (!res.ok) return null;
  return (await res.json()) as AppState;
}
