/** Normaliza un enlace http(s). Vacío → ''.
 *  Un esquema que no es http(s) → null. Sin esquema, se antepone https://.
 *  El host tiene que ser localhost o llevar un punto. */
export function normalizeProductUrl(value: string): string | null {
  const clean = value.trim();
  if (!clean) return '';
  const hasSlashes = /^[a-z][a-z\d+.-]*:\/\//i.test(clean);
  // mailto: y javascript: no son un host:puerto (localhost:8080 sí lo es).
  if (!hasSlashes && /^[a-z][a-z\d+.-]*:(?!\d)/i.test(clean)) return null;
  const candidate = hasSlashes ? clean : `https://${clean}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.hostname !== 'localhost' && !url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}
