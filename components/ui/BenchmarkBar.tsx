import { formatearPct } from "@/lib/calc";
import { clamp } from "@/lib/util";
import type { ReactNode } from "react";

// Barra comparativa de tasa de cierre vs. benchmarks (5% Excelente, 8% Zillow).
// `variant` adapta la paleta al fondo (claro = papel, oscuro = panel bosque).
// La escala llega a 10%, así 5% cae en 50% y 8% en 80%.
const MARCAS = [
  { pos: 50, label: "5% · Excelente" },
  { pos: 80, label: "8% · Zillow" },
];

export function BenchmarkBar({
  tasa,
  variant = "light",
  footer,
}: {
  tasa: number;
  variant?: "light" | "dark";
  footer?: ReactNode;
}) {
  const fill = clamp((tasa / 0.1) * 100, 0, 100);
  return (
    <div className={`bmk bmk-${variant}`}>
      <div className="bmk-top">
        <span className="bmk-lbl">Tu tasa de cierre</span>
        <span className="bmk-pct">{formatearPct(tasa, 1)}</span>
      </div>
      <div className="bmk-track">
        <div className="bmk-fill" style={{ width: `${fill}%` }} />
        {MARCAS.map((m) => (
          <div key={m.pos} className="bmk-mark" style={{ left: `${m.pos}%` }}>
            <span className="bmk-mlbl">{m.label}</span>
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
}
