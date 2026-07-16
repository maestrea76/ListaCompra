// Exporta el catálogo del seed (frontend TS) a un JSON que consume el backend
// Python de la integración de HA. Así el servicio `tucompra.add_item` puede
// reconocer un producto por nombre y deducir su tienda sin duplicar el catálogo.
//
// Se exportan LOS SEIS idiomas, no solo el español: el backend elige uno en
// tiempo de ejecución según el idioma de HA, así que tiene que llevarlos todos
// dentro. Antes solo viajaba el español y por eso la voz solo entendía "papel
// higiénico" aunque la app estuviese en inglés.
//
// Las categorías son universales (los IDs no cambian de idioma) y el backend
// solo necesita el mapa id → typeId: van una vez y sin nombres. `storeTypes` ya
// no se exporta porque el backend nunca lo leía.
//
// Se ejecuta con tsx (ver script `export:catalog` en package.json), tanto en
// `build:ha` local como en el workflow de release. El resultado
// (custom_components/tucompra/catalog.json) NO se commitea: se genera en cada
// build y viaja dentro del zip del release.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ojo con los imports: este script lo ejecuta tsx (Node, ESM puro), no Vite.
// Vite resuelve imports de DIRECTORIO ('./products' → products/index.ts); Node
// en ESM no. Por eso aquí se importa cada fichero de forma explícita en vez de
// pasar por los barrels (locales/index.ts, locales/products/index.ts), que sí
// usan imports de directorio y funcionan solo dentro del bundler.
import type { Product } from '../src/lib/types.ts';
import { CATEGORIES_SEED } from '../src/lib/data/categories.ts';
import { PRODUCTS_SEED } from '../src/lib/data/products/index.ts';
import { UK } from '../src/lib/data/locales/products/uk.ts';
import { US } from '../src/lib/data/locales/products/us.ts';
import { FR } from '../src/lib/data/locales/products/fr.ts';
import { DE } from '../src/lib/data/locales/products/de.ts';
import { BR } from '../src/lib/data/locales/products/br.ts';
import { LOCALIZED_STORES } from '../src/lib/data/locales/stores.ts';
import { LOCALES, type Locale } from '../src/lib/i18n/locale.ts';

// Mismo mapa que LOCALIZED_PRODUCTS (src/lib/data/locales/products/index.ts),
// replicado aquí solo para no importar ese barrel. Si se añade un idioma, hay
// que tocar los dos — la prueba de tests/ comprueba que catalog.json lleve los
// seis, así que un olvido salta en CI.
const PRODUCTS_BY_LOCALE: Record<Locale, Product[]> = {
  es: PRODUCTS_SEED, en: UK, us: US, fr: FR, de: DE, br: BR,
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../custom_components/tucompra/catalog.json');

const catalog = {
  // Mapa id → typeId, común a todos los idiomas.
  categories: CATEGORIES_SEED.map((c) => ({ id: c.id, typeId: c.typeId })),
  // Un bloque por idioma. Solo lo necesario para enrutar: ni iconos ni fotos.
  locales: Object.fromEntries(
    LOCALES.map((loc) => [
      loc,
      {
        products: PRODUCTS_BY_LOCALE[loc].map((p) => ({
          id: p.id,
          name: p.name,
          categoryId: p.categoryId,
          defaultUnit: p.defaultUnit,
          // Exclusivo de una tienda (marca propia): el enrutado lo respeta.
          ...(p.storeId ? { storeId: p.storeId } : {}),
        })),
        stores: LOCALIZED_STORES[loc].map((s) => ({
          id: s.id,
          name: s.name,
          typeId: s.typeId,
        })),
      },
    ]),
  ),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(catalog));

const totals = LOCALES.map((l) => `${l}:${catalog.locales[l].products.length}`).join(' ');
console.log(`[export-catalog] ${totals} → ${OUT}`);
