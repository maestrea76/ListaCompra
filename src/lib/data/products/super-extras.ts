import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Productos típicos extra de supermercado español (Eroski, BM, Mercadona,
 *  Día, Lidl, Carrefour…). Cubre huecos del seed inicial: salsas, conservas
 *  vegetales, comidas preparadas, embutido envasado, helados, bollería
 *  industrial, etc. */

// Salsas y aderezos -> Despensa
export const SALSAS: Product[] = [
  p('mayonesa',          'Mayonesa',                '🥚','sup-despensa'),
  p('ketchup',           'Ketchup',                 '🍅','sup-despensa'),
  p('mostaza',           'Mostaza',                 '🌭','sup-despensa'),
  p('salsa-rosa',        'Salsa rosa',              '🦐','sup-despensa'),
  p('salsa-brava',       'Salsa brava',             '🥔','sup-despensa'),
  p('alioli',            'Alioli',                  '🧄','sup-despensa'),
  p('salsa-barbacoa',    'Salsa barbacoa',          '🍖','sup-despensa'),
  p('salsa-cesar',       'Salsa César',             '🥗','sup-despensa'),
  p('salsa-soja',        'Salsa de soja',           '🍶','sup-despensa'),
  p('salsa-pesto',       'Salsa pesto',             '🌿','sup-despensa'),
  p('salsa-boloñesa',    'Salsa boloñesa',          '🍝','sup-despensa'),
  p('salsa-carbonara',   'Salsa carbonara',         '🍝','sup-despensa'),
  p('salsa-tomate-frito','Tomate frito casero',     '🥫','sup-despensa'),
  p('sofrito',           'Sofrito',                 '🥫','sup-despensa'),
  p('vinagreta',         'Vinagreta',               '🥗','sup-despensa'),
];

// Conservas vegetales y snacks salados
export const CONSERVAS_VEG: Product[] = [
  p('atun-claro',        'Atún claro en aceite',    '🥫','sup-despensa','paquete'),
  p('atun-natural',      'Atún al natural',         '🥫','sup-despensa','paquete'),
  p('caballa-aceite',    'Caballa en aceite',       '🥫','sup-despensa'),
  p('mejillones-conserva','Mejillones en escabeche','🥫','sup-despensa'),
  p('sardinas-aceite',   'Sardinas en aceite',      '🥫','sup-despensa'),
  p('pimientos-piquillo','Pimientos del piquillo',  '🌶️','sup-despensa'),
  p('pimientos-asados',  'Pimientos asados',        '🌶️','sup-despensa'),
  p('esparragos-blancos','Espárragos blancos',      '🌱','sup-despensa'),
  p('esparragos-verdes', 'Espárragos verdes',       '🌱','sup-despensa'),
  p('alcachofas-conserva','Alcachofas en conserva', '🌿','sup-despensa'),
  p('maiz-dulce',        'Maíz dulce',              '🌽','sup-despensa'),
  p('judias-verdes-cons','Judías verdes en conserva','🌱','sup-despensa'),
  p('garbanzos-cocidos', 'Garbanzos cocidos',       '🫘','sup-despensa','unidad'),
  p('lentejas-cocidas',  'Lentejas cocidas',        '🫘','sup-despensa','unidad'),
  p('alubias-cocidas',   'Alubias cocidas',         '🫘','sup-despensa','unidad'),
  p('champiñones-cons',  'Champiñones en conserva', '🍄','sup-despensa'),
  p('aceitunas-negras',  'Aceitunas negras',        '🫒','sup-despensa'),
  p('aceitunas-gordal',  'Aceitunas gordal',        '🫒','sup-despensa'),
  p('encurtidos',        'Encurtidos variados',     '🫒','sup-despensa'),
  p('pepinillos',        'Pepinillos en vinagre',   '🥒','sup-despensa'),
  p('cebollitas',        'Cebollitas en vinagre',   '🧅','sup-despensa'),
  p('pate-ave',          'Paté de ave',             '🥫','sup-despensa'),
  p('pate-pimiento',     'Paté de pimiento',        '🥫','sup-despensa'),
  p('foie-gras',         'Foie gras',               '🥫','sup-despensa'),
];

