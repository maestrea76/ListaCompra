// Capa de persistencia local-first. Sin servidores externos.
// El estado completo vive en LocalStorage. Para mover datos a otro
// dispositivo se genera un "código de backup" (ver lib/backup.ts).

import type { AppState } from './types';
import { STORE_TYPES } from './data/storeTypes';
import { STORES_SEED } from './data/stores';
import { CATEGORIES_SEED } from './data/categories';
import { PRODUCTS_SEED } from './data/products';

const STORAGE_KEY = 'tucompra:state:v1';

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

// SHA-256 del PIN — no almacenamos el PIN en claro.
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
