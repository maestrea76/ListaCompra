import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: 'sup-bebidas',
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Refrescos con azúcar, light/zero, té, zumos y especialidades brasileñas
 *  habituales (guaraná, frutas tropicales). Complementa bebidas.ts. */
export const BEBIDAS_EXTRA: Product[] = [
  // Cola
  p('cocacola-light',  'Coca-Cola Light',         '🥤'),
  p('cocacola-cherry', 'Coca-Cola Cherry',        '🥤'),
  p('cocacola-vainilla','Coca-Cola Vainilla',     '🥤'),
  p('cocacola-sin-cafeina','Coca-Cola sin cafeína','🥤'),
  p('pepsi',           'Pepsi',                   '🥤'),
  p('pepsi-max',       'Pepsi Max',               '🥤'),
  p('pepsi-light',     'Pepsi Light',             '🥤'),

  // Naranja / limón / otros sabores
  p('fanta-uva',       'Fanta uva',               '🥤'),
  p('fanta-fresa',     'Fanta fresa',             '🥤'),
  p('fanta-piña',      'Fanta piña',              '🥤'),
  p('trinaranjus-naranja','Trinaranjus naranja',  '🍊'),
  p('trinaranjus-limon','Trinaranjus limón',      '🍋'),
  p('mirinda',         'Mirinda',                 '🥤'),
  p('sprite',          'Sprite',                  '🥤'),
  p('seven-up',        '7 Up',                    '🥤'),
  p('schweppes-naranja','Schweppes naranja',      '🥤'),
  p('schweppes-limon', 'Schweppes limón',         '🥤'),
  p('schweppes-tonica','Schweppes tónica',        '🥤'),
  p('bitter-kas',      'Bitter Kas',              '🥤'),
  p('kas-naranja',     'Kas naranja',             '🥤'),
  p('kas-limon',       'Kas limón',               '🥤'),

  // Té frío
  p('nestea-limon',    'Nestea limón',            '🧃'),
  p('nestea-melocoton','Nestea melocotón',        '🧃'),
  p('nestea-mango',    'Nestea mango y piña',     '🧃'),
  p('nestea-verde',    'Nestea té verde',         '🧃'),
  p('te-limon-frio',   'Té con limón',            '🧃'),
  p('te-melocoton-frio','Té con melocotón',       '🧃'),
  p('lipton-ice-tea',  'Lipton Ice Tea',          '🧃'),
  p('arizona',         'Arizona Iced Tea',        '🧃'),

  // Isotónicas / vitamínicas
  p('aquarius-naranja','Aquarius naranja',        '💧'),
  p('aquarius-limon-extra','Aquarius limón',      '💧'),
  p('powerade',        'Powerade',                '💧'),
  p('gatorade',        'Gatorade',                '💧'),

  // Energéticas
  p('red-bull',        'Red Bull',                '⚡'),
  p('red-bull-sin-azucar','Red Bull sin azúcar',  '⚡'),
  p('monster-energy',  'Monster Energy',          '⚡'),
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
  p('guarana-antarctica','Guaraná Antarctica',    '🥤'),
  p('guarana-brahma',  'Guaraná Brahma',          '🥤'),
  p('zumo-guayaba',    'Zumo de guayaba',         '🥭'),
  p('zumo-maracuya',   'Zumo de maracuyá',        '🥭'),
  p('zumo-acai',       'Zumo de açaí',            '🫐'),
  p('zumo-caju',       'Zumo de cajú',            '🥭'),
  p('zumo-fruta-pasion','Zumo de fruta de la pasión','🥭'),
  p('caldo-cana',      'Caldo de caña',           '🌾'),
  p('cachaca',         'Cachaça',                 '🥃'),
  p('inca-kola',       'Inca Kola',               '🥤'),
  p('jarritos',        'Jarritos',                '🥤'),
  p('chinotto',        'Chinotto',                '🥤'),
  p('mate-cola',       'Club-Mate / mate cola',   '🍵'),
];
