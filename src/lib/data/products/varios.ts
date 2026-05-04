import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

// Centro Comercial
export const CENTRO_COMERCIAL: Product[] = [
  p('movil',             'Móvil',                   '📱','cc-tecnologia'),
  p('tablet',            'Tablet',                  '📱','cc-tecnologia'),
  p('portatil',          'Portátil',                '💻','cc-tecnologia'),
  p('auriculares',       'Auriculares',             '🎧','cc-tecnologia'),
  p('altavoz-bt',        'Altavoz bluetooth',       '🔊','cc-tecnologia'),
  p('cargador-usb',      'Cargador usb',            '🔌','cc-tecnologia'),
  p('cable-usb-c',       'Cable usb-c',             '🔌','cc-tecnologia'),
  p('memoria-usb',       'Memoria usb',             '💾','cc-tecnologia'),
  p('tarjeta-sd',        'Tarjeta sd',              '💾','cc-tecnologia'),
  p('teclado',           'Teclado',                 '⌨️','cc-tecnologia'),
  p('raton',             'Ratón',                   '🖱️','cc-tecnologia'),
  p('television',        'Televisión',              '📺','cc-tecnologia'),
  p('libro',             'Libro',                   '📚','cc-hogar'),
  p('agenda',            'Agenda',                  '📓','cc-hogar'),
  p('boligrafo',         'Bolígrafo',               '🖊️','cc-hogar','paquete'),
  p('cuaderno',          'Cuaderno',                '📔','cc-hogar'),
  p('peluche',           'Peluche',                 '🧸','cc-juguetes'),
  p('puzzle',            'Puzzle',                  '🧩','cc-juguetes'),
  p('juego-mesa',        'Juego de mesa',           '🎲','cc-juguetes'),
  p('coche-juguete',     'Coche de juguete',        '🚗','cc-juguetes'),
  p('muñeca',            'Muñeca',                  '🪆','cc-juguetes'),
  p('pelota',            'Pelota',                  '⚽','cc-juguetes'),
  p('bicicleta-niño',    'Bicicleta infantil',      '🚲','cc-juguetes'),
  p('patinete',          'Patinete',                '🛴','cc-juguetes'),
];

// Delicatessen
export const DELICATESSEN: Product[] = [
  p('queso-manchego-cur','Queso manchego curado',   '🧀','del-quesos'),
  p('queso-cabrales-del','Queso de cabrales',       '🧀','del-quesos'),
  p('queso-idiazabal-d', 'Queso idiazábal d.o.',    '🧀','del-quesos'),
  p('queso-tetilla-d',   'Queso de tetilla',        '🧀','del-quesos'),
  p('queso-mahon-d',     'Queso de mahón',          '🧀','del-quesos'),
  p('queso-azul',        'Queso azul',              '🧀','del-quesos'),
  p('queso-brie',        'Brie',                    '🧀','del-quesos'),
  p('queso-camembert',   'Camembert',               '🧀','del-quesos'),
  p('queso-parmesano',   'Parmesano',               '🧀','del-quesos'),
  p('rioja-gran-reserva','Rioja gran reserva',      '🍷','del-vinos'),
  p('ribera-duero',      'Ribera del duero',        '🍷','del-vinos'),
  p('priorat',           'Priorat',                 '🍷','del-vinos'),
  p('vino-jerez',        'Vino de jerez',           '🍷','del-vinos'),
  p('vino-malaga',       'Vino de málaga',          '🍷','del-vinos'),
  p('cava-reserva',      'Cava reserva',            '🍾','del-vinos'),
  p('orujo-galicia',     'Orujo de galicia',        '🥃','del-vinos'),
  p('anchoas-santoña',   'Anchoas de santoña',      '🥫','del-conservas'),
  p('bonito-conserva',   'Bonito del norte conserva','🥫','del-conservas'),
  p('navajas-conserva',  'Navajas en conserva',     '🥫','del-conservas'),
  p('berberechos-galicia','Berberechos de galicia', '🥫','del-conservas'),
  p('mejillones-rias',   'Mejillones rías gallegas','🥫','del-conservas'),
  p('caviar',            'Caviar',                  '🥄','del-conservas'),
  p('foie',              'Foie gras',               '🥫','del-conservas'),
  p('paté-iberico',      'Paté ibérico',            '🥫','del-conservas'),
];

