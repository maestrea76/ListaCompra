// Store global con Svelte 5 runes. Una única fuente de verdad para toda la app.
// Se hidrata desde LocalStorage al iniciar y se autoguarda al cambiar.

import type { AppState, ListItem, Product, ShoppingList, Store, UserProfile } from '../types';
import { createInitialState, loadState, saveState } from '../storage';

class AppStore {
  state = $state<AppState>(createInitialState());
  hydrated = $state(false);

  hydrate(): void {
    if (this.hydrated) return;
    this.state = loadState();
    this.hydrated = true;
  }

  /** Persiste a LocalStorage. La sincronización entre dispositivos se hace
   *  bajo demanda mediante "código de backup" (ver lib/backup.ts) — no hay
   *  llamadas automáticas a servidores. */
  persist(): void {
    saveState(this.state);
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

  // -------- Catálogo de productos --------
  /** Crea un producto libre en el catálogo (cuando el usuario teclea un nombre
   *  que no existe). Lo encajamos bajo la categoría "Otros" del tipo de tienda
   *  donde se está añadiendo, para que aparezca agrupado lógicamente. */
  createFreeProduct(name: string, typeId: string, emoji = '🏷️'): Product {
    // Busca la categoría "Otros" de ese tipo, o crea una si no existe.
    let otros = this.state.categories.find(
      (c) => c.typeId === typeId && c.name.toLowerCase() === 'otros',
    );
    if (!otros) {
      otros = {
        id: `${typeId}-otros`,
        name: 'Otros',
        typeId,
        icon: { kind: 'emoji', value: '🏷️' },
        order: 999,
      };
      this.state.categories.push(otros);
    }
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const product: Product = {
      id,
      name: name.trim(),
      categoryId: otros.id,
      icon: { kind: 'emoji', value: emoji },
      defaultUnit: 'unidad',
    };
    this.state.products.push(product);
    this.persist();
    return product;
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

  /** Ajusta la cantidad. Si delta hace que baje a <=0, no hace nada (usa
   *  removeItem para borrar). Permite decimales (0.5 kg, etc.). */
  setItemQty(storeId: string, itemId: string, qty: number): void {
    const list = this.state.lists[storeId];
    if (!list) return;
    const it = list.items.find((i) => i.id === itemId);
    if (!it) return;
    it.qty = Math.max(0.1, Math.round(qty * 10) / 10);
    list.updatedAt = Date.now();
    this.persist();
  }

  setItemUnit(storeId: string, itemId: string, unit: ListItem['unit']): void {
    const list = this.state.lists[storeId];
    if (!list) return;
    const it = list.items.find((i) => i.id === itemId);
    if (!it) return;
    it.unit = unit;
    list.updatedAt = Date.now();
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
