import type { Store } from '../types';

/** Tiendas predefinidas habituales en Euskadi.
 *
 *  - `icon`: si es `image`, el `value` es una ruta relativa que se resuelve
 *    contra el `base` de Astro en el componente (`StoreCard`). Las imágenes
 *    viven en `public/logos/<id>.{png,jpg,jpeg}` y son las que el usuario
 *    aporta para uso personal en su propia app.
 *  - `brand`: color de fondo y texto que se usa cuando NO hay imagen, para
 *    seguir teniendo una "tarjeta tipo logo" coherente.
 */
export const STORES_SEED: Store[] = [
  // --- Supermercados ---
  { id: 'eroski',        name: 'Eroski',           typeId: 'supermercado',     icon: { kind: 'emoji', value: '🛒' }, brand: { bg: '#E2231A', fg: '#FFFFFF', initials: 'E' } },
  { id: 'mercadona',     name: 'Mercadona',        typeId: 'supermercado',     icon: { kind: 'image', value: '/logos/mercadona.jpg' }, brand: { bg: '#0E9C49', fg: '#FFFFFF', initials: 'M' } },
  { id: 'dia',           name: 'Día',              typeId: 'supermercado',     icon: { kind: 'image', value: '/logos/dia.png' },       brand: { bg: '#E20613', fg: '#FFE600', initials: 'D' } },
  { id: 'alcampo',       name: 'Alcampo',          typeId: 'supermercado',     icon: { kind: 'emoji', value: '🦜' }, brand: { bg: '#E94E1B', fg: '#FFFFFF', initials: 'A' } },
  { id: 'carrefour',     name: 'Carrefour',        typeId: 'supermercado',     icon: { kind: 'image', value: '/logos/carrefour.png' }, brand: { bg: '#004E9F', fg: '#FFFFFF', initials: 'C' } },
  { id: 'lidl',          name: 'Lidl',             typeId: 'supermercado',     icon: { kind: 'image', value: '/logos/lidl.jpeg' },     brand: { bg: '#FFE600', fg: '#0050AA', initials: 'L' } },
  { id: 'bm',            name: 'BM',               typeId: 'supermercado',     icon: { kind: 'image', value: '/logos/bm.png' },        brand: { bg: '#005CA9', fg: '#FFE600', initials: 'BM' } },
  { id: 'lukas',         name: 'Lukas',            typeId: 'supermercado',     icon: { kind: 'emoji', value: '🛍️' }, brand: { bg: '#003366', fg: '#FFD200', initials: 'LK' } },
  // --- Otros ---
  { id: 'farmacia',      name: 'Farmacia',         typeId: 'farmacia',         icon: { kind: 'emoji', value: '💊' }, brand: { bg: '#0A7E3A', fg: '#FFFFFF', initials: '+' } },
  { id: 'carniceria',    name: 'Carnicería',       typeId: 'carniceria',       icon: { kind: 'emoji', value: '🥩' }, brand: { bg: '#8B1E1E', fg: '#FFFFFF' } },
  { id: 'chino',         name: 'Chino',            typeId: 'otros',            icon: { kind: 'emoji', value: '🏮' }, brand: { bg: '#C8102E', fg: '#FFD200' } },
  { id: 'ikea',          name: 'Ikea',             typeId: 'hogar',            icon: { kind: 'image', value: '/logos/ikea.png' },        brand: { bg: '#0058A3', fg: '#FFDA1A', initials: 'IK' } },
  { id: 'zara',          name: 'Zara',             typeId: 'ropa',             icon: { kind: 'image', value: '/logos/zara.jpg' },        brand: { bg: '#000000', fg: '#FFFFFF', initials: 'Z' } },
  { id: 'garbera',       name: 'Garbera',          typeId: 'centro-comercial', icon: { kind: 'emoji', value: '🏬' }, brand: { bg: '#5B2A86', fg: '#FFFFFF' } },
  { id: 'menta',         name: 'Menta',            typeId: 'centro-comercial', icon: { kind: 'emoji', value: '🌱' }, brand: { bg: '#2DA44E', fg: '#FFFFFF' } },
  { id: 'primor',        name: 'Primor',           typeId: 'perfumeria',       icon: { kind: 'emoji', value: '💄' }, brand: { bg: '#E91E63', fg: '#FFFFFF' } },
  { id: 'locutorio',     name: 'Locutorio',        typeId: 'locutorio',        icon: { kind: 'emoji', value: '📞' }, brand: { bg: '#455A64', fg: '#FFFFFF' } },
  { id: 'druni',         name: 'Druni',            typeId: 'perfumeria',       icon: { kind: 'image', value: '/logos/druni.png' },       brand: { bg: '#C9156D', fg: '#FFFFFF' } },
  { id: 'corte-ingles',  name: 'El Corte Inglés',  typeId: 'centro-comercial', icon: { kind: 'image', value: '/logos/corte-ingles.png' },brand: { bg: '#0A6B3B', fg: '#FFFFFF', initials: 'ECI' } },
  { id: 'leroy-merlin',  name: 'Leroy Merlin',     typeId: 'ferreteria',       icon: { kind: 'image', value: '/logos/leroy-merlin.png' },brand: { bg: '#78BE20', fg: '#FFFFFF' } },
  { id: 'arenal',        name: 'Arenal',           typeId: 'perfumeria',       icon: { kind: 'image', value: '/logos/arenal.png' },      brand: { bg: '#FFFFFF', fg: '#E2231A' } },
  { id: 'primark',       name: 'Primark',          typeId: 'ropa',             icon: { kind: 'image', value: '/logos/primark.png' },     brand: { bg: '#0070BA', fg: '#FFFFFF' } },
  { id: 'herboristeria', name: 'Herboristería',    typeId: 'herboristeria',    icon: { kind: 'emoji', value: '🌿' }, brand: { bg: '#3F6E2A', fg: '#FFFFFF' } },
  { id: 'otros',         name: 'Otros',            typeId: 'otros',            icon: { kind: 'emoji', value: '🏷️' }, brand: { bg: '#64748B', fg: '#FFFFFF' } },
].map((s, i) => ({ ...s, order: i, enabled: true })) as Store[];
