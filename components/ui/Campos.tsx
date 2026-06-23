"use client";

import { useLayoutEffect, useRef } from "react";
import { formatearMiles, type Moneda } from "@/lib/calc";
import { num, limpiar } from "@/lib/util";

function Ayuda({ error, help }: { error?: string; help?: string }) {
  if (error) return <span className="campo-error">{error}</span>;
  if (help) return <span className="campo-ayuda">{help}</span>;
  return null;
}

/** Campo de dinero: input con separador de miles + sufijo de moneda.
 *  Preserva la posición del cursor al reformatear (cuenta dígitos a la
 *  izquierda del cursor), para que editar en medio no mande el dígito al final. */
export function MoneyField({
  id,
  label,
  value,
  onChange,
  placeholder,
  moneda,
  error,
  help,
  ancho = false,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  moneda: Moneda;
  error?: string;
  help?: string;
  ancho?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digitosAntesRef = useRef<number | null>(null);

  const formateado = value ? formatearMiles(num(value)) : "";

  // Tras cada reformateo, recoloca el cursor después del mismo nº de dígitos.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || digitosAntesRef.current == null) return;
    const objetivo = digitosAntesRef.current;
    digitosAntesRef.current = null;

    const texto = input.value;
    let pos = texto.length;
    if (objetivo <= 0) {
      pos = 0;
    } else {
      let cuenta = 0;
      for (let i = 0; i < texto.length; i++) {
        if (texto[i] >= "0" && texto[i] <= "9") {
          cuenta++;
          if (cuenta === objetivo) {
            pos = i + 1;
            break;
          }
        }
      }
    }
    input.setSelectionRange(pos, pos);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const caret = e.target.selectionStart ?? e.target.value.length;
    digitosAntesRef.current = e.target.value.slice(0, caret).replace(/\D/g, "").length;
    onChange(limpiar(e.target.value));
  };

  return (
    <div className={`campo-num${ancho ? " ancho" : ""}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={`entrada-linea money${error ? " invalido" : ""}`}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={formateado}
          onChange={handleChange}
        />
        <span className="afijo-moneda">{moneda}</span>
      </div>
      <Ayuda error={error} help={help} />
    </div>
  );
}

/** Campo numérico simple (entero), ancho consistente con los demás campos. */
export function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  help,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  help?: string;
}) {
  return (
    <div className="campo-num ancho">
      {label && <label htmlFor={id}>{label}</label>}
      <div className={`entrada-linea${error ? " invalido" : ""}`}>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <Ayuda error={error} help={help} />
    </div>
  );
}
