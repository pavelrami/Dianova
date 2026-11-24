const LOCALE = "es-MX";

/** El backend envía fechas locales sin zona ("2026-11-23T23:59:00"); el navegador las interpreta como hora local. */
export const aFecha = (v) => (v instanceof Date ? v : v ? new Date(v) : null);

const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const difDias = (a, b) => Math.round((inicioDia(a) - inicioDia(b)) / 86400000);

export const hora = (v) => aFecha(v)?.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }) ?? "";

/** "08:30" en formato de 24 h (bloques del calendario, como en el prototipo). */
export const horaCorta = (v) => aFecha(v)?.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) ?? "";

export const fechaCorta = (v) =>
  aFecha(v)?.toLocaleDateString(LOCALE, { weekday: "short", day: "numeric", month: "short" }).replace(".", "") ?? "";

export const fechaLarga = (v) =>
  aFecha(v)?.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) ?? "";

export const fechaHora = (v) => (v ? `${fechaCorta(v)} · ${hora(v)}` : "");

/** "Hoy · 23:59", "Mañana · 18:00", "Ayer · 10:00" o "jue 26 nov · 14:00" (como en el prototipo). */
export function relativa(v) {
  const d = aFecha(v);
  if (!d) return "";
  const dias = difDias(d, new Date());
  const h = hora(d);
  if (dias === 0) return `Hoy · ${h}`;
  if (dias === 1) return `Mañana · ${h}`;
  if (dias === -1) return `Ayer · ${h}`;
  return `${capitalizar(fechaCorta(d))} · ${h}`;
}

export const vencida = (v) => aFecha(v) < new Date();
export const esHoy = (v) => difDias(aFecha(v), new Date()) === 0;

export const capitalizar = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

/** Para <input type="datetime-local">: "2026-11-23T18:00" en hora local. */
export function aInputFechaHora(v) {
  const d = aFecha(v);
  if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function aInputFecha(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function saludo(nombre) {
  const h = new Date().getHours();
  const s = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  return `${s}, ${nombre}`;
}

export const DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DIAS_CORTOS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