// Herboristería
export const HERBORISTERIA: Product[] = [
  p('te-rooibos',        'Té rooibos',              '🍵','her-infusiones','paquete'),
  p('te-blanco',         'Té blanco',               '🍵','her-infusiones','paquete'),
  p('te-chai',           'Té chai',                 '🍵','her-infusiones','paquete'),
  p('infusion-jengibre', 'Infusión jengibre',       '🌿','her-infusiones','paquete'),
  p('infusion-melisa',   'Infusión melisa',         '🌿','her-infusiones','paquete'),
  p('infusion-valeriana','Infusión valeriana',      '🌿','her-infusiones','paquete'),
  p('infusion-hinojo',   'Infusión hinojo',         '🌿','her-infusiones','paquete'),
  p('infusion-frutos',   'Infusión frutos rojos',   '🍓','her-infusiones','paquete'),
  p('omega-3',           'Omega 3',                 '💊','her-suplementos','paquete'),
  p('magnesio',          'Magnesio',                '💊','her-suplementos','paquete'),
  p('zinc',              'Zinc',                    '💊','her-suplementos','paquete'),
  p('jalea-real',        'Jalea real',              '🍯','her-suplementos'),
  p('propoleo',          'Propóleo',                '🐝','her-suplementos'),
  p('ginseng',           'Ginseng',                 '🌿','her-suplementos','paquete'),
  p('valeriana-extracto','Valeriana extracto',      '🌿','her-suplementos'),
  p('aceite-coco',       'Aceite de coco',          '🥥','her-cosmetica'),
  p('aceite-rosa-mosqueta','Aceite rosa mosqueta',  '🌹','her-cosmetica'),
  p('aceite-jojoba',     'Aceite de jojoba',        '🌿','her-cosmetica'),
  p('aloe-vera-gel',     'Gel de aloe vera',        '🌵','her-cosmetica'),
  p('mantequilla-karite','Manteca de karité',       '🌰','her-cosmetica'),
  p('jabon-natural',     'Jabón natural',           '🧼','her-cosmetica'),
];

// Locutorio
export const LOCUTORIO: Product[] = [
  p('recarga-movistar',  'Recarga movistar',        '📲','loc-recargas'),
  p('recarga-vodafone',  'Recarga vodafone',        '📲','loc-recargas'),
  p('recarga-orange',    'Recarga orange',          '📲','loc-recargas'),
  p('recarga-yoigo',     'Recarga yoigo',           '📲','loc-recargas'),
  p('recarga-lowi',      'Recarga lowi',            '📲','loc-recargas'),
  p('recarga-simyo',     'Recarga simyo',           '📲','loc-recargas'),
  p('envio-correos',     'Envío correos',           '📦','loc-envios'),
  p('envio-seur',        'Envío seur',              '📦','loc-envios'),
  p('envio-mrw',         'Envío mrw',               '📦','loc-envios'),
  p('envio-internacional','Envío internacional',    '✈️','loc-envios'),
  p('fotocopias',        'Fotocopias',              '📄','loc-otros'),
  p('impresion',         'Impresión',               '🖨️','loc-otros'),
];

// Otros (catch-all)
export const OTROS: Product[] = [
  p('pilas',             'Pilas',                   '🔋','otr-varios','paquete'),
  p('cables-usb',        'Cables usb',              '🔌','otr-varios'),
  p('lampara-otros',     'Lámpara',                 '💡','otr-varios'),
  p('regalo',            'Regalo',                  '🎁','otr-varios'),
  p('tarjeta-felicitacion','Tarjeta felicitación',  '💌','otr-varios'),
  p('papel-regalo',      'Papel de regalo',         '🎁','otr-varios'),
  p('lazo',              'Lazo',                    '🎀','otr-varios'),
  p('vela-cumple',       'Vela de cumpleaños',      '🕯️','otr-varios','paquete'),
];
