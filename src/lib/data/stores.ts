import type { Store } from '../types';

/** Tiendas predefinidas habituales en Euskadi.
 *  El usuario puede añadir/editar/quitar desde Ajustes; estas son sólo el seed inicial. */
export const STORES_SEED: Store[] = [
  { id: 'eroski',        name: 'Eroski',           typeId: 'supermercado',     icon: { kind: 'emoji', value: '🛒' } },
  { id: 'mercadona',     name: 'Mercadona',        typeId: 'supermercado',     icon: { kind: 'emoji', value: '🟢' } },
  { id: 'dia',           name: 'Día',              typeId: 'supermercado',     icon: { kind: 'emoji', value: '🔴' } },
  { id: 'alcampo',       name: 'Alcampo',          typeId: 'supermercado',     icon: { kind: 'emoji', value: '🦜' } },
  { id: 'carrefour',     name: 'Carrefour',        typeId: 'supermercado',     icon: { kind: 'emoji', value: '🔵' } },
  { id: 'lidl',          name: 'Lidl',             typeId: 'supermercado',     icon: { kind: 'emoji', value: '🟡' } },
  { id: 'bm',            name: 'BM',               typeId: 'supermercado',     icon: { kind: 'emoji', value: '🟦' } },
  { id: 'lukas',         name: 'Lukas',            typeId: 'supermercado',     icon: { kind: 'emoji', value: '🛍️' } },
  { id: 'farmacia',      name: 'Farmacia',         typeId: 'farmacia',         icon: { kind: 'emoji', value: '💊' } },
  { id: 'carniceria',    name: 'Carnicería',       typeId: 'carniceria',       icon: { kind: 'emoji', value: '🥩' } },
  { id: 'chino',         name: 'Chino',            typeId: 'otros',            icon: { kind: 'emoji', value: '🏮' } },
  { id: 'ikea',          name: 'Ikea',             typeId: 'hogar',            icon: { kind: 'emoji', value: '🛋️' } },
  { id: 'zara',          name: 'Zara',             typeId: 'ropa',             icon: { kind: 'emoji', value: '👗' } },
  { id: 'garbera',       name: 'Garbera',          typeId: 'centro-comercial', icon: { kind: 'emoji', value: '🏬' } },
  { id: 'menta',         name: 'Menta',            typeId: 'centro-comercial', icon: { kind: 'emoji', value: '🌱' } },
  { id: 'primor',        name: 'Primor',           typeId: 'perfumeria',       icon: { kind: 'emoji', value: '💄' } },
  { id: 'locutorio',     name: 'Locutorio',        typeId: 'locutorio',        icon: { kind: 'emoji', value: '📞' } },
  { id: 'druni',         name: 'Druni',            typeId: 'perfumeria',       icon: { kind: 'emoji', value: '🧴' } },
  { id: 'corte-ingles',  name: 'El Corte Inglés',  typeId: 'centro-comercial', icon: { kind: 'emoji', value: '🏢' } },
  { id: 'leroy-merlin',  name: 'Leroy Merlin',     typeId: 'ferreteria',       icon: { kind: 'emoji', value: '🔧' } },
  { id: 'arenal',        name: 'Arenal',           typeId: 'perfumeria',       icon: { kind: 'emoji', value: '💎' } },
  { id: 'primark',       name: 'Primark',          typeId: 'ropa',             icon: { kind: 'emoji', value: '👚' } },
  { id: 'herboristeria', name: 'Herboristería',    typeId: 'herboristeria',    icon: { kind: 'emoji', value: '🌿' } },
  { id: 'otros',         name: 'Otros',            typeId: 'otros',            icon: { kind: 'emoji', value: '🏷️' } },
].map((s, i) => ({ ...s, order: i, enabled: true }));