// Comidas preparadas / refrigerados -> Despensa
export const PREPARADOS: Product[] = [
  p('tortilla-patata',   'Tortilla de patata',      '🥚','sup-despensa'),
  p('ensaladilla-rusa',  'Ensaladilla rusa',        '🥗','sup-despensa'),
  p('hummus',            'Hummus',                  '🌰','sup-despensa'),
  p('guacamole',         'Guacamole',               '🥑','sup-despensa'),
  p('gazpacho',          'Gazpacho',                '🍅','sup-despensa','l'),
  p('salmorejo',         'Salmorejo',               '🍅','sup-despensa','l'),
  p('crema-calabaza',    'Crema de calabaza',       '🎃','sup-despensa','l'),
  p('crema-verduras',    'Crema de verduras',       '🥦','sup-despensa','l'),
  p('caldo-cocido',      'Caldo de cocido',         '🍲','sup-despensa','l'),
  p('ensalada-bolsa',    'Ensalada en bolsa',       '🥗','sup-despensa','paquete'),
  p('rucula',            'Rúcula',                  '🥬','sup-despensa','paquete'),
  p('canonigos',         'Canónigos',               '🥬','sup-despensa','paquete'),
  p('pasta-fresca',      'Pasta fresca',            '🍝','sup-despensa','paquete'),
  p('pizza-fresca',      'Pizza fresca',            '🍕','sup-despensa'),
  p('masa-pizza',        'Masa de pizza',           '🥖','sup-despensa'),
  p('masa-empanada',     'Masa de empanada',        '🥟','sup-despensa'),
  p('masa-hojaldre',     'Masa de hojaldre',        '🥧','sup-despensa'),
  p('masa-quebrada',     'Masa quebrada',           '🥧','sup-despensa'),
];

// Embutido envasado y quesos loncheados -> Charcutería
export const ENVASADOS: Product[] = [
  p('jamon-cocido-loncha','Jamón cocido lonchas',   '🥪','sup-charcuteria','paquete'),
  p('jamon-serrano-loncha','Jamón serrano lonchas', '🍖','sup-charcuteria','paquete'),
  p('jamon-iberico-loncha','Jamón ibérico lonchas', '🍖','sup-charcuteria','paquete'),
  p('chorizo-loncha',    'Chorizo lonchas',         '🌭','sup-charcuteria','paquete'),
  p('salchichon-loncha', 'Salchichón lonchas',      '🌭','sup-charcuteria','paquete'),
  p('pavo-loncha',       'Pavo lonchas',            '🦃','sup-charcuteria','paquete'),
  p('pollo-loncha',      'Pollo lonchas',           '🐔','sup-charcuteria','paquete'),
  p('mortadela-loncha',  'Mortadela lonchas',       '🥪','sup-charcuteria','paquete'),
  p('queso-loncha-tierno','Queso tierno lonchas',   '🧀','sup-charcuteria','paquete'),
  p('queso-havarti',     'Queso havarti',           '🧀','sup-charcuteria','paquete'),
  p('queso-edam',        'Queso Edam',              '🧀','sup-charcuteria','paquete'),
  p('queso-emmental',    'Queso Emmental',          '🧀','sup-charcuteria','paquete'),
  p('mini-mozzarella',   'Mini mozzarella',         '🧀','sup-charcuteria'),
  p('queso-burgos-tarrina','Queso Burgos tarrina',  '🧀','sup-charcuteria'),
  p('salmon-ahumado-paq','Salmón ahumado',          '🐟','sup-charcuteria','paquete'),
  p('surimi',            'Surimi',                  '🦐','sup-charcuteria','paquete'),
];

