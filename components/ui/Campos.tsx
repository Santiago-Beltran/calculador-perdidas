import { formatearMiles, type Moneda } from "@/lib/calc";
import { num, limpiar } from "@/lib/util";

function Ayuda({ error, help }: { error?: string; help?: string }) {
  if (error) return <span className="campo-error">{error}</span>;
  if (help) return <span className="campo-ayuda">{help}</span>;
  return null;
}

/** Campo de dinero: input con miles + selector de moneda. */
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
  return (
    <div className={`campo-num${ancho ? " ancho" : ""}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={`entrada-linea money${error ? " invalido" : ""}`}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={value ? formatearMiles(num(value)) : ""}
          onChange={(e) => onChange(limpiar(e.target.value))}
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
