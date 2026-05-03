// Capa de persistencia local. El estado completo vive en LocalStorage;
// la sync entre dispositivos se hace vía Supabase (lib/sync.svelte.ts).

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