// Helados extra -> Congelados
export const HELADOS: Product[] = [
  p('cucurucho',         'Cucurucho helado',        '🍦','sup-congelados','paquete'),
  p('sandwich-helado',   'Sándwich de helado',      '🍦','sup-congelados','paquete'),
  p('bombon-helado',     'Bombón helado',           '🍦','sup-congelados','paquete'),
  p('palito-helado',     'Polo de palito',          '🍡','sup-congelados','paquete'),
  p('helado-mantecado',  'Helado mantecado',        '🍦','sup-congelados'),
  p('helado-fresa',      'Helado de fresa',         '🍓','sup-congelados'),
  p('helado-limon',      'Helado de limón',         '🍋','sup-congelados'),
  p('helado-nata',       'Helado de nata',          '🍦','sup-congelados'),
  p('sorbete',           'Sorbete',                 '🍧','sup-congelados'),
  p('hielo-bolsa',       'Hielo en bolsa',          '🧊','sup-congelados','paquete'),
];

// Más bollería industrial / dulces -> Snacks
export const DULCES: Product[] = [
  p('magdalenas-pack',   'Magdalenas (pack)',       '🧁','sup-snacks','paquete'),
  p('sobaos',            'Sobaos pasiegos',         '🧁','sup-snacks','paquete'),
  p('quesadas',          'Quesadas pasiegas',       '🍰','sup-snacks','paquete'),
  p('mini-donuts',       'Mini donuts',             '🍩','sup-snacks','paquete'),
  p('palmeras-choco',    'Palmeras de chocolate',   '🥐','sup-snacks','paquete'),
  p('napolitanas-pack',  'Napolitanas (pack)',      '🥐','sup-snacks','paquete'),
  p('madalenas-cuatro',  'Magdalenas valencianas',  '🧁','sup-snacks','paquete'),
  p('croissants-pack',   'Croissants (pack)',       '🥐','sup-snacks','paquete'),
  p('galletas-choco',    'Galletas de chocolate',   '🍪','sup-snacks','paquete'),
  p('galletas-mantequilla','Galletas mantequilla',  '🍪','sup-snacks','paquete'),
  p('galletas-avena',    'Galletas de avena',       '🍪','sup-snacks','paquete'),
  p('barritas-cereales', 'Barritas de cereales',    '🌾','sup-snacks','paquete'),
  p('gusanitos',         'Gusanitos',               '🌽','sup-snacks','paquete'),
  p('palomitas-mw',      'Palomitas microondas',    '🍿','sup-snacks','paquete'),
  p('gominolas',         'Gominolas',               '🍬','sup-snacks','paquete'),
  p('nubes',             'Nubes',                   '🍡','sup-snacks','paquete'),
  p('regaliz-rojo',      'Regaliz rojo',            '🍬','sup-snacks','paquete'),
  p('chupachups',        'Caramelos con palo',      '🍭','sup-snacks','paquete'),
];

// Yogures variados extra -> Lácteos
export const YOGURES_EXTRA: Product[] = [
  p('petit-suisse',      'Petit suisse',            '🥣','sup-lacteos','paquete'),
  p('queso-fresco-batido','Queso fresco batido',    '🥣','sup-lacteos','paquete'),
  p('yogur-coco',        'Yogur de coco',           '🥥','sup-lacteos','paquete'),
  p('yogur-mango',       'Yogur de mango',          '🥭','sup-lacteos','paquete'),
  p('yogur-skyr',        'Skyr islandés',           '🥣','sup-lacteos','paquete'),
  p('yogur-soja',        'Yogur de soja',           '🥣','sup-lacteos','paquete'),
  p('postre-chocolate',  'Postre de chocolate',     '🍫','sup-lacteos','paquete'),
  p('mousse-chocolate',  'Mousse de chocolate',     '🍫','sup-lacteos','paquete'),
  p('queso-crema',       'Queso crema',             '🧀','sup-lacteos'),
  p('mantequilla-ajo',   'Mantequilla con ajo',     '🧈','sup-lacteos'),
];
