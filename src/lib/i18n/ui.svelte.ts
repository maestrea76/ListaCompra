// `t()` reactivo para los componentes: resuelve el locale activo desde el store
// global, así ningún componente tiene que recibirlo por props ni derivarlo.
//
// Al leer `app.state.locale` (que es $state) dentro de la plantilla, el efecto
// de render del componente lo rastrea: cambiar de idioma repinta los textos sin
// nada más.

import { app } from '../stores/app.svelte';
import { DEFAULT_LOCALE } from './locale';
import { translate, type UIKey } from './ui';

export function t(key: UIKey, vars?: Record<string, string | number>): string {
  return translate(app.state.locale ?? DEFAULT_LOCALE, key, vars);
}

export type { UIKey };
