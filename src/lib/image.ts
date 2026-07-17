// Prepara una imagen para guardarla en el estado (dataURL). Como el estado se
// sincroniza con Home Assistant, las imágenes tienen que ser pequeñas: una foto
// de móvil trae 2-5 MB y aquí caben ~150 KB, así que se REDIMENSIONA y comprime.
//
// Sin esto, "hacer una foto" fallaría siempre por tamaño.

const MAX_SIDE = 512; // px del lado mayor: de sobra para un icono de producto
const TARGET_BYTES = 150_000;

/** Un dataURL base64 pesa ~4/3 de los bytes reales. */
const approxBytes = (dataUrl: string) => Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('no es una imagen válida'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Redimensiona a MAX_SIDE y comprime a JPEG hasta bajar de TARGET_BYTES.
 *  Devuelve un dataURL, o lanza si el fichero no es una imagen. */
export async function fileToStorableDataUrl(file: File): Promise<string> {
  const img = await loadImage(file);

  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas no disponible');
  ctx.drawImage(img, 0, 0, w, h);

  // Baja la calidad hasta caber. El primer intento (0.82) ya sirve para casi
  // todo a 512px; los pasos siguientes cubren fotos muy "ruidosas".
  for (const q of [0.82, 0.7, 0.55, 0.4]) {
    const out = canvas.toDataURL('image/jpeg', q);
    if (approxBytes(out) <= TARGET_BYTES) return out;
  }
  // Último recurso: lo que salga a 0.4. A 512px es rarísimo llegar aquí.
  return canvas.toDataURL('image/jpeg', 0.4);
}
