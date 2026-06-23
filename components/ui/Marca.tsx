// Wordmark "SB | santiago beltrán" y la barra superior de marca.
// Idéntico al sistema visual de los PDF (propuesta / diagnóstico).

export function Wordmark({ claro = false }: { claro?: boolean }) {
  return (
    <div className={`wordmark${claro ? " claro" : ""}`}>
      <span className="sb">SB</span>
      <span className="sep" />
      <span className="nombre">
        santiago
        <br />
        beltrán
      </span>
    </div>
  );
}

export function BrandBar({ label, claro = false }: { label: string; claro?: boolean }) {
  return (
    <div className="barra-marca">
      <Wordmark claro={claro} />
      <span className="paso-cuenta">{label}</span>
    </div>
  );
}
