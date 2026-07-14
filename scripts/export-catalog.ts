// Exporta el catálogo del seed (frontend TS) a un JSON que consume el backend
// Python de la integración de HA. Así el servicio `tucompra.add_item` puede
// reconocer un producto por nombre y deducir su tienda sin duplicar el catálogo.
//
// Se ejecuta con tsx (ver script `export:catalog` en package.json), tanto en
// `build:ha` local como en el workflow de release. El resultado
// (custom_components/tucompra/catalog.json) NO se commitea: se genera en cada
// build y viaja dentro del zip del release.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PRODUCTS_SEED } from '../src/lib/data/products/index.ts';
import { CATEGORIES_SEED } from '../src/lib/data/categories.ts';
import { STORE_TYPES } from '../src/lib/data/storeTypes.ts';
import { STORES_SEED } from '../src/lib/data/stores.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../custom_components/tucompra/catalog.json');

const catalog = {
  // Solo lo necesario para el enrutado; nada de iconos/fotos.
  products: PRODUCTS_SEED.map((p) => ({
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    defaultUnit: p.defaultUnit,
  })),
  categories: CATEGORIES_SEED.map((c) => ({ id: c.id, typeId: c.typeId })),
  storeTypes: STORE_TYPES.map((t) => ({ id: t.id, name: t.name })),
  stores: STORES_SEED.map((s) => ({ id: s.id, name: s.name, typeId: s.typeId })),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(catalog));
console.log(
  `[export-catalog] ${catalog.products.length} productos, ` +
    `${catalog.stores.length} tiendas → ${OUT}`,
);
