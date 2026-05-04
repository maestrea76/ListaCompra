import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Vinos por color y origen — formato "Vino [color] [denominación]".
 *  La denominación de origen va al final para que el filtro alfabético
 *  agrupe primero por color. */
export const VINOS: Product[] = [
  // Tintos españoles
  p('vt-rioja',           'Vino tinto rioja',                 '🍷', 'sup-bebidas'),
  p('vt-rioja-crianza',   'Vino tinto rioja crianza',         '🍷', 'sup-bebidas'),
  p('vt-rioja-reserva',   'Vino tinto rioja reserva',         '🍷', 'sup-bebidas'),
  p('vt-rioja-gran-res',  'Vino tinto rioja gran reserva',    '🍷', 'sup-bebidas'),
  p('vt-ribera-duero',    'Vino tinto ribera del duero',      '🍷', 'sup-bebidas'),
  p('vt-toro',            'Vino tinto toro',                  '🍷', 'sup-bebidas'),
  p('vt-bierzo',          'Vino tinto bierzo',                '🍷', 'sup-bebidas'),
  p('vt-priorat',         'Vino tinto priorat',               '🍷', 'sup-bebidas'),
  p('vt-montsant',        'Vino tinto montsant',              '🍷', 'sup-bebidas'),
  p('vt-navarra',         'Vino tinto navarra',               '🍷', 'sup-bebidas'),
  p('vt-somontano',       'Vino tinto somontano',             '🍷', 'sup-bebidas'),
  p('vt-penedes',         'Vino tinto penedès',               '🍷', 'sup-bebidas'),
  p('vt-jumilla',         'Vino tinto jumilla',               '🍷', 'sup-bebidas'),
  p('vt-yecla',           'Vino tinto yecla',                 '🍷', 'sup-bebidas'),
  p('vt-la-mancha',       'Vino tinto la mancha',             '🍷', 'sup-bebidas'),
  p('vt-valdepenas',      'Vino tinto valdepeñas',            '🍷', 'sup-bebidas'),
  p('vt-calatayud',       'Vino tinto calatayud',             '🍷', 'sup-bebidas'),
  p('vt-campo-borja',     'Vino tinto campo de borja',        '🍷', 'sup-bebidas'),
  p('vt-carinena',        'Vino tinto cariñena',              '🍷', 'sup-bebidas'),
  p('vt-mentrida',        'Vino tinto méntrida',              '🍷', 'sup-bebidas'),
  p('vt-utiel-requena',   'Vino tinto utiel-requena',         '🍷', 'sup-bebidas'),
  p('vt-rias-baixas',     'Vino tinto rías baixas',           '🍷', 'sup-bebidas'),

  // Blancos españoles
  p('vb-rias-baixas',     'Vino blanco rías baixas',          '🥂', 'sup-bebidas'),
  p('vb-albarino',        'Vino blanco albariño',             '🥂', 'sup-bebidas'),
  p('vb-rueda',           'Vino blanco rueda',                '🥂', 'sup-bebidas'),
  p('vb-verdejo',         'Vino blanco verdejo',              '🥂', 'sup-bebidas'),
  p('vb-godello',         'Vino blanco godello',              '🥂', 'sup-bebidas'),
  p('vb-ribeiro',         'Vino blanco ribeiro',              '🥂', 'sup-bebidas'),
  p('vb-valdeorras',      'Vino blanco valdeorras',           '🥂', 'sup-bebidas'),
  p('vb-monterrei',       'Vino blanco monterrei',            '🥂', 'sup-bebidas'),
  p('vb-rioja',           'Vino blanco rioja',                '🥂', 'sup-bebidas'),
  p('vb-penedes',         'Vino blanco penedès',              '🥂', 'sup-bebidas'),
  p('vb-somontano',       'Vino blanco somontano',            '🥂', 'sup-bebidas'),
  p('vb-txakoli-getaria', 'Vino blanco txakoli de getaria',   '🥂', 'sup-bebidas'),
  p('vb-txakoli-bizkaia', 'Vino blanco txakoli de bizkaia',   '🥂', 'sup-bebidas'),
  p('vb-txakoli-alava',   'Vino blanco txakoli de álava',     '🥂', 'sup-bebidas'),
  p('vb-moscatel',        'Vino blanco moscatel',             '🥂', 'sup-bebidas'),

  // Rosados
  p('vr-navarra',         'Vino rosado navarra',              '🌸', 'sup-bebidas'),
  p('vr-cigales',         'Vino rosado cigales',              '🌸', 'sup-bebidas'),
  p('vr-rioja',           'Vino rosado rioja',                '🌸', 'sup-bebidas'),
  p('vr-provence',        'Vino rosado provence',             '🌸', 'sup-bebidas'),

  // Espumosos / generosos
  p('cava-penedes',       'Cava penedès',                     '🍾', 'sup-bebidas'),
  p('cava-reserva',       'Cava reserva',                     '🍾', 'sup-bebidas'),
  p('vino-jerez-fino',    'Vino fino jerez',                  '🍷', 'sup-bebidas'),
  p('vino-jerez-amontillado','Vino amontillado jerez',        '🍷', 'sup-bebidas'),
  p('vino-jerez-oloroso', 'Vino oloroso jerez',               '🍷', 'sup-bebidas'),
  p('vino-jerez-px',      'Vino pedro ximénez jerez',         '🍷', 'sup-bebidas'),
  p('vino-manzanilla',    'Vino manzanilla sanlúcar',         '🍷', 'sup-bebidas'),
  p('vino-malaga',        'Vino dulce málaga',                '🍷', 'sup-bebidas'),

  // Importados (tintos)
  p('vt-bordeaux',        'Vino tinto bordeaux',              '🍷', 'sup-bebidas'),
  p('vt-borgona',         'Vino tinto borgoña',               '🍷', 'sup-bebidas'),
  p('vt-cotes-rhone',     'Vino tinto côtes du rhône',        '🍷', 'sup-bebidas'),
  p('vt-beaujolais',      'Vino tinto beaujolais',            '🍷', 'sup-bebidas'),
  p('vt-chianti',         'Vino tinto chianti',               '🍷', 'sup-bebidas'),
  p('vt-barolo',          'Vino tinto barolo',                '🍷', 'sup-bebidas'),
  p('vt-malbec-mendoza',  'Vino tinto malbec mendoza',        '🍷', 'sup-bebidas'),
  p('vt-rioja-alta',      'Vino tinto rioja alta',            '🍷', 'sup-bebidas'),

  // Importados (blancos)
  p('vb-chablis',         'Vino blanco chablis',              '🥂', 'sup-bebidas'),
  p('vb-sancerre',        'Vino blanco sancerre',             '🥂', 'sup-bebidas'),
  p('vb-sauternes',       'Vino blanco sauternes',            '🥂', 'sup-bebidas'),
  p('vb-riesling',        'Vino blanco riesling mosel',       '🥂', 'sup-bebidas'),
  p('vb-chardonnay',      'Vino blanco chardonnay borgoña',   '🥂', 'sup-bebidas'),
  p('vb-vinho-verde',     'Vino blanco vinho verde',          '🥂', 'sup-bebidas'),
];
