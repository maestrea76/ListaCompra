import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: 'sup-panaderia',
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Panadería en la sección de supermercado (sup-panaderia).
 *  Productos típicos del horno y bollería que vende un Eroski/Mercadona/etc. */
export const SUPER_PANADERIA: Product[] = [
  // Pan
  p('sup-barra-cuarto',     'Barra de cuarto',         '🥖'),
  p('sup-barra-pueblo',     'Barra de pueblo',         '🥖'),
  p('sup-barra-rustica',    'Barra rústica',           '🥖'),
  p('sup-baguette-super',   'Baguette',                '🥖'),
  p('sup-chapata-super',    'Chapata',                 '🥖'),
  p('sup-chapatín',         'Chapatín / panecillo',    '🥖'),
  p('sup-pan-payés',        'Pan payés',               '🍞'),
  p('sup-hogaza',           'Hogaza',                  '🍞'),
  p('sup-pan-integral-s',   'Pan integral',            '🍞'),
  p('sup-pan-centeno-s',    'Pan de centeno',          '🍞'),
  p('sup-pan-espelta-s',    'Pan de espelta',          '🍞'),
  p('sup-pan-semillas-s',   'Pan de semillas',         '🍞'),
  p('sup-pan-cereales',     'Pan multicereales',       '🍞'),
  p('sup-pan-molde-blanco', 'Pan de molde blanco',     '🍞', 'paquete'),
  p('sup-pan-molde-int',    'Pan de molde integral',   '🍞', 'paquete'),
  p('sup-pan-molde-sin-corteza','Pan de molde sin corteza','🍞','paquete'),
  p('sup-pan-bocadillo-s',  'Pan de bocadillo',        '🥖'),
  p('sup-pan-hamburguesa-s','Pan de hamburguesa',      '🍔', 'paquete'),
  p('sup-pan-perrito-s',    'Pan de perrito',          '🌭', 'paquete'),
  p('sup-pan-pita',         'Pan de pita',             '🫓', 'paquete'),
  p('sup-pan-naan',         'Pan naan',                '🫓', 'paquete'),
  p('sup-pan-rallado-s',    'Pan rallado',             '🍞', 'paquete'),
  p('sup-picos-super',      'Picos',                   '🥨', 'paquete'),
  p('sup-regañás-super',    'Regañás',                 '🥨', 'paquete'),
  p('sup-tostadas-super',   'Tostadas',                '🍞', 'paquete'),
  p('sup-biscotes-super',   'Biscotes',                '🍞', 'paquete'),
  p('sup-colines',          'Colines',                 '🥖', 'paquete'),
  // Bollería
  p('sup-croissant-super',  'Croissant',               '🥐'),
  p('sup-croissants-pack-s','Croissants (pack)',       '🥐', 'paquete'),
  p('sup-napolitana-choco', 'Napolitana de chocolate', '🥐'),
  p('sup-napolitana-crema', 'Napolitana de crema',     '🥐'),
  p('sup-palmera-super',    'Palmera',                 '🥐'),
  p('sup-palmera-choco',    'Palmera de chocolate',    '🥐'),
  p('sup-caracola-super',   'Caracola',                '🥐'),
  p('sup-donut-super',      'Donut',                   '🍩'),
  p('sup-mini-donuts-s',    'Mini donuts',             '🍩', 'paquete'),
  p('sup-magdalena-pack-s', 'Magdalenas (pack)',       '🧁', 'paquete'),
  p('sup-bizcocho-super',   'Bizcocho',                '🍰'),
  p('sup-bizcocho-yogur',   'Bizcocho de yogur',       '🍰'),
  p('sup-ensaimada-super',  'Ensaimada',               '🥐'),
  p('sup-bollo-leche-s',    'Bollo de leche',          '🥖'),
  p('sup-suizo',            'Suizo',                   '🥖'),
  p('sup-rosquilla-pack',   'Rosquillas',              '🥯', 'paquete'),
  p('sup-galleta-mantec-s', 'Galletas mantequilla',    '🍪', 'paquete'),
  p('sup-roscon-reyes-s',   'Roscón de Reyes',         '🎂'),
  // Tartas y postres del super
  p('sup-tarta-queso-s',    'Tarta de queso',          '🍰'),
  p('sup-tarta-manzana-s',  'Tarta de manzana',        '🥧'),
  p('sup-tarta-chocolate-s','Tarta de chocolate',      '🎂'),
  p('sup-pantxineta-super', 'Pantxineta',              '🥧'),
  p('sup-goxua-super',      'Goxua',                   '🍰'),
];
