import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

export const FARMACIA: Product[] = [
  // Medicación
  p('paracetamol',       'Paracetamol 1g',          '💊','far-medicacion','paquete'),
  p('ibuprofeno-600',    'Ibuprofeno 600mg',        '💊','far-medicacion','paquete'),
  p('ibuprofeno-400',    'Ibuprofeno 400mg',        '💊','far-medicacion','paquete'),
  p('aspirina',          'Aspirina',                '💊','far-medicacion','paquete'),
  p('frenadol',          'Frenadol',                '💊','far-medicacion','paquete'),
  p('antihistaminico',   'Antihistamínico',         '💊','far-medicacion','paquete'),
  p('almax',             'Almax',                   '💊','far-medicacion','paquete'),
  p('omeprazol',         'Omeprazol',               '💊','far-medicacion','paquete'),
  p('jarabe-tos',        'Jarabe para la tos',      '🧴','far-medicacion'),
  p('caramelos-garganta','Caramelos garganta',      '🍬','far-medicacion','paquete'),
  p('vitamina-c',        'Vitamina C',              '🟠','far-medicacion','paquete'),
  p('vitamina-d',        'Vitamina D',              '☀️','far-medicacion','paquete'),
  p('multivitaminico',   'Multivitamínico',         '💊','far-medicacion','paquete'),
  p('probiotico',        'Probiótico',              '💊','far-medicacion','paquete'),
  p('suero-fisiologico', 'Suero fisiológico',       '💧','far-medicacion','paquete'),
  p('termometro',        'Termómetro',              '🌡️','far-medicacion'),
  p('tensiometro',       'Tensiómetro',             '🩺','far-medicacion'),
  p('mascarilla-ffp2',   'Mascarilla FFP2',         '😷','far-medicacion','paquete'),
  p('test-antigenos',    'Test antígenos',          '🧪','far-medicacion'),
  // Cuidado personal
  p('crema-hidratante',  'Crema hidratante',        '🧴','far-cuidado'),
  p('crema-antiarrugas', 'Crema antiarrugas',       '🧴','far-cuidado'),
  p('protector-solar-50','Protector solar 50',      '☀️','far-cuidado'),
  p('aftersun',          'After Sun',               '🧴','far-cuidado'),
  p('crema-pies',        'Crema de pies',           '🦶','far-cuidado'),
  p('callicida',         'Callicida',               '🦶','far-cuidado'),
  p('lacre-uñas',        'Esmalte uñas tratamiento','💅','far-cuidado'),
  // Bebé
  p('panal-recien-nacido','Pañal recién nacido',    '🍼','far-bebe','paquete'),
  p('crema-pañal-far',   'Crema del pañal',         '🍼','far-bebe'),
  p('aceite-bebe',       'Aceite bebé',             '🧴','far-bebe'),
  p('chupete-anatomico', 'Chupete anatómico',       '🍼','far-bebe'),
];
