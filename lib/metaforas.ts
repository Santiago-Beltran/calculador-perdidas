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
// Precios realistas y más bien ALTOS a propósito: preferimos quedarnos cortos
// (que el conteo sea conservador) antes que exagerar. Solo vehículos + propiedad,
// para que las combinaciones tengan sentido (un carro y una moto, un apto y un carro…).
export const ITEMS: Record<Moneda, ItemMetafora[]> = {
  COP: [
    {
      precio: 9_000_000,
      icono: "moto",
      singular: "una moto 0 km",
      plural: "{n} motos 0 km",
      botonSingular: "mi moto",
      botonPlural: "mis {n} motos",
    },
    {
      precio: 68_000_000,
      icono: "carro",
      singular: "un Renault Kwid 0 km",
      plural: "{n} Renault Kwid 0 km",
      botonSingular: "mi Renault Kwid",
      botonPlural: "mis {n} Renault Kwid",
    },
    {
      precio: 140_000_000,
      icono: "carro",
      singular: "un Mazda 3 0 km",
      plural: "{n} Mazda 3 0 km",
      botonSingular: "mi Mazda 3",
      botonPlural: "mis {n} Mazda 3",
    },
    {
      precio: 270_000_000,
      icono: "carro",
      singular: "una Toyota Hilux 4x4 0 km",
      plural: "{n} Toyota Hilux 4x4 0 km",
      botonSingular: "mi Toyota Hilux",
      botonPlural: "mis {n} Toyota Hilux",
    },
    {
      precio: 580_000_000,
      icono: "casa",
      singular: "un apartamento en Bogotá",
      plural: "{n} apartamentos en Bogotá",
      botonSingular: "mi apartamento",
      botonPlural: "mis {n} apartamentos",
    },
    {
      precio: 1_400_000_000,
      icono: "casa",
      singular: "una casa campestre",
      plural: "{n} casas campestres",
      botonSingular: "mi casa campestre",
      botonPlural: "mis {n} casas campestres",
    },
  ],
  USD: [
    {
      precio: 3_500,
      icono: "moto",
      singular: "una moto 0 km",
      plural: "{n} motos 0 km",
      botonSingular: "mi moto",
      botonPlural: "mis {n} motos",
    },
    {
      precio: 30_000,
      icono: "carro",
      singular: "un Honda Civic 0 km",
      plural: "{n} Honda Civic 0 km",
      botonSingular: "mi Honda Civic",
      botonPlural: "mis {n} Honda Civic",
    },
    {
      precio: 45_000,
      icono: "carro",
      singular: "una Toyota RAV4 0 km",
      plural: "{n} Toyota RAV4 0 km",
      botonSingular: "mi RAV4",
      botonPlural: "mis {n} RAV4",
    },
    {
      precio: 58_000,
      icono: "carro",
      singular: "una Toyota Hilux 0 km",
      plural: "{n} Toyota Hilux 0 km",
      botonSingular: "mi Toyota Hilux",
      botonPlural: "mis {n} Toyota Hilux",
    },
    {
      precio: 380_000,
      icono: "casa",
      singular: "una casa",
      plural: "{n} casas",
      botonSingular: "mi casa",
      botonPlural: "mis {n} casas",
    },
    {
      precio: 1_100_000,
      icono: "casa",
      singular: "una casa de lujo",
      plural: "{n} casas de lujo",
      botonSingular: "mi casa de lujo",
      botonPlural: "mis {n} casas de lujo",
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
  // floor (no redondear hacia arriba): preferimos quedarnos cortos, no exagerar.
  const nChico = chico ? Math.floor(resto / chico.precio) : 0;
  const nGrande = Math.max(1, Math.floor(valor / grande.precio));

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
