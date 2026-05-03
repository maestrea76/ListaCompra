import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'kg'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

/** Carnicería — productos típicos del País Vasco (txuleta, morcilla de Beasain...). */
export const CARNICERIA: Product[] = [
  // Vacuno
  p('txuleta-buey',     'Txuleta de buey',       '🥩', 'car-vacuno'),
  p('chuleta-vaca',     'Chuleta de vaca',       '🥩', 'car-vacuno'),
  p('txuleta-vaca',     'Txuleta de vaca vieja', '🥩', 'car-vacuno'),
  p('solomillo-ternera','Solomillo de ternera',  '🥩', 'car-vacuno'),
  p('entrecot',         'Entrecot',              '🥩', 'car-vacuno'),
  p('filete-ternera',   'Filete de ternera',     '🥩', 'car-vacuno'),
  p('redondo',          'Redondo de ternera',    '🥩', 'car-vacuno'),
  p('aguja-ternera',    'Aguja de ternera',      '🥩', 'car-vacuno'),
  p('rabo-buey',        'Rabo de buey',          '🥩', 'car-vacuno'),
  p('carrillera',       'Carrillera',            '🥩', 'car-vacuno'),
  p('carne-picada',     'Carne picada mixta',    '🥩', 'car-vacuno'),
  // Cerdo
  p('chuleta-cerdo',    'Chuleta de cerdo',      '🥓', 'car-cerdo'),
  p('lomo-cerdo',       'Lomo de cerdo',         '🥓', 'car-cerdo'),
  p('solomillo-cerdo',  'Solomillo de cerdo',    '🥓', 'car-cerdo'),
  p('costilla-cerdo',   'Costilla de cerdo',     '🥓', 'car-cerdo'),
  p('panceta',          'Panceta',               '🥓', 'car-cerdo'),
  p('secreto',          'Secreto ibérico',       '🥓', 'car-cerdo'),
  p('presa-iberica',    'Presa ibérica',         '🥓', 'car-cerdo'),
  // Cordero
  p('chuletillas-cordero','Chuletillas de cordero','🍖','car-cordero'),
  p('paletilla-cordero','Paletilla de cordero',  '🍖', 'car-cordero'),
  p('pierna-cordero',   'Pierna de cordero',     '🍖', 'car-cordero'),
  // Aves
  p('pollo-entero',     'Pollo entero',          '🐔', 'car-aves', 'unidad'),
  p('pechuga-pollo',    'Pechuga de pollo',      '🐔', 'car-aves'),
  p('muslo-pollo',      'Muslos de pollo',       '🐔', 'car-aves'),
  p('alitas-pollo',     'Alitas de pollo',       '🐔', 'car-aves'),
  p('pavo-pechuga',     'Pechuga de pavo',       '🦃', 'car-aves'),
  p('codorniz',         'Codorniz',              '🐦', 'car-aves', 'unidad'),
  p('pato-magret',      'Magret de pato',        '🦆', 'car-aves'),
  // Embutidos
  p('chorizo-fresco',   'Chorizo fresco',        '🌭', 'car-embutidos'),
  p('chorizo-curado',   'Chorizo curado',        '🌭', 'car-embutidos'),
  p('morcilla-beasain', 'Morcilla de Beasain',   '🌭', 'car-embutidos'),
  p('morcilla-arroz',   'Morcilla de arroz',     '🌭', 'car-embutidos'),
  p('salchicha-fresca', 'Salchicha fresca',      '🌭', 'car-embutidos'),
  p('butifarra',        'Butifarra',             '🌭', 'car-embutidos'),
  p('jamon-serrano',    'Jamón serrano',         '🍖', 'car-embutidos'),
  p('jamon-iberico',    'Jamón ibérico',         '🍖', 'car-embutidos'),
  p('lomo-embuchado',   'Lomo embuchado',        '🥓', 'car-embutidos'),
  // Preparados
  p('hamburguesa',      'Hamburguesa',           '🍔', 'car-preparados', 'unidad'),
  p('albondigas',       'Albóndigas',            '🍡', 'car-preparados'),
  p('pinchos-moruno',   'Pinchos morunos',       '🍢', 'car-preparados'),
  p('flamenquin',       'Flamenquín',            '🥩', 'car-preparados', 'unidad'),
  p('san-jacobo',       'San Jacobo',            '🥪', 'car-preparados', 'unidad'),
];
