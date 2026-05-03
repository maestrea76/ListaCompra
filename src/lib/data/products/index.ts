// Agregador de seeds de productos.
// Todos los seeds se concatenan aquí en un único array que alimenta el
// catálogo inicial de la app. El usuario puede añadir/editar/borrar desde
// la UI; los cambios se persisten en LocalStorage.

import type { Product } from '../../types';
import { FRUTERIA } from './fruteria';
import { CARNICERIA } from './carniceria';
import { PESCADERIA } from './pescaderia';
import { LACTEOS } from './lacteos';
import { LIMPIEZA } from './limpieza';
import { PANADERIA } from './panaderia';
import { BEBIDAS } from './bebidas';
import { CHARCUTERIA, DESPENSA, CONGELADOS, SNACKS, DESAYUNO } from './despensa';
import { HIGIENE, BEBE, MASCOTAS } from './higiene';
import { FARMACIA } from './farmacia';
import { PERFUMERIA } from './perfumeria';
import { FERRETERIA } from './ferreteria';
import { ROPA } from './ropa';
import { HOGAR } from './hogar';
import { CENTRO_COMERCIAL, DELICATESSEN, HERBORISTERIA, LOCUTORIO, OTROS } from './varios';
import { SALSAS, CONSERVAS_VEG, PREPARADOS, ENVASADOS, HELADOS, DULCES, YOGURES_EXTRA } from './super-extras';
import { VINOS } from './vinos';
import { SUPER_CARNE, SUPER_PESCADO } from './super-carne-pescado';

export const PRODUCTS_SEED: Product[] = [
  ...FRUTERIA,
  ...CARNICERIA,
  ...PESCADERIA,
  ...LACTEOS,
  ...LIMPIEZA,
  ...PANADERIA,
  ...BEBIDAS,
  ...CHARCUTERIA,
  ...DESPENSA,
  ...CONGELADOS,
  ...SNACKS,
  ...DESAYUNO,
  ...HIGIENE,
  ...BEBE,
  ...MASCOTAS,
  ...FARMACIA,
  ...PERFUMERIA,
  ...FERRETERIA,
  ...ROPA,
  ...HOGAR,
  ...CENTRO_COMERCIAL,
  ...DELICATESSEN,
  ...HERBORISTERIA,
  ...LOCUTORIO,
  ...OTROS,
  ...SALSAS,
  ...CONSERVAS_VEG,
  ...PREPARADOS,
  ...ENVASADOS,
  ...HELADOS,
  ...DULCES,
  ...YOGURES_EXTRA,
  ...VINOS,
  ...SUPER_CARNE,
  ...SUPER_PESCADO,
];
