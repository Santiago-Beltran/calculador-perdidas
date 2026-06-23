// Utilidades de UI compartidas entre componentes.

/** Convierte un string a número positivo; 0 si no es válido. */
export const num = (s: string) => {
  const v = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(v) && v > 0 ? v : 0;
};

/** Deja solo dígitos (para inputs de dinero formateados con miles). */
export const limpiar = (s: string) => s.replace(/[^\d]/g, "");

/** Acota n al rango [lo, hi]. */
export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
