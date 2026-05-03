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
  p('vt-rioja',           'Vino tinto Rioja',                 '🍷', 'sup-bebidas'),
  p('vt-rioja-crianza',   'Vino tinto Rioja crianza',         '🍷', 'sup-bebidas'),
  p('vt-rioja-reserva',   'Vino tinto Rioja reserva',         '🍷', 'sup-bebidas'),
  p('vt-rioja-gran-res',  'Vino tinto Rioja gran reserva',    '🍷', 'sup-bebidas'),
  p('vt-ribera-duero',    'Vino tinto Ribera del Duero',      '🍷', 'sup-bebidas'),
  p('vt-toro',            'Vino tinto Toro',                  '🍷', 'sup-bebidas'),
  p('vt-bierzo',          'Vino tinto Bierzo',                '🍷', 'sup-bebidas'),
  p('vt-priorat',         'Vino tinto Priorat',               '🍷', 'sup-bebidas'),
  p('vt-montsant',        'Vino tinto Montsant',              '🍷', 'sup-bebidas'),
  p('vt-navarra',         'Vino tinto Navarra',               '🍷', 'sup-bebidas'),
  p('vt-somontano',       'Vino tinto Somontano',             '🍷', 'sup-bebidas'),
  p('vt-penedes',         'Vino tinto Penedès',               '🍷', 'sup-bebidas'),
  p('vt-jumilla',         'Vino tinto Jumilla',               '🍷', 'sup-bebidas'),
  p('vt-yecla',           'Vino tinto Yecla',                 '🍷', 'sup-bebidas'),
  p('vt-la-mancha',       'Vino tinto La Mancha',             '🍷', 'sup-bebidas'),
  p('vt-valdepenas',      'Vino tinto Valdepeñas',            '🍷', 'sup-bebidas'),
  p('vt-calatayud',       'Vino tinto Calatayud',             '🍷', 'sup-bebidas'),
  p('vt-campo-borja',     'Vino tinto Campo de Borja',        '🍷', 'sup-bebidas'),
  p('vt-carinena',        'Vino tinto Cariñena',              '🍷', 'sup-bebidas'),
  p('vt-mentrida',        'Vino tinto Méntrida',              '🍷', 'sup-bebidas'),
  p('vt-utiel-requena',   'Vino tinto Utiel-Requena',         '🍷', 'sup-bebidas'),
  p('vt-rias-baixas',     'Vino tinto Rías Baixas',           '🍷', 'sup-bebidas'),

  // Blancos españoles
  p('vb-rias-baixas',     'Vino blanco Rías Baixas',          '🥂', 'sup-bebidas'),
  p('vb-albarino',        'Vino blanco albariño',             '🥂', 'sup-bebidas'),
  p('vb-rueda',           'Vino blanco Rueda',                '🥂', 'sup-bebidas'),
  p('vb-verdejo',         'Vino blanco verdejo',              '🥂', 'sup-bebidas'),
  p('vb-godello',         'Vino blanco godello',              '🥂', 'sup-bebidas'),
  p('vb-ribeiro',         'Vino blanco Ribeiro',              '🥂', 'sup-bebidas'),
  p('vb-valdeorras',      'Vino blanco Valdeorras',           '🥂', 'sup-bebidas'),
  p('vb-monterrei',       'Vino blanco Monterrei',            '🥂', 'sup-bebidas'),
  p('vb-rioja',           'Vino blanco Rioja',                '🥂', 'sup-bebidas'),
  p('vb-penedes',         'Vino blanco Penedès',              '🥂', 'sup-bebidas'),
  p('vb-somontano',       'Vino blanco Somontano',            '🥂', 'sup-bebidas'),
  p('vb-txakoli-getaria', 'Vino blanco txakoli de Getaria',   '🥂', 'sup-bebidas'),
  p('vb-txakoli-bizkaia', 'Vino blanco txakoli de Bizkaia',   '🥂', 'sup-bebidas'),
  p('vb-txakoli-alava',   'Vino blanco txakoli de Álava',     '🥂', 'sup-bebidas'),
  p('vb-moscatel',        'Vino blanco moscatel',             '🥂', 'sup-bebidas'),

  // Rosados
  p('vr-navarra',         'Vino rosado Navarra',              '🌸', 'sup-bebidas'),
  p('vr-cigales',         'Vino rosado Cigales',              '🌸', 'sup-bebidas'),
  p('vr-rioja',           'Vino rosado Rioja',                '🌸', 'sup-bebidas'),
  p('vr-provence',        'Vino rosado Provence',             '🌸', 'sup-bebidas'),

  // Espumosos / generosos
  p('cava-penedes',       'Cava Penedès',                     '🍾', 'sup-bebidas'),
  p('cava-reserva',       'Cava reserva',                     '🍾', 'sup-bebidas'),
  p('vino-jerez-fino',    'Vino fino Jerez',                  '🍷', 'sup-bebidas'),
  p('vino-jerez-amontillado','Vino amontillado Jerez',        '🍷', 'sup-bebidas'),
  p('vino-jerez-oloroso', 'Vino oloroso Jerez',               '🍷', 'sup-bebidas'),
  p('vino-jerez-px',      'Vino Pedro Ximénez Jerez',         '🍷', 'sup-bebidas'),
  p('vino-manzanilla',    'Vino manzanilla Sanlúcar',         '🍷', 'sup-bebidas'),
  p('vino-malaga',        'Vino dulce Málaga',                '🍷', 'sup-bebidas'),

  // Importados (tintos)
  p('vt-bordeaux',        'Vino tinto Bordeaux',              '🍷', 'sup-bebidas'),
  p('vt-borgona',         'Vino tinto Borgoña',               '🍷', 'sup-bebidas'),
  p('vt-cotes-rhone',     'Vino tinto Côtes du Rhône',        '🍷', 'sup-bebidas'),
  p('vt-beaujolais',      'Vino tinto Beaujolais',            '🍷', 'sup-bebidas'),
  p('vt-chianti',         'Vino tinto Chianti',               '🍷', 'sup-bebidas'),
  p('vt-barolo',          'Vino tinto Barolo',                '🍷', 'sup-bebidas'),
  p('vt-malbec-mendoza',  'Vino tinto malbec Mendoza',        '🍷', 'sup-bebidas'),
  p('vt-rioja-alta',      'Vino tinto Rioja Alta',            '🍷', 'sup-bebidas'),

  // Importados (blancos)
  p('vb-chablis',         'Vino blanco Chablis',              '🥂', 'sup-bebidas'),
  p('vb-sancerre',        'Vino blanco Sancerre',             '🥂', 'sup-bebidas'),
  p('vb-sauternes',       'Vino blanco Sauternes',            '🥂', 'sup-bebidas'),
  p('vb-riesling',        'Vino blanco riesling Mosel',       '🥂', 'sup-bebidas'),
  p('vb-chardonnay',      'Vino blanco chardonnay Borgoña',   '🥂', 'sup-bebidas'),
  p('vb-vinho-verde',     'Vino blanco Vinho Verde',          '🥂', 'sup-bebidas'),
];
