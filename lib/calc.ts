// ─────────────────────────────────────────────────────────────────────────
//  Modelo de pérdidas — Diagnóstico de Automatización (Fase 1)
//
//  Entrada concreta: inversión en atracción + costo por prospecto ⇒ prospectos.
//  La tasa "sin seguimiento" la define cómo opera hoy (5 preguntas de gerente).
//
//    $3.500.000 / $7.600 c/u            ≈ 460 prospectos / mes
//    460 × 42% sin seguimiento          ≈ 193
//    193 × 1% que se pierde de verdad   ≈ 1.9 / mes  →  ×12 ≈ 23 / año
//    × ($3.500.000 × 8% × 12 = $3.360.000 por cliente)
//    ≈ $77.000.000 COP al año  (piso conservador)
//    (El formulario inicia VACÍO; estos números son solo de referencia.)
// ─────────────────────────────────────────────────────────────────────────

export type Moneda = "COP" | "USD";

export const PCT_PERDIDA = 1;

export const COSTO_PROSPECTO_DEFAULT: Record<Moneda, number> = {
  COP: 7600,
  USD: 5,
};

export const TASA_MIN = 0; // operación impecable (sin brechas) ⇒ no pierde por seguimiento
export const TASA_MAX = 0.42; // operación a ciegas (~el 41% del caso)
export const TASA_REFERENCIA = TASA_MAX;

// Tasa de cierre de referencia
export const CIERRE_BUENO = 0.03;        // 3% — excelente
export const CIERRE_CLASE_MUNDIAL = 0.05; // 5% — Top performers Zillow

/** Preguntas en lenguaje de gerente: cada una revela una capacidad que
 *  hoy quizá no tiene. "Sí" = operación sana (baja la tasa sin seguimiento). */
export const PREGUNTAS_OPERACION: string[] = [
  "¿Tus prospectos viven en un solo sistema, no en el WhatsApp de cada asesor?",
  "¿Te llega una alerta cuando un cliente pasa 48 horas sin gestión?",
  "¿Ves el estado de cada oportunidad al instante, sin pedir reportes?",
  "¿Cada prospecto recibe al menos 5 intentos de contacto antes de descartarlo?",
  "¿Respondes a un prospecto nuevo en menos de 5 minutos?",
];

/** Etiqueta corta de cada brecha (cuando la respuesta es "No"), para el gancho
 *  del resultado y el mensaje de WhatsApp. Mismo orden que PREGUNTAS_OPERACION. */
export const BRECHAS: string[] = [
  "tus prospectos viven dispersos, no en un solo sistema",
  "nadie te avisa cuando un cliente lleva 48 h sin gestión",
  "no ves en tiempo real en qué va cada oportunidad",
  "se abandona a los prospectos tras 1 o 2 intentos",
  "los prospectos nuevos no reciben respuesta en minutos",
];

export interface Entradas {
  mercadeoMes: number;
  costoProspecto: number;
  cierresMes: number;
  canon: number;
  comision: number; // % entero
  permanencia: number; // meses
  operacion: boolean[];
}

export interface Desglose {
  prospectosMes: number;
  tasaSinSeguimiento: number;
  sinSeguimientoMes: number;
  perdidasMes: number;
  perdidasAno: number;
  comisionPorCliente: number;
  perdidaAnual: number;
  tasaCierre: number; // cierres / prospectos
  mercadeoAnual: number;
  vecesMercadeo: number; // perdidaAnual / mercadeoAnual
  mesesMercadeo: number; // perdidaAnual / mercadeoMes — "meses de atracción gratis"
}

/** Peso de cada pregunta (mismo orden que PREGUNTAS_OPERACION).
 *  Mayor peso = causa más directa de oportunidades perdidas.
 *    [0] Fuente única (no disperso)        → 2
 *    [1] Alerta de abandono (48 h)         → 3  (causa directa)
 *    [2] Visibilidad en tiempo real        → 2
 *    [3] Persistencia (≥5 intentos)        → 3  (causa directa)
 *    [4] Velocidad de respuesta (<5 min)   → 1  (suele estar resuelta; over-marketed)
 *  EDITABLE: ajusta para apuntar el diagnóstico al servicio que más vendes. */
export const PESOS_OPERACION: number[] = [2, 3, 2, 3, 1];

