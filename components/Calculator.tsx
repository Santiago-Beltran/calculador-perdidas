"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  calcular,
  formatearCompacto,
  formatearMoneda,
  formatearNum,
  COMISION_MIN,
  COMISION_MAX,
  CIERRE_BUENO,
  CIERRE_CLASE_MUNDIAL,
  PERM_MIN,
  PERM_MAX,
  PREGUNTAS_OPERACION,
  PESOS_OPERACION,
  BRECHAS,
  PREDETERMINADO,
  type Entradas,
  type Moneda,
} from "@/lib/calc";
import { num, clamp } from "@/lib/util";
import { metaforaPara } from "@/lib/metaforas";
import { linkWhatsApp } from "@/lib/contacto";
import { Icono } from "./ui/Icono";
import { BrandBar } from "./ui/Marca";
import { MoneyField, NumberField } from "./ui/Campos";
import { CurrencyToggle } from "./ui/CurrencyToggle";
import { Stepper } from "./ui/Stepper";
import { OperacionItem } from "./ui/OperacionItem";
import { BenchmarkBar } from "./ui/BenchmarkBar";

type Fase = "intro" | "form" | "reveal" | "plan";
// Orden de pasos: Atracción → Cliente → Cierre → Operación
const PASOS_NOMBRES = ["Atracción", "Cliente", "Cierre", "Operación"];
const TOTAL_PASOS = 4;

// Placeholders de referencia por moneda (valores razonables, no precargados).
const PLACEHOLDER: Record<Moneda, { mercadeo: string; costo: string; canon: string }> = {
  COP: { mercadeo: "3.500.000", costo: "7.600", canon: "3.500.000" },
  USD: { mercadeo: "1.000", costo: "5", canon: "900" },
};

function IconoWhatsApp() {
  return (
    <svg className="wa" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.06 24l1.69-6.16a11.86 11.86 0 01-1.59-5.95C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.4 3.49 11.82 11.82 0 013.48 8.41c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.69-1.45L.06 24zM6.6 20.13l.36.22a9.86 9.86 0 005.03 1.38h.01c5.45 0 9.89-4.43 9.89-9.88a9.82 9.82 0 00-2.9-6.99 9.82 9.82 0 00-6.98-2.9c-5.46 0-9.9 4.44-9.9 9.89a9.86 9.86 0 001.51 5.26l.24.38-1 3.65 3.74-.98zM17.5 14.38c-.07-.12-.27-.2-.56-.34-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41z" />
    </svg>
  );
}

