// Agregador de seeds de productos.
// Para añadir más categorías: crea un archivo en este directorio que exporte
// un array de Product[] y agrégalo al spread de PRODUCTS_SEED.
//
// TODO seed pendiente (estructura ya creada en categories.ts):
//   - sup-charcuteria, sup-despensa, sup-congelados, sup-snacks, sup-desayuno,
//     sup-higiene, sup-bebe, sup-mascotas, farmacia/*, perfumeria/*,
//     ferreteria/*, ropa/*, hogar/*, delicatessen/*, herboristeria/*, locutorio/*
// Las categorías que aún no tienen seed simplemente se mostrarán vacías
// y el usuario puede añadir productos manualmente desde la UI.

import type { Product } from '../../types';
import { FRUTERIA } from './fruteria';
import { CARNICERIA } from './carniceria';
import { PESCADERIA } from './pescaderia';
import { LACTEOS } from './lacteos';
import { LIMPIEZA } from './limpieza';
import { PANADERIA } from './panaderia';
import { BEBIDAS } from './bebidas';

export const PRODUCTS_SEED: Product[] = [
  ...FRUTERIA,
  ...CARNICERIA,
  ...PESCADERIA,
  ...LACTEOS,
  ...LIMPIEZA,
  ...PANADERIA,
  ...BEBIDAS,
];
