import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: 'sup-bebidas',
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Refrescos con azúcar, light/zero, té, zumos y especialidades brasileñas
 *  habituales (guaraná, frutas tropicales). Complementa bebidas.ts. */
export const BEBIDAS_EXTRA: Product[] = [
  // Cola
  p('cocacola-light',  'Coca-cola light',         '🥤'),
  p('cocacola-cherry', 'Coca-cola cherry',        '🥤'),
  p('cocacola-vainilla','Coca-cola vainilla',     '🥤'),
  p('cocacola-sin-cafeina','Coca-cola sin cafeína','🥤'),
  p('pepsi',           'Pepsi',                   '🥤'),
  p('pepsi-max',       'Pepsi max',               '🥤'),
  p('pepsi-light',     'Pepsi light',             '🥤'),

  // Naranja / limón / otros sabores
  p('fanta-uva',       'Fanta uva',               '🥤'),
  p('fanta-fresa',     'Fanta fresa',             '🥤'),
  p('fanta-piña',      'Fanta piña',              '🥤'),
  p('trinaranjus-naranja','Trinaranjus naranja',  '🍊'),
  p('trinaranjus-limon','Trinaranjus limón',      '🍋'),
  p('mirinda',         'Mirinda',                 '🥤'),
  p('sprite',          'Sprite',                  '🥤'),
  p('seven-up',        '7 up',                    '🥤'),
  p('schweppes-naranja','Schweppes naranja',      '🥤'),
  p('schweppes-limon', 'Schweppes limón',         '🥤'),
  p('schweppes-tonica','Schweppes tónica',        '🥤'),
  p('bitter-kas',      'Bitter kas',              '🥤'),
  p('kas-naranja',     'Kas naranja',             '🥤'),
  p('kas-limon',       'Kas limón',               '🥤'),

  // Té frío
  p('nestea-limon',    'Nestea limón',            '🧃'),
  p('nestea-melocoton','Nestea melocotón',        '🧃'),
  p('nestea-mango',    'Nestea mango y piña',     '🧃'),
  p('nestea-verde',    'Nestea té verde',         '🧃'),
  p('te-limon-frio',   'Té con limón',            '🧃'),
  p('te-melocoton-frio','Té con melocotón',       '🧃'),
  p('lipton-ice-tea',  'Lipton ice tea',          '🧃'),
  p('arizona',         'Arizona iced tea',        '🧃'),

  // Isotónicas / vitamínicas
  p('aquarius-naranja','Aquarius naranja',        '💧'),
  p('aquarius-limon-extra','Aquarius limón',      '💧'),
  p('powerade',        'Powerade',                '💧'),
  p('gatorade',        'Gatorade',                '💧'),

  // Energéticas
  p('red-bull',        'Red bull',                '⚡'),
  p('red-bull-sin-azucar','Red bull sin azúcar',  '⚡'),
  p('monster-energy',  'Monster energy',          '⚡'),
  p('burn',            'Burn',                    '⚡'),
  p('rockstar',        'Rockstar',                '⚡'),

  // Zumos clásicos
  p('zumo-manzana-extra','Zumo de manzana',       '🍎'),
  p('zumo-pera',       'Zumo de pera',            '🍐'),
  p('zumo-uva',        'Zumo de uva',             '🍇'),
  p('zumo-tomate',     'Zumo de tomate',          '🍅'),
  p('zumo-tropical',   'Zumo tropical',           '🌴'),
  p('zumo-multifrutas','Zumo multifrutas',        '🧃'),
  p('zumo-frutos-rojos','Zumo de frutos rojos',   '🫐'),
  p('zumo-arandano',   'Zumo de arándano',        '🫐'),
  p('zumo-granada',    'Zumo de granada',         '🥭'),
  p('zumo-mango',      'Zumo de mango',           '🥭'),
  p('zumo-papaya',     'Zumo de papaya',          '🥭'),
  p('zumo-limonada',   'Limonada',                '🍋'),
  p('horchata',        'Horchata',                '🥛'),

  // Brasileños / latinoamericanos
  p('guarana-antarctica','Guaraná antarctica',    '🥤'),
  p('guarana-brahma',  'Guaraná brahma',          '🥤'),
  p('zumo-guayaba',    'Zumo de guayaba',         '🥭'),
  p('zumo-maracuya',   'Zumo de maracuyá',        '🥭'),
  p('zumo-acai',       'Zumo de açaí',            '🫐'),
  p('zumo-caju',       'Zumo de cajú',            '🥭'),
  p('zumo-fruta-pasion','Zumo de fruta de la pasión','🥭'),
  p('caldo-cana',      'Caldo de caña',           '🌾'),
  p('cachaca',         'Cachaça',                 '🥃'),
  p('inca-kola',       'Inca kola',               '🥤'),
  p('jarritos',        'Jarritos',                '🥤'),
  p('chinotto',        'Chinotto',                '🥤'),
  p('mate-cola',       'Club-mate / mate cola',   '🍵'),
];
