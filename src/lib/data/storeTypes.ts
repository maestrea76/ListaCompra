import type { StoreType } from '../types';

/** Tipos de tienda predefinidos. El usuario puede añadir más desde Ajustes. */
export const STORE_TYPES: StoreType[] = [
  { id: 'supermercado',     name: 'Supermercado',     icon: { kind: 'emoji', value: '🛒' } },
  { id: 'panaderia',        name: 'Panadería',        icon: { kind: 'emoji', value: '🥖' } },
  { id: 'carniceria',       name: 'Carnicería',       icon: { kind: 'emoji', value: '🥩' } },
  { id: 'pescaderia',       name: 'Pescadería',       icon: { kind: 'emoji', value: '🐟' } },
  { id: 'farmacia',         name: 'Farmacia',         icon: { kind: 'emoji', value: '💊' } },
  { id: 'centro-comercial', name: 'Centro Comercial', icon: { kind: 'emoji', value: '🏬' } },
  { id: 'ferreteria',       name: 'Ferretería',       icon: { kind: 'emoji', value: '🔧' } },
  { id: 'delicatessen',     name: 'Delicatessen',     icon: { kind: 'emoji', value: '🧀' } },
  { id: 'perfumeria',       name: 'Perfumería',       icon: { kind: 'emoji', value: '💄' } },
  { id: 'ropa',             name: 'Ropa',             icon: { kind: 'emoji', value: '👕' } },
  { id: 'herboristeria',    name: 'Herboristería',    icon: { kind: 'emoji', value: '🌿' } },
  { id: 'locutorio',        name: 'Locutorio',        icon: { kind: 'emoji', value: '📞' } },
  { id: 'hogar',            name: 'Hogar / Muebles',  icon: { kind: 'emoji', value: '🛋️' } },
  { id: 'otros',            name: 'Otros',            icon: { kind: 'emoji', value: '🏷️' } },
];
