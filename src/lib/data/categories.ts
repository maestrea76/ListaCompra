import type { Category } from '../types';

const c = (id: string, name: string, typeId: string, emoji: string): Category =>
  ({ id, name, typeId, icon: { kind: 'emoji', value: emoji } });

/** Categorías por tipo de tienda. La última de cada bloque siempre es "Otros". */
export const CATEGORIES_SEED: Category[] = [
  // === Supermercado ===
  c('sup-fruteria',      'Frutería y Verdura',  'supermercado', '🍎'),
  c('sup-carniceria',    'Carnicería',          'supermercado', '🥩'),
  c('sup-pescaderia',    'Pescadería',          'supermercado', '🐟'),
  c('sup-lacteos',       'Lácteos y Huevos',    'supermercado', '🥛'),
  c('sup-panaderia',     'Panadería',           'supermercado', '🥖'),
  c('sup-charcuteria',   'Charcutería',         'supermercado', '🧀'),
  c('sup-despensa',      'Despensa',            'supermercado', '🥫'),
  c('sup-congelados',    'Congelados',          'supermercado', '❄️'),
  c('sup-bebidas',       'Bebidas',             'supermercado', '🍷'),
  c('sup-snacks',        'Snacks y Dulces',     'supermercado', '🍫'),
  c('sup-desayuno',      'Desayuno',            'supermercado', '🥣'),
  c('sup-limpieza',      'Limpieza',            'supermercado', '🧽'),
  c('sup-higiene',       'Higiene Personal',    'supermercado', '🧴'),
  c('sup-bebe',          'Bebé',                'supermercado', '🍼'),
  c('sup-mascotas',      'Mascotas',            'supermercado', '🐾'),
  c('sup-otros',         'Otros',               'supermercado', '🏷️'),

  // === Carnicería (especializada) ===
  c('car-vacuno',        'Vacuno',              'carniceria',   '🐄'),
  c('car-cerdo',         'Cerdo',               'carniceria',   '🐖'),
  c('car-cordero',       'Cordero',             'carniceria',   '🐑'),
  c('car-aves',          'Aves',                'carniceria',   '🐔'),
  c('car-embutidos',     'Embutidos',           'carniceria',   '🌭'),
  c('car-preparados',    'Preparados',          'carniceria',   '🍢'),
  c('car-otros',         'Otros',               'carniceria',   '🏷️'),

  // === Pescadería (especializada) ===
  c('pes-pescado',       'Pescado fresco',      'pescaderia',   '🐟'),
  c('pes-marisco',       'Marisco',             'pescaderia',   '🦐'),
  c('pes-conserva',      'Conservas y ahumados','pescaderia',   '🥫'),
  c('pes-otros',         'Otros',               'pescaderia',   '🏷️'),

  // === Panadería ===
  c('pan-pan',           'Pan',                 'panaderia',    '🥖'),
  c('pan-bolleria',      'Bollería',            'panaderia',    '🥐'),
  c('pan-tartas',        'Tartas y postres',    'panaderia',    '🍰'),
  c('pan-otros',         'Otros',               'panaderia',    '🏷️'),

  // === Farmacia ===
  c('far-medicacion',    'Medicación',          'farmacia',     '💊'),
  c('far-cuidado',       'Cuidado personal',    'farmacia',     '🧴'),
  c('far-bebe',          'Bebé',                'farmacia',     '🍼'),
  c('far-otros',         'Otros',               'farmacia',     '🏷️'),

  // === Perfumería ===
  c('per-fragancias',    'Fragancias',          'perfumeria',   '🌸'),
  c('per-maquillaje',    'Maquillaje',          'perfumeria',   '💄'),
  c('per-cuidado',       'Cuidado facial',      'perfumeria',   '🧖'),
  c('per-cabello',       'Cabello',             'perfumeria',   '💇'),
  c('per-otros',         'Otros',               'perfumeria',   '🏷️'),

  // === Ferretería ===
  c('fer-herramientas',  'Herramientas',        'ferreteria',   '🔧'),
  c('fer-tornilleria',   'Tornillería',         'ferreteria',   '🔩'),
  c('fer-electricidad',  'Electricidad',        'ferreteria',   '💡'),
  c('fer-fontaneria',    'Fontanería',          'ferreteria',   '🚰'),
  c('fer-pintura',       'Pintura',             'ferreteria',   '🎨'),
  c('fer-jardin',        'Jardín',              'ferreteria',   '🌱'),
  c('fer-otros',         'Otros',               'ferreteria',   '🏷️'),

  // === Ropa ===
  c('rop-mujer',         'Mujer',               'ropa',         '👗'),
  c('rop-hombre',        'Hombre',              'ropa',         '👔'),
  c('rop-nino',          'Niño/a',              'ropa',         '👶'),
  c('rop-calzado',       'Calzado',             'ropa',         '👟'),
  c('rop-accesorios',    'Accesorios',          'ropa',         '👜'),
  c('rop-otros',         'Otros',               'ropa',         '🏷️'),

  // === Centro Comercial ===
  c('cc-tecnologia',     'Tecnología',          'centro-comercial', '📱'),
  c('cc-hogar',          'Hogar',               'centro-comercial', '🛋️'),
  c('cc-juguetes',       'Juguetes',            'centro-comercial', '🧸'),
  c('cc-otros',          'Otros',               'centro-comercial', '🏷️'),

  // === Hogar / Muebles ===
  c('hog-cocina',        'Cocina',              'hogar',        '🍴'),
  c('hog-bano',          'Baño',                'hogar',        '🛁'),
  c('hog-decoracion',    'Decoración',          'hogar',        '🖼️'),
  c('hog-textil',        'Textil hogar',        'hogar',        '🛏️'),
  c('hog-otros',         'Otros',               'hogar',        '🏷️'),

  // === Delicatessen ===
  c('del-quesos',        'Quesos',              'delicatessen', '🧀'),
  c('del-vinos',         'Vinos y licores',     'delicatessen', '🍷'),
  c('del-conservas',     'Conservas premium',   'delicatessen', '🥫'),
  c('del-otros',         'Otros',               'delicatessen', '🏷️'),

  // === Herboristería ===
  c('her-infusiones',    'Infusiones',          'herboristeria','🍵'),
  c('her-suplementos',   'Suplementos',         'herboristeria','💊'),
  c('her-cosmetica',     'Cosmética natural',   'herboristeria','🌿'),
  c('her-otros',         'Otros',               'herboristeria','🏷️'),

  // === Locutorio ===
  c('loc-recargas',      'Recargas',            'locutorio',    '📲'),
  c('loc-envios',        'Envíos / Paquetería', 'locutorio',    '📦'),
  c('loc-otros',         'Otros',               'locutorio',    '🏷️'),

  // === Otros (catch-all) ===
  c('otr-varios',        'Varios',              'otros',        '🏷️'),
  c('otr-otros',         'Otros',               'otros',        '🏷️'),
].map((c, i) => ({ ...c, order: i }));
