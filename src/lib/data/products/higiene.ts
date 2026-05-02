import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

export const HIGIENE: Product[] = [
  p('gel-ducha',         'Gel de ducha',            '🧴','sup-higiene'),
  p('jabon-manos',       'Jabón de manos',          '🧼','sup-higiene'),
  p('jabon-pastilla',    'Jabón en pastilla',       '🧼','sup-higiene'),
  p('champu',            'Champú',                  '🧴','sup-higiene'),
  p('acondicionador',    'Acondicionador',          '🧴','sup-higiene'),
  p('mascarilla-pelo',   'Mascarilla capilar',      '🧴','sup-higiene'),
  p('crema-corporal',    'Crema corporal',          '🧴','sup-higiene'),
  p('crema-manos',       'Crema de manos',          '🧴','sup-higiene'),
  p('desodorante',       'Desodorante',             '🧴','sup-higiene'),
  p('colonia',           'Colonia',                 '🌸','sup-higiene'),
  p('pasta-dientes',     'Pasta de dientes',        '🪥','sup-higiene'),
  p('cepillo-dientes',   'Cepillo de dientes',      '🪥','sup-higiene'),
  p('hilo-dental',       'Hilo dental',             '🪥','sup-higiene'),
  p('enjuague-bucal',    'Enjuague bucal',          '🧴','sup-higiene'),
  p('cuchilla-afeitar',  'Cuchilla de afeitar',     '🪒','sup-higiene','paquete'),
  p('espuma-afeitar',    'Espuma de afeitar',       '🧴','sup-higiene'),
  p('aftershave',        'Aftershave',              '🧴','sup-higiene'),
  p('compresas',         'Compresas',               '🩹','sup-higiene','paquete'),
  p('tampones',          'Tampones',                '🩹','sup-higiene','paquete'),
  p('salvaslip',         'Salvaslip',               '🩹','sup-higiene','paquete'),
  p('toallitas',         'Toallitas húmedas',       '🧻','sup-higiene','paquete'),
  p('bastoncillos',      'Bastoncillos oído',       '🦻','sup-higiene','paquete'),
  p('tiritas',           'Tiritas',                 '🩹','sup-higiene','paquete'),
  p('algodon',           'Algodón',                 '☁️','sup-higiene','paquete'),
  p('alcohol',           'Alcohol',                 '🧴','sup-higiene'),
  p('agua-oxigenada',    'Agua oxigenada',          '🧴','sup-higiene'),
  p('protector-solar',   'Protector solar',         '☀️','sup-higiene'),
];

export const BEBE: Product[] = [
  p('panales',           'Pañales',                 '🍼','sup-bebe','paquete'),
  p('toallitas-bebe',    'Toallitas bebé',          '🍼','sup-bebe','paquete'),
  p('crema-pañal',       'Crema del pañal',         '🍼','sup-bebe'),
  p('papilla-cereales',  'Papilla de cereales',     '🥣','sup-bebe','paquete'),
  p('potito-fruta',      'Potito de fruta',         '🍎','sup-bebe','unidad'),
  p('potito-pollo',      'Potito de pollo',         '🐔','sup-bebe','unidad'),
  p('leche-bebe-1',      'Leche infantil 1',        '🍼','sup-bebe','paquete'),
  p('leche-bebe-2',      'Leche infantil 2',        '🍼','sup-bebe','paquete'),
  p('chupete',           'Chupete',                 '🍼','sup-bebe'),
  p('biberon',           'Biberón',                 '🍼','sup-bebe'),
  p('gel-bebe',          'Gel bebé',                '🧴','sup-bebe'),
  p('champu-bebe',       'Champú bebé',             '🧴','sup-bebe'),
  p('colonia-bebe',      'Colonia bebé',            '🌸','sup-bebe'),
];

export const MASCOTAS: Product[] = [
  p('pienso-perro',      'Pienso de perro',         '🐕','sup-mascotas','kg'),
  p('pienso-gato',       'Pienso de gato',          '🐈','sup-mascotas','kg'),
  p('lata-perro',        'Comida húmeda perro',     '🥫','sup-mascotas','unidad'),
  p('lata-gato',         'Comida húmeda gato',      '🥫','sup-mascotas','unidad'),
  p('arena-gato',        'Arena para gato',         '🪨','sup-mascotas','paquete'),
  p('snacks-perro',      'Snacks de perro',         '🦴','sup-mascotas','paquete'),
  p('huesos-perro',      'Huesos de perro',         '🦴','sup-mascotas','paquete'),
  p('correa',            'Correa',                  '🐕'  ,'sup-mascotas'),
  p('collar',            'Collar',                  '🐕','sup-mascotas'),
  p('bolsas-paseo',      'Bolsas de paseo',         '🗑️','sup-mascotas','paquete'),
  p('antiparasitario',   'Antiparasitario',         '💊','sup-mascotas'),
  p('cepillo-pelo',      'Cepillo de pelo',         '🪥','sup-mascotas'),
  p('juguete-mascota',   'Juguete',                 '🧸','sup-mascotas'),
];
