import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'kg'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Pescadería — fuerte presencia de productos del Cantábrico. */
export const PESCADERIA: Product[] = [
  // Pescado fresco
  p('merluza-pintxo',   'Merluza de pintxo',     '🐟', 'pes-pescado'),
  p('bacalao-fresco',   'Bacalao fresco',        '🐟', 'pes-pescado'),
  p('rodaballo',        'Rodaballo',             '🐟', 'pes-pescado'),
  p('lenguado',         'Lenguado',              '🐟', 'pes-pescado'),
  p('lubina',           'Lubina',                '🐟', 'pes-pescado'),
  p('dorada',           'Dorada',                '🐟', 'pes-pescado'),
  p('besugo',           'Besugo',                '🐟', 'pes-pescado'),
  p('rape',             'Rape',                  '🐟', 'pes-pescado'),
  p('cabracho',         'Cabracho',              '🐟', 'pes-pescado'),
  p('bonito-norte',     'Bonito del norte',      '🐟', 'pes-pescado'),
  p('atun-rojo',        'Atún rojo',             '🐟', 'pes-pescado'),
  p('chicharro',        'Chicharro',             '🐟', 'pes-pescado'),
  p('verdel',           'Verdel (caballa)',      '🐟', 'pes-pescado'),
  p('sardina',          'Sardina',               '🐟', 'pes-pescado'),
  p('anchoa-fresca',    'Anchoa (antxoa) fresca','🐟', 'pes-pescado'),
  p('salmon',           'Salmón',                '🐟', 'pes-pescado'),
  p('trucha',           'Trucha',                '🐟', 'pes-pescado'),
  p('kokotxas-merluza', 'Kokotxas de merluza',   '🐟', 'pes-pescado'),
  p('kokotxas-bacalao', 'Kokotxas de bacalao',   '🐟', 'pes-pescado'),
  p('chipirones',       'Chipirones',            '🦑', 'pes-pescado'),
  p('calamar',          'Calamar',               '🦑', 'pes-pescado'),
  p('pulpo',            'Pulpo',                 '🐙', 'pes-pescado'),
  // Marisco
  p('almeja',           'Almeja',                '🦪', 'pes-marisco'),
  p('mejillon',         'Mejillón',              '🦪', 'pes-marisco'),
  p('berberecho',       'Berberecho',            '🦪', 'pes-marisco'),
  p('navaja',           'Navaja',                '🦪', 'pes-marisco'),
  p('ostra',            'Ostra',                 '🦪', 'pes-marisco', 'unidad'),
  p('gamba-blanca',     'Gamba blanca',          '🦐', 'pes-marisco'),
  p('langostino',       'Langostino',            '🦐', 'pes-marisco'),
  p('quisquilla',       'Quisquilla',            '🦐', 'pes-marisco'),
  p('cigala',           'Cigala',                '🦞', 'pes-marisco'),
  p('bogavante',        'Bogavante',             '🦞', 'pes-marisco', 'unidad'),
  p('nécora',           'Nécora',                '🦀', 'pes-marisco'),
  p('buey-de-mar',      'Buey de mar',           '🦀', 'pes-marisco', 'unidad'),
  p('centollo',         'Centollo',              '🦀', 'pes-marisco', 'unidad'),
  p('percebe',          'Percebe',               '🦀', 'pes-marisco'),
  // Conservas / ahumados
  p('anchoas-aceite',   'Anchoas en aceite',     '🥫', 'pes-conserva', 'unidad'),
  p('bonito-aceite',    'Bonito en aceite',      '🥫', 'pes-conserva', 'unidad'),
  p('mejillones-escabeche','Mejillones en escabeche','🥫','pes-conserva','unidad'),
  p('sardinillas',      'Sardinillas',           '🥫', 'pes-conserva', 'unidad'),
  p('salmon-ahumado',   'Salmón ahumado',        '🐟', 'pes-conserva', 'paquete'),
  p('bacalao-salado',   'Bacalao salado',        '🐟', 'pes-conserva'),
];
