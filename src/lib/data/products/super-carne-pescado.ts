import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'kg'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Carne en supermercado (sup-carniceria) y pescado en supermercado
 *  (sup-pescaderia). Son los productos que sueles comprar en
 *  Eroski/Mercadona/Lidl/Día/Carrefour por la sección de fresco. */

export const SUPER_CARNE: Product[] = [
  // Vacuno
  p('sup-chuleta-vaca',    'Chuleta de vaca',       '🥩', 'sup-carniceria'),
  p('sup-txuleta-vaca',    'Txuleta de vaca vieja', '🥩', 'sup-carniceria'),
  p('sup-txuleta-buey',    'Txuleta de buey',       '🥩', 'sup-carniceria'),
  p('sup-filete-ternera',  'Filete de ternera',     '🥩', 'sup-carniceria'),
  p('sup-entrecot-super',  'Entrecot',              '🥩', 'sup-carniceria'),
  p('sup-solomillo-tern',  'Solomillo de ternera',  '🥩', 'sup-carniceria'),
  p('sup-redondo-tern',    'Redondo de ternera',    '🥩', 'sup-carniceria'),
  p('sup-aguja-ternera',   'Aguja de ternera',      '🥩', 'sup-carniceria'),
  p('sup-carne-picada-mix','Carne picada mixta',    '🥩', 'sup-carniceria'),
  p('sup-carne-picada-tern','Carne picada ternera', '🥩', 'sup-carniceria'),
  p('sup-rabo-buey',       'Rabo de buey',          '🥩', 'sup-carniceria'),
  p('sup-carrillera',      'Carrillera',            '🥩', 'sup-carniceria'),
  p('sup-osobuco',         'Ossobuco',              '🥩', 'sup-carniceria'),
  // Cerdo
  p('sup-chuleta-cerdo',   'Chuleta de cerdo',      '🥓', 'sup-carniceria'),
  p('sup-lomo-cerdo',      'Lomo de cerdo',         '🥓', 'sup-carniceria'),
  p('sup-solomillo-cerdo', 'Solomillo de cerdo',    '🥓', 'sup-carniceria'),
  p('sup-costilla-cerdo',  'Costilla de cerdo',     '🥓', 'sup-carniceria'),
  p('sup-panceta',         'Panceta',               '🥓', 'sup-carniceria'),
  p('sup-secreto-iberico', 'Secreto ibérico',       '🥓', 'sup-carniceria'),
  p('sup-presa-iberica',   'Presa ibérica',         '🥓', 'sup-carniceria'),
  p('sup-pluma-iberica',   'Pluma ibérica',         '🥓', 'sup-carniceria'),
  // Cordero
  p('sup-chuletillas-cord','Chuletillas de cordero','🍖', 'sup-carniceria'),
  p('sup-paletilla-cord',  'Paletilla de cordero',  '🍖', 'sup-carniceria'),
  // Aves
  p('sup-pollo-entero',    'Pollo entero',          '🐔', 'sup-carniceria', 'unidad'),
  p('sup-pechuga-pollo',   'Pechuga de pollo',      '🐔', 'sup-carniceria'),
  p('sup-muslo-pollo',     'Muslos de pollo',       '🐔', 'sup-carniceria'),
  p('sup-alitas-pollo',    'Alitas de pollo',       '🐔', 'sup-carniceria'),
  p('sup-contramuslos',    'Contramuslos de pollo', '🐔', 'sup-carniceria'),
  p('sup-pavo-pechuga',    'Pechuga de pavo',       '🦃', 'sup-carniceria'),
  p('sup-pavo-fileteado',  'Pavo fileteado',        '🦃', 'sup-carniceria'),
  p('sup-conejo',          'Conejo',                '🐰', 'sup-carniceria'),
  p('sup-codorniz-super',  'Codornices',            '🐦', 'sup-carniceria', 'unidad'),
  // Embutido fresco / preparados
  p('sup-chorizo-fresco',  'Chorizo fresco',        '🌭', 'sup-carniceria'),
  p('sup-morcilla-burgos', 'Morcilla de burgos',    '🌭', 'sup-carniceria'),
  p('sup-morcilla-arroz',  'Morcilla de arroz',     '🌭', 'sup-carniceria'),
  p('sup-salchicha-fresca','Salchicha fresca',      '🌭', 'sup-carniceria'),
  p('sup-butifarra',       'Butifarra',             '🌭', 'sup-carniceria'),
  p('sup-hamburguesa-fr',  'Hamburguesa fresca',    '🍔', 'sup-carniceria', 'unidad'),
  p('sup-albondigas-fr',   'Albóndigas frescas',    '🍡', 'sup-carniceria'),
  p('sup-pinchos-moruno',  'Pinchos morunos',       '🍢', 'sup-carniceria'),
  p('sup-flamenquin',      'Flamenquín',            '🥩', 'sup-carniceria', 'unidad'),
  p('sup-san-jacobo',      'San jacobo',            '🥪', 'sup-carniceria', 'unidad'),
  p('sup-libritos',        'Libritos de lomo',      '🥪', 'sup-carniceria', 'unidad'),
];

