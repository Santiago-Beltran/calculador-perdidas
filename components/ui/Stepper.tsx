// Control numérico +/- (cómodo en móvil).
export function Stepper({
  label,
  display,
  onDec,
  onInc,
  decLabel,
  incLabel,
}: {
  label: string;
  display: string;
  onDec: () => void;
  onInc: () => void;
  decLabel: string;
  incLabel: string;
}) {
  return (
    <div className="campo-num">
      <label>{label}</label>
      <div className="stepper-num">
        <button type="button" aria-label={decLabel} onClick={onDec}>
          −
        </button>
        <span className="sv">{display}</span>
        <button type="button" aria-label={incLabel} onClick={onInc}>
          +
        </button>
      </div>
    </div>
  );
}
