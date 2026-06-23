import type { IconoMetafora } from "@/lib/metaforas";

// Íconos de línea (heredan color vía currentColor).
export function Icono({ tipo }: { tipo: IconoMetafora }) {
  const p: Record<IconoMetafora, React.ReactNode> = {
    carro: (
      <>
        <path d="M19 17h1c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 7.5c-.4-.9-1.2-1.5-2.1-1.5H7.7c-.9 0-1.7.6-2.1 1.5L4.5 11.1C3.7 11.3 3 12.1 3 13v3c0 .6.4 1 1 1h1" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    moto: (
      <>
        <circle cx="5" cy="17" r="3" />
        <circle cx="19" cy="17" r="3" />
        <path d="M5 17l4-6h4M9 11l2-3h3l2.5 5" />
        <path d="M16 17l-1.5-6" />
      </>
    ),
    avion: (
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    ),
    casa: (
      <>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
  };
  return (
    <svg
      className="icono-metafora"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {p[tipo]}
    </svg>
  );
}
