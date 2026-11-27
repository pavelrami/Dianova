/**
 * Validaciones del frontend. Los textos coinciden con los del backend (Bean Validation)
 * para que el usuario vea el mismo mensaje sin importar quién detectó el error.
 * Cada regla recibe (valor, todosLosValores) y devuelve un mensaje o null.
 */
export const requerido = (msg = "Este campo es obligatorio") => (v) =>
  v === null || v === undefined || String(v).trim() === "" ? msg : null;

export const longitud = (min, max, nombre = "El campo") => (v) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (min && s.length < min) return `${nombre} debe tener al menos ${min} caracteres`;
  if (max && s.length > max) return `${nombre} no puede superar ${max} caracteres`;
  return null;
};

export const correo = () => (v) =>
  !v ? null : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? null : "Escribe un correo válido";

/** Reglas de contraseña segura: 8+ caracteres, una mayúscula, un número y un carácter especial. */
export const REGLAS_CONTRASENA = [
  { id: "largo", texto: "Al menos 8 caracteres", ok: (v) => v.length >= 8 },
  { id: "mayus", texto: "Una letra mayúscula", ok: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v) },
  { id: "numero", texto: "Un número", ok: (v) => /\d/.test(v) },
  { id: "especial", texto: "Un carácter especial (# ! @ $ …)", ok: (v) => /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/.test(v) },
];

export const contrasenaSegura = ({ opcional = false } = {}) => (v) => {
  const s = v ?? "";
  if (!s) return opcional ? null : "La contraseña es obligatoria";
  if (s.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (s.length > 72) return "La contraseña no puede superar 72 caracteres";
  if (!/[A-ZÁÉÍÓÚÑ]/.test(s)) return "La contraseña debe incluir al menos una letra mayúscula";
  if (!/\d/.test(s)) return "La contraseña debe incluir al menos un número";
  if (!/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/.test(s)) return "La contraseña debe incluir al menos un carácter especial (por ejemplo # ! @ $)";
  if (/\s/.test(s)) return "La contraseña no puede contener espacios";
  return null;
};

export const iguales = (otro, msg = "Las contraseñas no coinciden") => (v, todos) =>
  v && todos[otro] !== v ? msg : null;

export const telefono = () => (v) =>
  !v ? null : /^\+[1-9]\d{7,14}$/.test(String(v).trim()) ? null : "Usa formato internacional, por ejemplo +5215512345678";

export const codigo = () => (v) => (/^\d{6}$/.test((v || "").trim()) ? null : "El código tiene 6 dígitos");

export const url = () => (v) =>
  !v ? null : /^https?:\/\/\S+$/.test(String(v).trim()) ? null : "Escribe una URL que empiece con http:// o https://";

export const colorHex = () => (v) => (/^#[0-9A-Fa-f]{6}$/.test(v || "") ? null : "El color debe tener formato #RRGGBB");

export const entero = (min, max, nombre = "El valor") => (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n)) return `${nombre} debe ser un número entero`;
  if (min !== undefined && n < min) return `${nombre} mínimo es ${min}`;
  if (max !== undefined && n > max) return `${nombre} máximo es ${max}`;
  return null;
};

export const fechaFutura = (msg = "Debe ser una fecha futura") => (v) =>
  !v ? null : new Date(v).getTime() > Date.now() ? null : msg;

/** fin debe ser posterior a inicio (eventos, horarios, periodos). */
export const posteriorA = (campoInicio, msg = "Debe ser posterior al inicio") => (v, todos) =>
  !v || !todos[campoInicio] ? null : String(v) > String(todos[campoInicio]) ? null : msg;