export const SUPER_PESCADO: Product[] = [
  // Pescado fresco
  p('sup-merluza',         'Merluza',               '🐟', 'sup-pescaderia'),
  p('sup-merluza-pintxo',  'Merluza de pintxo',     '🐟', 'sup-pescaderia'),
  p('sup-bacalao-fresco',  'Bacalao fresco',        '🐟', 'sup-pescaderia'),
  p('sup-bacalao-salado',  'Bacalao salado',        '🐟', 'sup-pescaderia'),
  p('sup-rape',            'Rape',                  '🐟', 'sup-pescaderia'),
  p('sup-rodaballo-super', 'Rodaballo',             '🐟', 'sup-pescaderia'),
  p('sup-lenguado-super',  'Lenguado',              '🐟', 'sup-pescaderia'),
  p('sup-lubina',          'Lubina',                '🐟', 'sup-pescaderia'),
  p('sup-dorada',          'Dorada',                '🐟', 'sup-pescaderia'),
  p('sup-besugo-super',    'Besugo',                '🐟', 'sup-pescaderia'),
  p('sup-cabracho-super',  'Cabracho',              '🐟', 'sup-pescaderia'),
  p('sup-bonito-norte',    'Bonito del norte',      '🐟', 'sup-pescaderia'),
  p('sup-atun-rojo',       'Atún rojo',             '🐟', 'sup-pescaderia'),
  p('sup-chicharro-super', 'Chicharro',             '🐟', 'sup-pescaderia'),
  p('sup-verdel',          'Verdel (caballa)',      '🐟', 'sup-pescaderia'),
  p('sup-sardina-fresca',  'Sardina fresca',        '🐟', 'sup-pescaderia'),
  p('sup-anchoa-fresca',   'Anchoa fresca',         '🐟', 'sup-pescaderia'),
  p('sup-boquerones',      'Boquerones',            '🐟', 'sup-pescaderia'),
  p('sup-salmon-fresco',   'Salmón fresco',         '🐟', 'sup-pescaderia'),
  p('sup-trucha',          'Trucha',                '🐟', 'sup-pescaderia'),
  p('sup-panga',           'Panga',                 '🐟', 'sup-pescaderia'),
  p('sup-perca',           'Perca',                 '🐟', 'sup-pescaderia'),
  // Cefalópodos
  p('sup-chipirones-fr',   'Chipirones',            '🦑', 'sup-pescaderia'),
  p('sup-calamar-fresco',  'Calamar',               '🦑', 'sup-pescaderia'),
  p('sup-pulpo-fresco',    'Pulpo',                 '🐙', 'sup-pescaderia'),
  p('sup-sepia',           'Sepia',                 '🦑', 'sup-pescaderia'),
  // Marisco
  p('sup-gambas-frescas',  'Gambas frescas',        '🦐', 'sup-pescaderia'),
  p('sup-langostinos',     'Langostinos',           '🦐', 'sup-pescaderia'),
  p('sup-mejillon-super',  'Mejillón',              '🦪', 'sup-pescaderia'),
  p('sup-almeja-super',    'Almeja',                '🦪', 'sup-pescaderia'),
  p('sup-berberecho-super','Berberecho',            '🦪', 'sup-pescaderia'),
  p('sup-cigala-super',    'Cigala',                '🦞', 'sup-pescaderia'),
  p('sup-necora-super',    'Nécora',                '🦀', 'sup-pescaderia'),
  p('sup-buey-mar-super',  'Buey de mar',           '🦀', 'sup-pescaderia', 'unidad'),
  p('sup-centollo-super',  'Centollo',              '🦀', 'sup-pescaderia', 'unidad'),
  // Especialidades / preparados
  p('sup-kokotxas-merluza','Kokotxas de merluza',   '🐟', 'sup-pescaderia'),
  p('sup-kokotxas-bacalao','Kokotxas de bacalao',   '🐟', 'sup-pescaderia'),
  p('sup-rabas',           'Rabas',                 '🦑', 'sup-pescaderia', 'paquete'),
  p('sup-palitos-cangrejo','Palitos de cangrejo',   '🦀', 'sup-pescaderia', 'paquete'),
  p('sup-salmon-ahumado-s','Salmón ahumado',        '🐟', 'sup-pescaderia', 'paquete'),
  p('sup-anchoas-aceite',  'Anchoas en aceite',     '🥫', 'sup-pescaderia', 'unidad'),
  p('sup-bonito-bote-aoeva','Bonito en bote con aceite de oliva','🥫','sup-pescaderia','unidad'),
];
