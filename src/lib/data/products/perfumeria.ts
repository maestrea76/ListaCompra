import type { Product, Unit } from '../../types';

const p = (id: string, name: string, emoji: string, cat: string, unit: Unit = 'unidad'): Product => ({
  id, name, categoryId: cat,
  icon: { kind: 'emoji', value: emoji }, defaultUnit: unit,
});

export const PERFUMERIA: Product[] = [
  // Fragancias
  p('perfume-mujer',     'Perfume mujer',           '🌸','per-fragancias'),
  p('perfume-hombre',    'Perfume hombre',          '🧴','per-fragancias'),
  p('eau-toilette',      'Eau de toilette',         '🌺','per-fragancias'),
  p('colonia-fresca',    'Colonia fresca',          '🌷','per-fragancias'),
  p('aftershave-perf',   'Aftershave',              '🧴','per-fragancias'),
  p('agua-fresca',       'Agua fresca',             '💧','per-fragancias'),
  p('mini-perfume',      'Mini perfume',            '🌸','per-fragancias'),
  // Maquillaje
  p('base-maquillaje',   'Base de maquillaje',      '💄','per-maquillaje'),
  p('corrector',         'Corrector',               '💄','per-maquillaje'),
  p('polvos-sueltos',    'Polvos sueltos',          '💄','per-maquillaje'),
  p('colorete',          'Colorete',                '💄','per-maquillaje'),
  p('iluminador',        'Iluminador',              '✨','per-maquillaje'),
  p('mascara-pestañas',  'Máscara de pestañas',     '👁️','per-maquillaje'),
  p('eyeliner',          'Eyeliner',                '👁️','per-maquillaje'),
  p('sombra-ojos',       'Sombra de ojos',          '🎨','per-maquillaje'),
  p('lapiz-labios',      'Lápiz de labios',         '💋','per-maquillaje'),
  p('barra-labios',      'Barra de labios',         '💋','per-maquillaje'),
  p('brillo-labios',     'Brillo de labios',        '💋','per-maquillaje'),
  p('esmalte-uñas',      'Esmalte de uñas',         '💅','per-maquillaje'),
  p('quitaesmalte',      'Quitaesmalte',            '🧴','per-maquillaje'),
  // Cuidado facial
  p('limpiadora-facial', 'Limpiadora facial',       '🧴','per-cuidado'),
  p('tonico',            'Tónico',                  '🧴','per-cuidado'),
  p('serum',             'Sérum',                   '🧴','per-cuidado'),
  p('contorno-ojos',     'Contorno de ojos',        '👁️','per-cuidado'),
  p('mascarilla-facial', 'Mascarilla facial',       '🧖','per-cuidado'),
  p('exfoliante-facial', 'Exfoliante facial',       '🧴','per-cuidado'),
  p('agua-micelar',      'Agua micelar',            '💧','per-cuidado'),
  // Cabello
  p('champu-perf',       'Champú',                  '🧴','per-cabello'),
  p('acondicionador-perf','Acondicionador',         '🧴','per-cabello'),
  p('mascarilla-cabello','Mascarilla capilar',      '🧴','per-cabello'),
  p('aceite-argan',      'Aceite de argán',         '🧴','per-cabello'),
  p('laca',              'Laca',                    '💨','per-cabello'),
  p('espuma-pelo',       'Espuma',                  '💨','per-cabello'),
  p('cera-pelo',         'Cera',                    '🧴','per-cabello'),
  p('tinte-cabello',     'Tinte de cabello',        '🎨','per-cabello'),
];
