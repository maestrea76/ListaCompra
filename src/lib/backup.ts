// Export/Import del AppState como JSON. Funciona siempre, sin backend.
// Útil para mover los datos de un dispositivo a otro de forma manual.

import { app } from './stores/app.svelte';
import type { AppState } from './types';

/** Genera un JSON del estado actual y dispara su descarga. */
export function exportToFile(): void {
  // Quitamos el pinHash del export — el PIN es local y no debe viajar.
  const state: AppState = {
    ...app.state,
    profile: app.state.profile ? { ...app.state.profile, pinHash: '' } : undefined,
  };
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const username = app.state.profile?.username ?? 'tucompra';
  const date = new Date().toISOString().slice(0, 10);
  a.download = `tucompra-${username}-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Lee un JSON desde un File del input, valida y reemplaza el estado. */
export async function importFromFile(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as AppState;
  if (parsed.version !== 1 || !Array.isArray(parsed.stores)) {
    throw new Error('Archivo no válido (versión o estructura incorrecta).');
  }
  // Si ya hay un perfil local con PIN, lo conservamos — el archivo no
  // sobreescribe credenciales locales (que son sensibles y por dispositivo).
  const localPin = app.state.profile?.pinHash;
  if (localPin && parsed.profile) parsed.profile.pinHash = localPin;
  app.state = parsed;
  app.persist();
}
