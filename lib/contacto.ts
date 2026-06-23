// ─────────────────────────────────────────────────────────────────────────
//  Contacto — CTA de WhatsApp
//
//  ⚠️  CAMBIA ESTE NÚMERO por el tuyo, en formato internacional:
//      código de país + número, SOLO dígitos (sin "+", sin espacios).
//      Colombia: 57 + celular de 10 dígitos  →  ej. 573001234567
// ─────────────────────────────────────────────────────────────────────────
export const WHATSAPP_NUMERO = "573106084072"; // Santiago Beltrán (+57 310 608 4072)

/** Construye el enlace wa.me con el mensaje ya escrito. */
export function linkWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}
