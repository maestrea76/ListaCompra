import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

export const PANADERIA: Product[] = [
  // Pan
  p('barra-cuarto',     'Barra de cuarto',         '🥖', 'pan-pan'),
  p('barra-pueblo',     'Barra de pueblo',         '🥖', 'pan-pan'),
  p('hogaza',           'Hogaza',                  '🍞', 'pan-pan'),
  p('pan-payes',        'Pan payés',               '🍞', 'pan-pan'),
  p('pan-integral',     'Pan integral',            '🍞', 'pan-pan'),
  p('pan-centeno',      'Pan de centeno',          '🍞', 'pan-pan'),
  p('pan-espelta',      'Pan de espelta',          '🍞', 'pan-pan'),
  p('pan-semillas',     'Pan de semillas',         '🍞', 'pan-pan'),
  p('chapata',          'Chapata',                 '🥖', 'pan-pan'),
  p('baguette',         'Baguette',                '🥖', 'pan-pan'),
  p('pan-molde',        'Pan de molde',            '🍞', 'pan-pan', 'paquete'),
  p('pan-molde-integral','Pan de molde integral',  '🍞', 'pan-pan', 'paquete'),
  p('pan-bocadillo',    'Pan de bocadillo',        '🥖', 'pan-pan'),
  p('pan-hamburguesa',  'Pan de hamburguesa',      '🍔', 'pan-pan', 'paquete'),
  p('pan-perrito',      'Pan de perrito',          '🌭', 'pan-pan', 'paquete'),
  p('picos',            'Picos',                   '🥨', 'pan-pan', 'paquete'),
  p('regañas',          'Regañás',                 '🥨', 'pan-pan', 'paquete'),
  p('pan-rallado',      'Pan rallado',             '🍞', 'pan-pan', 'paquete'),
  // Bollería
  p('croissant',        'Croissant',               '🥐', 'pan-bolleria'),
  p('napolitana-choc',  'Napolitana de chocolate', '🥐', 'pan-bolleria'),
  p('palmera',          'Palmera',                 '🥐', 'pan-bolleria'),
  p('caracola',         'Caracola',                '🥐', 'pan-bolleria'),
  p('donut',            'Donut',                   '🍩', 'pan-bolleria'),
  p('magdalena',        'Magdalena',               '🧁', 'pan-bolleria', 'paquete'),
  p('bizcocho',         'Bizcocho',                '🍰', 'pan-bolleria'),
  p('ensaimada',        'Ensaimada',               '🥐', 'pan-bolleria'),
  p('bollo-leche',      'Bollo de leche',          '🥖', 'pan-bolleria'),
  p('rosquillas',       'Rosquillas',              '🥯', 'pan-bolleria', 'paquete'),
  p('canutillos',       'Canutillos de bilbao',    '🥐', 'pan-bolleria'),
  p('pastel-arroz',     'Pastel de arroz',         '🍰', 'pan-bolleria'),
  p('jesuita',          'Jesuita',                 '🥐', 'pan-bolleria'),
  p('roscón-reyes',     'Roscón de reyes',         '🎂', 'pan-bolleria'),
  // Tartas / postres
  p('tarta-queso',      'Tarta de queso',          '🍰', 'pan-tartas'),
  p('tarta-manzana',    'Tarta de manzana',        '🥧', 'pan-tartas'),
  p('tarta-chocolate',  'Tarta de chocolate',      '🎂', 'pan-tartas'),
  p('pantxineta',       'Pantxineta',              '🥧', 'pan-tartas'),
  p('goxua',            'Goxua',                   '🍰', 'pan-tartas'),
  p('tarta-santiago',   'Tarta de santiago',       '🥧', 'pan-tartas'),
  p('milhojas',         'Milhojas',                '🍰', 'pan-tartas'),
  p('brownie',          'Brownie',                 '🍫', 'pan-tartas'),
];
