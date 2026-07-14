// Store global con Svelte 5 runes. Una única fuente de verdad para toda la app.
// Se hidrata desde LocalStorage al iniciar y se autoguarda al cambiar.

import type { AppState, ListItem, Product, ShoppingList, Store, UserProfile } from '../types';
import { createInitialState, loadState, saveState } from '../storage';
import { STORES_SEED } from '../data/stores';
import { STORE_TYPES } from '../data/storeTypes';
import { CATEGORIES_SEED } from '../data/categories';
import { PRODUCTS_SEED } from '../data/products';

class AppStore {
  state = $state<AppState>(createInitialState());
  hydrated = $state(false);

  /** Re-sincroniza las entidades del seed (tipos, tiendas, categorías, productos)
   *  con los valores actuales del código. Las customizaciones del usuario
   *  (tiendas/productos creados por él, estado enabled/order de tiendas seed,
   *  listas de la compra) se preservan. */
  private refreshSeed(): void {
    const seedStoreIds = new Set(STORES_SEED.map((s) => s.id));
    const seedProductIds = new Set(PRODUCTS_SEED.map((p) => p.id));
    const seedCategoryIds = new Set(CATEGORIES_SEED.map((c) => c.id));

    // Tiendas:
    //  - Si el usuario editó la tienda (edited: true), la dejamos tal cual.
    //  - Si no, usamos los datos del seed pero preservamos order/enabled.
    //  - Las tiendas custom (id no-seed) siempre se mantienen.
    //  - Si el seed ya no incluye un id (p.ej. quitamos Menta), también
    //    se elimina del local salvo que el usuario la hubiera editado.
    const localById = new Map(this.state.stores.map((s) => [s.id, s]));
    const customStores = this.state.stores.filter((s) => !seedStoreIds.has(s.id));
    const editedSeedStores = this.state.stores.filter(
      (s) => seedStoreIds.has(s.id) && s.edited,
    );
    const editedSeedIds = new Set(editedSeedStores.map((s) => s.id));

    this.state.stores = [
      // Seed normales (no editados): refresh desde código
      ...STORES_SEED
        .filter((s) => !editedSeedIds.has(s.id))
        .map((s) => {
          const local = localById.get(s.id);
          return { ...s, order: local?.order ?? s.order, enabled: local?.enabled ?? s.enabled };
        }),
      // Seed editados por el usuario: respetar tal cual
      ...editedSeedStores,
      // Tiendas custom del usuario
      ...customStores,
    ];

    // Categorías y productos: refresco completo del seed; preservamos customs.
    const customCategories = this.state.categories.filter((c) => !seedCategoryIds.has(c.id));
    this.state.categories = [...CATEGORIES_SEED, ...customCategories];

    const customProducts = this.state.products.filter((p) => !seedProductIds.has(p.id));
    this.state.products = [...PRODUCTS_SEED, ...customProducts];

    this.state.storeTypes = STORE_TYPES;
  }

  hydrate(): void {
    if (this.hydrated) return;
    this.state = loadState();
    this.refreshSeed();
    this.hydrated = true;
    saveState(this.state);
  }

  /** Persiste a LocalStorage y, si la sync está activa, agenda un push a HA. */
  persist(): void {
    saveState(this.state);
    // Importación dinámica para no romper SSR ni cargar el bundle de sync
    // si el usuario aún no ha entrado en la app.
    import('../sync.svelte').then((m) => m.schedulePush()).catch(() => {});
  }

  /** Guarda en LocalStorage SIN disparar push. Se usa al aplicar un snapshot
   *  remoto, para no reenviar de vuelta lo que acabamos de recibir. */
  persistLocalOnly(): void {
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
    // Si era la tienda por defecto de algún tipo, limpia esa preferencia.
    if (this.state.defaultStores) {
      for (const [typeId, storeId] of Object.entries(this.state.defaultStores)) {
        if (storeId === id) delete this.state.defaultStores[typeId];
      }
    }
    this.persist();
  }

  // -------- Tienda por defecto por tipo (enrutado por voz) --------
  /** Fija (o limpia, con null) la tienda por defecto de un tipo. */
  setDefaultStore(typeId: string, storeId: string | null): void {
    if (!this.state.defaultStores) this.state.defaultStores = {};
    if (storeId) this.state.defaultStores[typeId] = storeId;
    else delete this.state.defaultStores[typeId];
    this.persist();
  }

  /** Devuelve la tienda por defecto de un tipo. Si no hay una fijada y solo
   *  existe una tienda de ese tipo, devuelve esa (default implícito). */
  getDefaultStore(typeId: string): string | undefined {
    const explicit = this.state.defaultStores?.[typeId];
    if (explicit && this.state.stores.some((s) => s.id === explicit)) return explicit;
    const ofType = this.state.stores.filter(
      (s) => s.typeId === typeId && s.enabled !== false,
    );
    return ofType.length === 1 ? ofType[0].id : undefined;
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
    // Incrementa contador de uso del producto en esta tienda.
    if (!this.state.usage) this.state.usage = {};
    if (!this.state.usage[storeId]) this.state.usage[storeId] = {};
    this.state.usage[storeId][item.productId] =
      (this.state.usage[storeId][item.productId] ?? 0) + 1;
    this.persist();
  }

  /** Devuelve el contador de uso de un producto en una tienda concreta. */
  usageCount(storeId: string, productId: string): number {
    return this.state.usage?.[storeId]?.[productId] ?? 0;
  }

  /** Mueve un ítem de una tienda a otra (triaje de la bandeja "Por clasificar").
   *  Conserva cantidad, unidad y estado; suma uso en la tienda destino. */
  moveItem(fromStoreId: string, itemId: string, toStoreId: string): void {
    if (fromStoreId === toStoreId) return;
    const from = this.state.lists[fromStoreId];
    if (!from) return;
    const idx = from.items.findIndex((i) => i.id === itemId);
    if (idx < 0) return;
    const [item] = from.items.splice(idx, 1);
    from.updatedAt = Date.now();
    const to = this.getList(toStoreId);
    to.items.push(item);
    to.updatedAt = Date.now();
    this.state.lists[toStoreId] = to;
    if (!this.state.usage) this.state.usage = {};
    if (!this.state.usage[toStoreId]) this.state.usage[toStoreId] = {};
    this.state.usage[toStoreId][item.productId] =
      (this.state.usage[toStoreId][item.productId] ?? 0) + 1;
    this.persist();
  }

  /** Sugiere la tienda destino de un producto: su categoría → tipo → tienda
   *  por defecto de ese tipo. undefined si no se puede deducir. */
  suggestStoreFor(productId: string): string | undefined {
    const p = this.state.products.find((x) => x.id === productId);
    if (!p) return undefined;
    const cat = this.state.categories.find((c) => c.id === p.categoryId);
    if (!cat) return undefined;
    return this.getDefaultStore(cat.typeId);
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
