export function asText(v: unknown, fallback = '') {
  if (v == null) return fallback;
  return String(v);
}

export function firstName(v: unknown) {
  const t = asText(v, 'Sin nombre').trim();
  return t.split(/\s+/)[0] || 'Sin nombre';
}

export function initials(v: unknown, n = 2) {
  const t = asText(v, '?').trim();
  if (!t) return '?';
  return t.slice(0, n).toUpperCase();
}
