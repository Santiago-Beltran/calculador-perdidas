// Una pregunta de operación con su toggle Sí/No.
// `tocada` controla que ninguna opción se vea seleccionada hasta responder.
export function OperacionItem({
  pregunta,
  valor,
  tocada,
  falta = false,
  onResponder,
}: {
  pregunta: string;
  valor: boolean;
  tocada: boolean;
  falta?: boolean;
  onResponder: (v: boolean) => void;
}) {
  return (
    <div className={`crm-item${falta ? " falta" : ""}`}>
      <span className="crm-q">{pregunta}</span>
      <div className="crm-toggle">
        <button
          type="button"
          className={`tg${tocada && valor ? " on" : ""}`}
          onClick={() => onResponder(true)}
        >
          Sí
        </button>
        <button
          type="button"
          className={`tg${tocada && !valor ? " on no" : ""}`}
          onClick={() => onResponder(false)}
        >
          No
        </button>
      </div>
    </div>
  );
}
