// Store global con Svelte 5 runes. Una única fuente de verdad para toda la app.
// Se hidrata desde LocalStorage al iniciar y se autoguarda al cambiar.

import type { AppState, ListItem, ShoppingList, Store, UserProfile } from '../types';
import { createInitialState, loadState, saveState, pushToCloud } from '../storage';

class AppStore {
  state = $state<AppState>(createInitialState());
  hydrated = $state(false);

  hydrate(): void {
    if (this.hydrated) return;
    this.state = loadState();
    this.hydrated = true;
  }

  /** Persiste a LocalStorage y, si está habilitado, empuja a la nube. */
  persist(): void {
    saveState(this.state);
    if (this.state.profile?.cloudSync.autoSync) {
      // fire-and-forget: errores se ignoran a nivel de store.
      pushToCloud(this.state).catch(console.warn);
    }
  }

  // -------- Perfil --------
  setProfile(p: UserProfile): void {
    this.state.profile = p;
    this.persist();
  }

  signOut(): void {
    this.state.profile = undefined;
    this.persist();
  }

  // -------- Tiendas --------
  upsertStore(s: Store): void {
    const idx = this.state.stores.findIndex((x) => x.id === s.id);
    if (idx >= 0) this.state.stores[idx] = s;
    else this.state.stores.push(s);
    this.persist();
  }

  removeStore(id: string): void {
    this.state.stores = this.state.stores.filter((s) => s.id !== id);
    delete this.state.lists[id];
    this.persist();
  }

  // -------- Lista de la compra --------
  getList(storeId: string): ShoppingList {
    return (
      this.state.lists[storeId] ?? {
        storeId,
        items: [],
        updatedAt: Date.now(),
      }
    );
  }

  addItem(storeId: string, item: Omit<ListItem, 'id' | 'addedAt' | 'done'>): void {
    const list = this.getList(storeId);
    list.items.push({
      ...item,
      id: crypto.randomUUID(),
      addedAt: Date.now(),
      done: false,
    });
    list.updatedAt = Date.now();
    this.state.lists[storeId] = list;
    this.persist();
  }

  toggleItem(storeId: string, itemId: string): void {
    const list = this.state.lists[storeId];
    if (!list) return;
    const it = list.items.find((i) => i.id === itemId);
    if (!it) return;
    it.done = !it.done;
    it.doneAt = it.done ? Date.now() : undefined;
    list.updatedAt = Date.now();
    this.persist();
  }

  removeItem(storeId: string, itemId: string): void {
    const list = this.state.lists[storeId];
    if (!list) return;
    list.items = list.items.filter((i) => i.id !== itemId);
    list.updatedAt = Date.now();
    this.persist();
  }

  clearDone(storeId: string): void {
    const list = this.state.lists[storeId];
    if (!list) return;
    list.items = list.items.filter((i) => !i.done);
    list.updatedAt = Date.now();
    this.persist();
  }
}

export const app = new AppStore();