export function tasaSinSeguimiento(operacion: boolean[]): number {
  const peso = (i: number) => PESOS_OPERACION[i] ?? 1;
  const total = operacion.reduce((acc, _, i) => acc + peso(i), 0) || 1;
  const no = operacion.reduce((acc, x, i) => acc + (x ? 0 : peso(i)), 0);
  return TASA_MIN + (no / total) * (TASA_MAX - TASA_MIN);
}

export function calcular(e: Entradas): Desglose {
  const prospectosMes = e.costoProspecto > 0 ? e.mercadeoMes / e.costoProspecto : 0;
  const tasa = tasaSinSeguimiento(e.operacion);
  const sinSeguimientoMes = prospectosMes * tasa;
  const perdidasMes = sinSeguimientoMes * (PCT_PERDIDA / 100);
  const perdidasAno = perdidasMes * 12;
  const comisionPorCliente = e.canon * (e.comision / 100) * e.permanencia;
  const perdidaAnual = perdidasAno * comisionPorCliente;

  const tasaCierre = prospectosMes > 0 ? e.cierresMes / prospectosMes : 0;
  const mercadeoAnual = e.mercadeoMes * 12;
  const vecesMercadeo = mercadeoAnual > 0 ? perdidaAnual / mercadeoAnual : 0;
  const mesesMercadeo = e.mercadeoMes > 0 ? perdidaAnual / e.mercadeoMes : 0;

  return {
    prospectosMes,
    tasaSinSeguimiento: tasa,
    sinSeguimientoMes,
    perdidasMes,
    perdidasAno,
    comisionPorCliente,
    perdidaAnual,
    tasaCierre,
    mercadeoAnual,
    vecesMercadeo,
    mesesMercadeo,
  };
}

export const PREDETERMINADO: Entradas = {
  mercadeoMes: 4_000_000,
  costoProspecto: 4900,
  cierresMes: 29,
  canon: 3_500_000,
  comision: 8,
  permanencia: 12,
  operacion: [false, false, false, false, false],
};

// Rangos de los steppers (por unidad)
export const COMISION_MIN = 1;
export const COMISION_MAX = 30;
export const PERM_MIN = 1;
export const PERM_MAX = 60;

// ── Formateo ───────────────────────────────────────────────────────────────
const fmtCache: Partial<Record<Moneda, Intl.NumberFormat>> = {};
function fmt(moneda: Moneda): Intl.NumberFormat {
  if (!fmtCache[moneda]) {
    fmtCache[moneda] = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: 0,
    });
  }
  return fmtCache[moneda]!;
}

export const formatearMoneda = (n: number, moneda: Moneda = "COP") =>
  fmt(moneda).format(Math.round(n));

const simbolo = (moneda: Moneda) => (moneda === "USD" ? "US$" : "$");

export function formatearCompacto(n: number, moneda: Moneda = "COP"): string {
  const s = simbolo(moneda);
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return `${s}${(n / 1_000_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} MM`;
  if (abs >= 1_000_000)
    return `${s}${(n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
  if (abs >= 1_000)
    return `${s}${(n / 1_000).toLocaleString("es-CO", { maximumFractionDigits: 0 })} K`;
  return fmt(moneda).format(Math.round(n));
}

export const formatearMiles = (n: number) =>
  n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

export const formatearNum = (n: number, dec = 0) =>
  n.toLocaleString("es-CO", { maximumFractionDigits: dec, minimumFractionDigits: 0 });

export const formatearPct = (n: number, dec = 0) =>
  `${(n * 100).toLocaleString("es-CO", { maximumFractionDigits: dec })}%`;

export function comoFraccion(frac: number): string {
  const aprox: [number, string][] = [
    [1 / 5, "1 de cada 5"],
    [1 / 4, "1 de cada 4"],
    [1 / 3, "1 de cada 3"],
    [2 / 5, "2 de cada 5"],
    [1 / 2, "1 de cada 2"],
    [3 / 5, "3 de cada 5"],
    [2 / 3, "2 de cada 3"],
  ];
  let mejor = aprox[0];
  let dist = Infinity;
  for (const a of aprox) {
    const dd = Math.abs(a[0] - frac);
    if (dd < dist) { dist = dd; mejor = a; }
  }
  return mejor[1];
}
