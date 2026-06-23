import type { Moneda } from "./calc";

// ─────────────────────────────────────────────────────────────────────────
//  Metáforas para aterrizar la cifra de pérdida.
//
//  Estrategia "híbrido: grande + resto" (como denominaciones de billetes):
//    1. Se toma el ítem más caro que cabe en el valor  → la pieza grande.
//    2. El sobrante se expresa en el ítem más caro que cabe en ese resto.
//  Así la metáfora NUNCA subestima: ej. 90M → "un Renault Kwid y 5 motos más"
//  (58M + 5×6.5M ≈ 90.5M) en vez de "un Renault Kwid" (58M, que se queda corto).
//
//  Cada ítem se ilustra con un ÍCONO (no foto) y tiene su PRECIO REAL.
//  Precios aproximados Colombia 2025 — EDITABLES. Verificar antes de publicar.
// ─────────────────────────────────────────────────────────────────────────

export type IconoMetafora = "carro" | "moto" | "avion" | "casa";

export interface ItemMetafora {
  /** Precio real de una unidad (COP/USD según moneda) */
  precio: number;
  icono: IconoMetafora;
  singular: string;
  plural: string; // usa {n}
  botonSingular: string;
  botonPlural: string; // usa {n}
}

// Ordenados de MENOR a MAYOR precio.
export const ITEMS: Record<Moneda, ItemMetafora[]> = {
  COP: [
    {
      precio: 850_000,
      icono: "avion",
      singular: "un viaje de fin de semana",
      plural: "{n} viajes de fin de semana",
      botonSingular: "mi viaje",
      botonPlural: "mis {n} viajes",
    },
    {
      precio: 4_500_000,
      icono: "avion",
      singular: "un viaje a Cancún todo incluido",
      plural: "{n} viajes a Cancún todo incluido",
      botonSingular: "mi viaje a Cancún",
      botonPlural: "mis {n} viajes a Cancún",
    },
    {
      precio: 6_500_000,
      icono: "moto",
      singular: "una moto Bajaj Boxer 0 km",
      plural: "{n} motos Bajaj Boxer 0 km",
      botonSingular: "mi moto",
      botonPlural: "mis {n} motos",
    },
    {
      precio: 58_000_000,
      icono: "carro",
      singular: "un Renault Kwid 0 km",
      plural: "{n} Renault Kwid 0 km",
      botonSingular: "mi Renault Kwid",
      botonPlural: "mis {n} Renault Kwid",
    },
    {
      precio: 120_000_000,
      icono: "carro",
      singular: "un Mazda 3 0 km",
      plural: "{n} Mazda 3 0 km",
      botonSingular: "mi Mazda 3",
      botonPlural: "mis {n} Mazda 3",
    },
    {
      precio: 250_000_000,
      icono: "carro",
      singular: "una Toyota Fortuner 0 km",
      plural: "{n} Toyota Fortuner 0 km",
      botonSingular: "mi Toyota Fortuner",
      botonPlural: "mis {n} Toyota Fortuner",
    },
    {
      precio: 450_000_000,
      icono: "casa",
      singular: "un buen apartamento",
      plural: "{n} buenos apartamentos",
      botonSingular: "mi apartamento",
      botonPlural: "mis {n} apartamentos",
    },
  ],
  USD: [
    {
      precio: 300,
      icono: "avion",
      singular: "un Apple Watch",
      plural: "{n} Apple Watches",
      botonSingular: "mi Apple Watch",
      botonPlural: "mis {n} Apple Watches",
    },
    {
      precio: 1_200,
      icono: "avion",
      singular: "un viaje a Cancún todo incluido",
      plural: "{n} viajes a Cancún todo incluido",
      botonSingular: "mi viaje a Cancún",
      botonPlural: "mis {n} viajes a Cancún",
    },
    {
      precio: 3_500,
      icono: "moto",
      singular: "una MacBook Pro tope de línea",
      plural: "{n} MacBook Pro tope de línea",
      botonSingular: "mi MacBook Pro",
      botonPlural: "mis {n} MacBook Pro",
    },
    {
      precio: 25_000,
      icono: "carro",
      singular: "un Honda Civic 0 km",
      plural: "{n} Honda Civic 0 km",
      botonSingular: "mi Honda Civic",
      botonPlural: "mis {n} Honda Civic",
    },
    {
      precio: 60_000,
      icono: "carro",
      singular: "un Tesla Model Y 0 km",
      plural: "{n} Tesla Model Y 0 km",
      botonSingular: "mi Tesla",
      botonPlural: "mis {n} Tesla Model Y",
    },
    {
      precio: 450_000,
      icono: "casa",
      singular: "una casa familiar",
      plural: "{n} casas familiares",
      botonSingular: "mi casa",
      botonPlural: "mis {n} casas",
    },
  ],
};

export interface MetaforaItem {
  icono: IconoMetafora;
  cantidad: number;
}

export interface Metafora {
  frase: string;
  boton: string;
  items: MetaforaItem[];
}

const conN = (plantilla: string, n: number) => plantilla.replace("{n}", String(n));

export function metaforaPara(valor: number, moneda: Moneda = "COP"): Metafora {
  const lista = ITEMS[moneda];
  if (!Number.isFinite(valor) || valor <= 0) {
    const it = lista[0];
    return { frase: it.singular, boton: it.botonSingular, items: [{ icono: it.icono, cantidad: 1 }] };
  }

  // Pieza grande: el ítem más caro que cabe en el valor (o el más barato si no cabe ninguno).
  const grande = [...lista].reverse().find((x) => x.precio <= valor) ?? lista[0];
  const resto = valor - Math.floor(valor / grande.precio) * grande.precio;

  // Sobrante: el ítem más caro (más barato que la pieza grande) que cabe en el resto.
  const chico = [...lista]
    .reverse()
    .find((x) => x.precio < grande.precio && x.precio <= resto);
  const nChico = chico ? Math.round(resto / chico.precio) : 0;

  // Si no hay ítem pequeño para el sobrante y este es grande, redondea hacia arriba
  // la pieza grande para no quedarse corto (ej. 30M → "5 motos" en vez de "4 motos").
  const nGrande = Math.max(
    1,
    !chico && resto * 2 >= grande.precio
      ? Math.round(valor / grande.precio)
      : Math.floor(valor / grande.precio),
  );

    const fraseGrande = nGrande === 1 ? grande.singular : conN(grande.plural, nGrande);
  const boton = nGrande === 1 ? grande.botonSingular : conN(grande.botonPlural, nGrande);

  let frase = fraseGrande;
  const items = [{ icono: grande.icono, cantidad: nGrande }];

  if (chico && nChico >= 1) {
    const fraseChico = nChico === 1 ? chico.singular : conN(chico.plural, nChico);
    frase = `${fraseGrande}, y ${fraseChico}`;
    items.push({ icono: chico.icono, cantidad: nChico });
  }

  return { frase, boton, items };
}