function prefiereMenosMovimiento() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function useCountUp(target: number, activo: boolean, duracion = 1800) {
  const [valor, setValor] = useState(0);
  const refInicio = useRef<number | null>(null);
  useEffect(() => {
    if (!activo) {
      setValor(0);
      refInicio.current = null;
      return;
    }
    // Sin animación si el usuario pidió menos movimiento.
    if (prefiereMenosMovimiento()) {
      setValor(target);
      return;
    }
    let raf = 0;
    const tick = (t: number) => {
      if (refInicio.current === null) refInicio.current = t;
      const p = Math.min((t - refInicio.current) / duracion, 1);
      setValor(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setValor(target);
    };
    raf = requestAnimationFrame(tick);
    const garantia = setTimeout(() => setValor(target), duracion + 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(garantia);
    };
  }, [target, activo, duracion]);
  return valor;
}

export default function Calculator() {
  const [fase, setFase] = useState<Fase>("intro");
  const [paso, setPaso] = useState(0);
  const [moneda, setMoneda] = useState<Moneda>("COP");

  // El formulario inicia VACÍO: pantalla limpia, queda claro qué hay que llenar.
  const [mercadeoMes, setMercadeo] = useState("");
  const [costoProspecto, setCosto] = useState("");
  const [cierresMes, setCierres] = useState("");
  const [canon, setCanon] = useState("");
  const [comision, setComision] = useState(PREDETERMINADO.comision);
  const [permanencia, setPermanencia] = useState(PREDETERMINADO.permanencia);
  const [operacion, setOperacion] = useState<boolean[]>(PREDETERMINADO.operacion);
  // Cada pregunta de operación debe responderse explícitamente (no asumir "No").
  const [opTocada, setOpTocada] = useState<boolean[]>(() =>
    PREGUNTAS_OPERACION.map(() => false),
  );
  const [errorPaso, setErrorPaso] = useState(false);

  const entradas: Entradas = useMemo(
    () => ({
      mercadeoMes: num(mercadeoMes),
      costoProspecto: num(costoProspecto),
      cierresMes: num(cierresMes),
      canon: num(canon),
      comision,
      permanencia,
      operacion,
    }),
    [mercadeoMes, costoProspecto, cierresMes, canon, comision, permanencia, operacion],
  );
  const d = useMemo(() => calcular(entradas), [entradas]);
  const meta = useMemo(() => metaforaPara(d.perdidaAnual, moneda), [d.perdidaAnual, moneda]);

  // Brechas: las respuestas "No". La #1 (mayor peso) es el gancho; todas van al mensaje.
  const brechas = useMemo(() => {
    const noIdx = PREGUNTAS_OPERACION.map((_, i) => i).filter((i) => !operacion[i]);
    if (noIdx.length === 0) return { top: null, lista: [] as string[] };
    const peso = (i: number) => PESOS_OPERACION[i] ?? 1;
    const totalNo = noIdx.reduce((a, i) => a + peso(i), 0);
    const top = noIdx.reduce((mejor, i) => (peso(i) > peso(mejor) ? i : mejor), noIdx[0]);
    return {
      top: { etiqueta: BRECHAS[top], monto: (peso(top) / totalNo) * d.perdidaAnual },
      lista: noIdx.map((i) => BRECHAS[i]),
    };
  }, [operacion, d.perdidaAnual]);

  // Cambiar de moneda limpia los montos (un valor en COP no aplica como USD).
  const cambiarMoneda = (m: Moneda) => {
    if (m === moneda) return;
    setMoneda(m);
    setMercadeo("");
    setCosto("");
    setCierres("");
    setCanon("");
    setErrorPaso(false);
  };

  const valorAnimado = useCountUp(d.perdidaAnual, fase === "reveal");

  // Al cambiar de fase/paso, vuelve arriba para una transición limpia (sin scroll residual).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [fase, paso]);

  // Todos los campos son obligatorios: cada paso valida antes de avanzar.
  const pasoValido = (p: number) => {
    if (p === 0) return num(mercadeoMes) > 0 && num(costoProspecto) > 0;
    if (p === 1) return num(canon) > 0;
    if (p === 2) return cierresMes.trim() !== "";
    if (p === 3) return opTocada.every(Boolean);
    return true;
  };

  const avanzar = () => {
    if (!pasoValido(paso)) {
      setErrorPaso(true);
      return;
    }
    if (paso < TOTAL_PASOS - 1) {
      setErrorPaso(false);
      setPaso((p) => p + 1);
      return;
    }
    // Último paso: exige que TODOS estén completos (por si saltó con el stepper).
    const incompleto = [0, 1, 2, 3].find((p) => !pasoValido(p));
    if (incompleto !== undefined) {
      setErrorPaso(true);
      setPaso(incompleto);
      return;
    }
    setErrorPaso(false);
    setFase("reveal");
  };
  const retroceder = () => {
    setErrorPaso(false);
    if (paso > 0) setPaso((p) => p - 1);
    else setFase("intro");
  };

  // Navegación libre entre secciones desde el stepper superior.
  const irAPaso = (i: number) => {
    setErrorPaso(false);
    setPaso(i);
  };

  const responderOp = (i: number, val: boolean) => {
    setOperacion((p) => p.map((v, j) => (j === i ? val : v)));
    setOpTocada((p) => p.map((v, j) => (j === i ? true : v)));
    setErrorPaso(false);
  };

  const limpiarError = () => setErrorPaso(false);

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (fase === "intro") {
    return (
      <main className="escenario-stage">
        <div className="marco intro">
          <BrandBar label="Diagnóstico" />
          <span className="eyebrow">Calculadora de oportunidades perdidas</span>
          <h1 className="intro-titulo">
            La gente llega. <em>¿Por qué los arriendos no?</em>
          </h1>
          <div className="intro-acciones">
            <button className="btn btn-primario" onClick={() => setFase("form")}>
              Empezar mi diagnóstico →
            </button>
            <span className="intro-meta">Toma 1 minuto · sin registro</span>
          </div>
        </div>
      </main>
    );
  }

  // ── WIZARD ─────────────────────────────────────────────────────────────
  if (fase === "form") {
    const nivel =
      d.tasaCierre >= CIERRE_CLASE_MUNDIAL
        ? "Excelente tasa de cierre."
        : d.tasaCierre >= CIERRE_BUENO
          ? "Vas bien. La barra te ubica frente a los referentes del sector."
          : "Hay margen para subirla. La barra te ubica frente a los referentes del sector.";

    return (
      <main className="escenario-stage">
        <div className="marco">
          <BrandBar label="" />

          <div className="stepper">
            {PASOS_NOMBRES.map((nombre, i) => {
              const completo = pasoValido(i);
              const activo = i === paso;
              const falta = !completo && !activo && errorPaso;
              return (
                <button
                  type="button"
                  key={nombre}
                  className={`step${activo ? " activo" : ""}${completo && !activo ? " hecho" : ""}${falta ? " falta" : ""}`}
                  onClick={() => irAPaso(i)}
                  aria-current={activo ? "step" : undefined}
                >
                  <span className="step-num">
                    {falta ? "!" : completo && !activo ? "✓" : i + 1}
                  </span>
                  <span className="step-lbl">{nombre}</span>
                </button>
              );
            })}
          </div>

          <form
            className="paso-q"
            key={paso}
            onSubmit={(e) => {
              e.preventDefault();
              avanzar();
            }}
          >
            {/* ── PASO 1: ATRACCIÓN ── */}
            {paso === 0 && (
              <>
                <span className="paso-indice">Paso 01 · Tu atracción</span>
                <h2 className="paso-pregunta">¿Cuánto inviertes en pauta digital?</h2>

                <CurrencyToggle moneda={moneda} onChange={cambiarMoneda} />

                <div className="campos-grid">
                  <MoneyField
                    id="mercadeo"
                    label="Inversión en pauta al mes"
                    value={mercadeoMes}
                    onChange={(v) => {
                      setMercadeo(v);
                      limpiarError();
                    }}
                    placeholder="0"
                    moneda={moneda}
                    error={errorPaso && num(mercadeoMes) <= 0 ? "Ingresa cuánto inviertes al mes." : undefined}
                    help="Portales, redes y publicidad al mes."
                  />
                  <MoneyField
                    id="costo"
                    label="Costo por prospecto"
                    value={costoProspecto}
                    onChange={(v) => {
                      setCosto(v);
                      limpiarError();
                    }}
                    placeholder="0"
                    moneda={moneda}
                    error={errorPaso && num(costoProspecto) <= 0 ? "Ingresa el costo por prospecto." : undefined}
                    help="Lo que te cuesta cada interesado."
                  />
                </div>
              </>
            )}

            {/* ── PASO 2: VALOR DEL CLIENTE ── */}
            {paso === 1 && (
              <>
                <span className="paso-indice">Paso 02 · El cliente</span>
                <h2 className="paso-pregunta">¿Cuánto vale cada cliente?</h2>

                <CurrencyToggle moneda={moneda} onChange={cambiarMoneda} />

                <MoneyField
                  id="canon"
                  label="Canon de arriendo promedio"
                  value={canon}
                  onChange={(v) => {
                    setCanon(v);
                    limpiarError();
                  }}
                  placeholder="0"
                  moneda={moneda}
                  error={errorPaso && num(canon) <= 0 ? "Ingresa el canon promedio." : undefined}
                  ancho
                />

                <div className="campos-grid" style={{ marginTop: "1.6rem" }}>
                  <Stepper
                    label="Comisión de administración"
                    display={`${comision}%`}
                    onDec={() => setComision((c) => clamp(c - 1, COMISION_MIN, COMISION_MAX))}
                    onInc={() => setComision((c) => clamp(c + 1, COMISION_MIN, COMISION_MAX))}
                    decLabel="Bajar comisión"
                    incLabel="Subir comisión"
                  />
                  <Stepper
                    label="Permanencia del contrato"
                    display={`${permanencia} ${permanencia === 1 ? "mes" : "meses"}`}
                    onDec={() => setPermanencia((m) => clamp(m - 1, PERM_MIN, PERM_MAX))}
                    onInc={() => setPermanencia((m) => clamp(m + 1, PERM_MIN, PERM_MAX))}
                    decLabel="Menos meses"
                    incLabel="Más meses"
                  />
                </div>

                {d.comisionPorCliente > 0 && (
                  <div className="resaltado grande">
                    Cada cliente vale <b>{formatearMoneda(d.comisionPorCliente, moneda)}</b>
                    <span className="sub">de comisión durante todo el contrato (su LTV)</span>
                  </div>
                )}
              </>
            )}

            {/* ── PASO 3: CIERRE ── */}
            {paso === 2 && (
              <>
                <span className="paso-indice">Paso 03 · Tu cierre</span>
                <h2 className="paso-pregunta">¿Cuántos arriendos nuevos firmas cada mes?</h2>

                <NumberField
                  id="cierres"
                  value={cierresMes}
                  onChange={(v) => {
                    setCierres(v);
                    limpiarError();
                  }}
                  placeholder="0"
                  error={
                    errorPaso && cierresMes.trim() === ""
                      ? "Ingresa cuántos arriendos nuevos cierras (0 si ninguno)."
                      : undefined
                  }
                  help="Contratos nuevos al mes, no la cartera vieja."
                />

                {num(cierresMes) > 0 && d.prospectosMes > 0 && (
                  <BenchmarkBar
                    tasa={d.tasaCierre}
                    variant="light"
                    footer={
                      <p className={`cierre-msg${d.tasaCierre * 100 < 5 ? " bajo" : ""}`}>{nivel}</p>
                    }
                  />
                )}
              </>
            )}

            {/* ── PASO 4: OPERACIÓN ── */}
            {paso === 3 && (
              <>
                <span className="paso-indice">Paso 04 · Tu operación</span>
                <h2 className="paso-pregunta">¿Cómo funciona tu operación hoy?</h2>

                <div className="crm-lista">
                  {PREGUNTAS_OPERACION.map((q, i) => (
                    <OperacionItem
                      key={i}
                      pregunta={q}
                      valor={operacion[i]}
                      tocada={opTocada[i]}
                      falta={errorPaso && !opTocada[i]}
                      onResponder={(v) => responderOp(i, v)}
                    />
                  ))}
                </div>
                {errorPaso && !opTocada.every(Boolean) && (
                  <span className="campo-error">Responde todas las preguntas para continuar.</span>
                )}
              </>
            )}

            <div className="wizard-acciones">
              <button type="submit" className={`btn btn-primario ${pasoValido(paso) ? "animacion-siguiente" : ""}`}>
                {paso < TOTAL_PASOS - 1 ? "Siguiente →" : "Ver lo que pierdo →"}
              </button>
              <button type="button" className="btn btn-texto" onClick={retroceder}>
                Atrás
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // ── PLAN (qué sigue → WhatsApp) ────────────────────────────────────────
  if (fase === "plan") {
    const fugaUno = brechas.top ? ` Mi fuga #1: ${brechas.top.etiqueta}.` : "";
    const mensajeWa =
      `Hola Santiago, hice el diagnóstico y pierdo aproximadamente ` +
      `${formatearMoneda(d.perdidaAnual, moneda)} al año.${fugaUno} ` +
      `Quiero los 2 arreglos simples que puedo hacer esta semana para taparla.`;

    // Diagnóstico por volumen: dónde está el cuello de botella (no promesa de ROI).
    const volumen = d.prospectosMes;
    const segmento = volumen < 100 ? "bajo" : volumen > 400 ? "alto" : "medio";
    const lecturaHonesta = {
      bajo: "Con este volumen, lo más probable es que tu cuello de botella sea la atracción: están llegando pocos prospectos. Antes de pulir el seguimiento, mira cómo traer más — ahí está tu mayor palanca.",
      medio: "Tienes un flujo decente. Hay arreglos manuales que ya te devuelven buena parte; empieza por ahí antes de invertir en sistemas grandes.",
      alto: "Atracción no es tu problema — está llegando bastante. Tu cuello de botella es la gestión: lo que entra no se está trabajando a fondo.",
    }[segmento];
    const iaTexto = {
      bajo: "A este nivel, la IA no es lo primero. Lo que rinde son sistemas simples —un CRM, conectar lo que ya usas— para estandarizar y no perder lo que llega. Y sobre todo, traer más gente: con este volumen, la atracción suele ser el cuello de botella. La IA viene después, cuando el volumen la justifique.",
      medio: "Aún no es la prioridad. Primero ordena el dato y el seguimiento con algo simple (un CRM bien usado); la IA rinde cuando ya hay una base limpia que la alimente.",
      alto: "Probablemente la quieres, y tiene sentido. Pero se construye sobre tus datos: si el seguimiento se pierde, hasta el mejor modelo decide a ciegas — y decidir con datos errados es peor que sin datos. Primero una sola fuente de verdad y un seguimiento que no se enfríe; sobre eso, la IA sí rinde.",
    }[segmento];

    return (
      <main className="escenario-stage plan-stage">
        <div className="marco">
          <BrandBar label="" />
          <section className="plan">
            <h2 className="plan-titulo">¿Cómo lo recupero?</h2>

            <div className="lectura-honesta">
              <span className="lh-label">Lectura honesta · tu caso</span>
              <p>{lecturaHonesta}</p>
            </div>

            <details className="ia-detalle">
              <summary>¿Necesito IA?</summary>
              <p>{iaTexto}</p>
            </details>

            <p className="plan-intro">
              Sea cual sea tu caso, los <b>2 arreglos para tu fuga #1</b> los puedes hacer tú esta
              semana. Te los paso por WhatsApp, gratis.
            </p>

            <a
              className="btn-recuperar grande"
              href={linkWhatsApp(mensajeWa)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconoWhatsApp />
              Enviar mi resultado →
            </a>
            <p className="plan-reaseguro">Gratis · Sin reunión · Te respondo yo</p>
            <button className="btn-volver" onClick={() => setFase("reveal")}>
              Volver
            </button>
          </section>
        </div>
      </main>
    );
  }

  // ── SIN BRECHAS (todo "Sí" ⇒ pérdida $0): pantalla de felicitación ──────
  if (d.perdidaAnual < 1) {
    const mensajeFelicitacion =
      `Hola Santiago, hice el diagnóstico de oportunidades perdidas y mi operación está ` +
      `sólida en los fundamentales. Quiero ver cómo superar mis metas, no solo llegar.`;
    return (
      <main className="escenario-stage">
        <div className="marco">
          <BrandBar label="Resultado" />
          <section className="revelacion">
            <div className="revelacion-inner">
              <div className="felicita-check" aria-hidden="true" style={{ marginBottom: "1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: "48px", height: "48px", color: "var(--acento)" }}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 className="felicita-titulo" style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
                Felicidades. Ya tienes el 80%.
              </h2>
              <p className="felicita-texto" style={{ fontSize: "1.1rem", marginBottom: "2rem", color: "var(--fg-dim)" }}>
                Si quieres saber otras cualidades de operaciones exitosas...
              </p>

              <a
                className="btn-recuperar"
                href={linkWhatsApp(mensajeFelicitacion)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconoWhatsApp />
                Escríbeme →
              </a>
              <button
                className="btn-volver"
                onClick={() => {
                  setFase("form");
                  setPaso(0);
                }}
              >
                Ajustar mis números
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // ── REVELACIÓN ─────────────────────────────────────────────────────────
  const [numCompacto, unidad] = (() => {
    const s = formatearCompacto(valorAnimado, moneda);
    const i = s.lastIndexOf(" ");
    return i > 0 ? [s.slice(0, i), s.slice(i + 1)] : [s, ""];
  })();

  // Pacing por tiempo de lectura: cada etapa espera ~lo que toma leer la anterior
  // (un poco más rápido que el promedio ≈4 palabras/seg → usamos 4.6).
  const palabras = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const VEL_LECTURA = 4.6;
  const dCifra = 0.15;
  const dEquivale = 2.8; // deja "calar" la cifra tras el conteo (~1.8s)
  const dBoton = +(
    dEquivale + Math.max(1.9, palabras("El equivalente a " + meta.frase) / VEL_LECTURA + 0.6)
  ).toFixed(2);
  // El CTA aparece con su gancho ("tu fuga #1"); deja leerlo antes del latido y del resto.
  const dLatido = +(dBoton + 2.0).toFixed(2);
  const dResto = +(dBoton + 2.9).toFixed(2);

  return (
    <main className="escenario-stage">
      <div className="marco">
        <BrandBar label="Resultado" />

        <section className="revelacion">
          <div className="revelacion-inner">
            {/* Etapa 1 — la cifra (con conteo rápido) */}
            <div className="rv-stage rv-1" style={{ marginBottom: "1.5rem", animationDelay: `${dCifra}s` }}>
              <span className="final-label">Estás dejando ir aproximadamente</span>
              <div className="final-cifra">
                <span>
                  {numCompacto}
                  {unidad && <span className="u"> {unidad}</span>}
                </span>
                <span className="final-moneda" style={{ display: "inline-block", fontSize: "0.45em", fontWeight: "normal", marginLeft: "12px", textAlign: "left", lineHeight: "1.1" }}>
                  {moneda}<br/>al año
                </span>
              </div>
            </div>

            {/* Etapa 2 — "el equivalente a…" (aparece tras cargar la cifra) */}
            <div className="rv-stage rv-2 metafora-destacada" style={{
                marginBottom: "2rem",
                backgroundColor: "var(--bg-card)",
                padding: "1.2rem",
                borderRadius: "var(--radio)",
                border: "1px solid var(--borde)",
                animationDelay: `${dEquivale}s`,
              }}>
              <div className="iconos-grid" style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.4rem",
                  marginBottom: "1rem"
                }}>
                {meta.items.map((it, idx1) => (
                  Array.from({ length: Math.min(it.cantidad, 20) }).map((_, idx2) => (
                    <span key={`${idx1}-${idx2}`} style={{
                        width: "28px",
                        height: "28px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--acento)"
                      }}>
                      <Icono tipo={it.icono} />
                    </span>
                  ))
                ))}
                {meta.items.some(it => it.cantidad > 20) && (
                  <span style={{ alignSelf: "center", fontSize: "0.9rem", fontWeight: "bold", color: "var(--acento)", marginLeft: "4px" }}>+</span>
                )}
              </div>
              <div style={{ width: "100%", height: "1px", background: "var(--borde)", marginBottom: "1rem", opacity: 0.8 }}></div>
              <p style={{ margin: 0, fontSize: "1rem", textAlign: "center", color: "var(--fg)" }}>
                El equivalente a <b style={{ color: "var(--fg)" }}>{meta.frase}</b>.
              </p>
            </div>

            {/* Etapa 3 — el gancho (tu fuga #1) + el CTA con latido */}
            <div className="rv-stage rv-3" style={{ animationDelay: `${dBoton}s` }}>
              {brechas.top && (
                <p className="fuga-top">
                  Tu fuga #1: <b>{brechas.top.etiqueta}</b> — pesa ≈{" "}
                  {formatearCompacto(brechas.top.monto, moneda)}/año.
                </p>
              )}
              <button
                className="btn-recuperar cta-atencion"
                style={{ animationDelay: `${dLatido}s` }}
                onClick={() => setFase("plan")}
              >
                ¿Cómo lo recupero? →
              </button>
            </div>

            {/* Etapa 4 — el resto, al final */}
            <div className="rv-stage rv-4" style={{ animationDelay: `${dResto}s` }}>
              <button
                className="btn-volver"
                onClick={() => {
                  setFase("form");
                  setPaso(0);
                }}
              >
                Ajustar mis números
              </button>

              <details className="detalles-calculo" style={{ textAlign: "left", marginTop: "2rem", padding: "1rem", background: "var(--bg-card)", borderRadius: "var(--radio)", fontSize: "0.85rem", border: "1px solid var(--borde)" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold", color: "var(--fg)" }}>¿Cómo se calcula este número?</summary>
                <ul style={{ marginTop: "1rem", paddingLeft: "1.2rem", color: "var(--fg-dim)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <li><b>Prospectos generados:</b> Inversión mensual ({formatearMoneda(entradas.mercadeoMes, moneda)}) / Costo por prospecto ({formatearMoneda(entradas.costoProspecto, moneda)}) = {formatearNum(d.prospectosMes)} prospectos/mes.</li>
                  <li><b>Brecha operativa:</b> Según tus respuestas (tiempo de contacto, seguimiento, etc.), estimamos que un <b>{formatearNum(d.tasaSinSeguimiento * 100)}%</b> de los prospectos no recibe atención óptima.</li>
                  <li><b>Oportunidades reales perdidas:</b> Asumimos muy conservadoramente que solo el <b>1%</b> de esos prospectos mal gestionados habría alquilado. Es decir, {formatearNum(d.perdidasMes, 1)} arriendos perdidos al mes ({formatearNum(d.perdidasAno, 1)} al año).</li>
                  <li><b>Valor por cliente (LTV):</b> Comisión del {entradas.comision}% sobre el canon ({formatearMoneda(entradas.canon, moneda)}) durante {entradas.permanencia} meses = {formatearMoneda(d.comisionPorCliente, moneda)}.</li>
                  <li><b>Pérdida anual:</b> {formatearNum(d.perdidasAno, 1)} clientes × {formatearMoneda(d.comisionPorCliente, moneda)} = <b>{formatearMoneda(d.perdidaAnual, moneda)}</b>.</li>
                </ul>
              </details>
            </div>
          </div>
        </section>

        <p className="nota-pie">
          Estimación. La realidad puede variar. En general, este valor representa las oportunidades de mejora disponibles para llegar a tus metas.
        </p>
      </div>
    </main>
  );
}
