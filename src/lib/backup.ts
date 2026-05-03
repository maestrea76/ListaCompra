// Backup mediante código de texto, sin servidores (estilo Boardinggate).
//
// El "código" es el bundle del usuario serializado, gzipeado con la API
// nativa CompressionStream y codificado en base64url. El usuario lo copia
// y lo pega en otro dispositivo para restaurar.
//
// Sólo guardamos lo que el usuario ha personalizado:
//   - profile (sin pinHash — el PIN protege un único dispositivo)
//   - lists (los items de cada tienda)
//   - customProducts (los que ha creado a mano, id que empieza por "custom-")
// El catálogo seed (~750 productos, categorías, tiendas) ya viene en la
// app — no hace falta meterlo en el código y multiplicar su tamaño.

import { app } from './stores/app.svelte';
import type { AppState, ListItem, Product, ShoppingList, UserProfile } from './types';

interface BackupBundle {
  v: 1;
  username: string;
  profile: Omit<UserProfile, 'pinHash'>;
  lists: Record<string, ShoppingList>;
  customProducts: Product[];
}

// ─── base64url helpers ───────────────────────────────────────────────────
const toB64url = (bytes: Uint8Array): string => {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64url = (s: string): Uint8Array => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

// ─── gzip via CompressionStream (built-in en navegadores modernos) ───────
async function gzipString(text: string): Promise<Uint8Array> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function gunzipString(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).text();
}

// ─── API pública ─────────────────────────────────────────────────────────

/** Construye el bundle de usuario a partir del estado actual. */
function buildBundle(state: AppState): BackupBundle {
  if (!state.profile) throw new Error('Sin perfil — nada que respaldar');
  const { pinHash: _ignore, ...profileSafe } = state.profile;
  return {
    v: 1,
    username: state.profile.username,
    profile: profileSafe,
    lists: state.lists,
    customProducts: state.products.filter((p) => p.id.startsWith('custom-')),
  };
}

/** Genera el código de backup que el usuario copia. */
export async function generateBackupCode(): Promise<string> {
  const bundle = buildBundle(app.state);
  const json = JSON.stringify(bundle);
  const gz = await gzipString(json);
  return toB64url(gz);
}

/** Aplica un código de backup al estado actual (mezcla con el seed local). */
export async function applyBackupCode(code: string, newPinHash: string): Promise<void> {
  const cleaned = code.replace(/\s+/g, '');
  if (!cleaned) throw new Error('Código vacío');
  let bundle: BackupBundle;
  try {
    const json = await gunzipString(fromB64url(cleaned));
    bundle = JSON.parse(json) as BackupBundle;
  } catch {
    throw new Error('Código inválido o corrupto');
  }
  if (bundle.v !== 1 || !bundle.username) {
    throw new Error('Versión de backup no soportada');
  }

  // Reconstruimos el estado: catálogo seed local + datos del bundle.
  const fresh = (await import('./storage')).createInitialState();
  // Mezclamos productos custom (los que no estén ya en el seed).
  const seedIds = new Set(fresh.products.map((p) => p.id));
  const merged = [
    ...fresh.products,
    ...bundle.customProducts.filter((p) => !seedIds.has(p.id)),
  ];

  app.state = {
    ...fresh,
    profile: { ...bundle.profile, pinHash: newPinHash },
    lists: bundle.lists,
    products: merged,
  };
  app.persist();
}

// ─── Export/Import por archivo (alternativa) ─────────────────────────────

/** Descarga el código como archivo .txt para guardarlo en cualquier sitio. */
export async function downloadBackupCode(): Promise<void> {
  const code = await generateBackupCode();
  const username = app.state.profile?.username ?? 'tucompra';
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tucompra-${username}-${date}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Lee el código desde un archivo de texto. */
export async function readCodeFromFile(file: File): Promise<string> {
  return (await file.text()).trim();
}
