import type { Category, Product, Store, StoreType } from '../../types';
import type { Locale } from '../../i18n/locale';
import { STORE_TYPES } from '../storeTypes';
import { CATEGORIES_SEED } from '../categories';
import { LOCALIZED_STORES } from './stores';
import { LOCALIZED_PRODUCTS } from './products';
import { TYPE_NAMES, CATEGORY_NAMES } from './labels';

export interface LocalizedSeed {
  storeTypes: StoreType[];
  categories: Category[];
  stores: Store[];
  products: Product[];
}

/** Seed (tipos, categorías, tiendas, productos) para un locale. Los tipos y
 *  categorías conservan sus IDs universales; solo cambia el nombre visible. */
export function getLocalizedSeed(locale: Locale): LocalizedSeed {
  const typeNames = TYPE_NAMES[locale] ?? {};
  const catNames = CATEGORY_NAMES[locale] ?? {};
  return {
    storeTypes: STORE_TYPES.map((t) => ({ ...t, name: typeNames[t.id] ?? t.name })),
    categories: CATEGORIES_SEED.map((c) => ({ ...c, name: catNames[c.id] ?? c.name })),
    stores: LOCALIZED_STORES[locale] ?? LOCALIZED_STORES.es,
    products: LOCALIZED_PRODUCTS[locale] ?? LOCALIZED_PRODUCTS.es,
  };
}

export { LOCALIZED_STORES, LOCALIZED_PRODUCTS };
