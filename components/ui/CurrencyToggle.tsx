import type { Moneda } from "@/lib/calc";

const MONEDAS: Moneda[] = ["COP", "USD"];

// Selector de moneda único y global (segmentado). Reemplaza los selectores
// repetidos por campo. Al cambiar, los montos se reinician.
export function CurrencyToggle({
  moneda,
  onChange,
}: {
  moneda: Moneda;
  onChange: (m: Moneda) => void;
}) {
  return (
    <div className="moneda-bar">
      <span className="moneda-bar-lbl">Moneda</span>
      <div className="moneda-toggle" role="group" aria-label="Moneda">
        {MONEDAS.map((m) => (
          <button
            key={m}
            type="button"
            className={`mt${moneda === m ? " on" : ""}`}
            aria-pressed={moneda === m}
            onClick={() => onChange(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
