import axios from "axios";

/**
 * Cliente HTTP único. Envía el JWT en el header Authorization de cada petición
 * y convierte cualquier error en un objeto con mensaje claro y errores por campo.
 */
const CLAVE_TOKEN = "dianova.token";

export const tokenGuardado = {
  leer: () => {
    try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
  },
  guardar: (t) => {
    try { localStorage.setItem(CLAVE_TOKEN, t); } catch { /* modo privado */ }
  },
  borrar: () => {
    try { localStorage.removeItem(CLAVE_TOKEN); } catch { /* modo privado */ }
  },
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenGuardado.leer();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let alExpirar = () => {};
/** El AuthContext registra aquí qué hacer cuando el servidor responde 401 (sesión vencida o revocada). */
export const registrarAlExpirar = (fn) => { alExpirar = fn; };

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const normalizado = normalizarError(error);
    const esLogin = error.config?.url?.includes("/auth/login");
    if (normalizado.estado === 401 && !esLogin && tokenGuardado.leer()) {
      alExpirar();
    }
    return Promise.reject(normalizado);
  }
);

/** { estado, mensaje, errores: {campo: mensaje}, red: boolean } */
export function normalizarError(error) {
  if (error?.estado !== undefined && error?.mensaje) return error;
  if (axios.isCancel?.(error)) return { estado: 0, mensaje: "Petición cancelada", errores: {}, cancelado: true };
  if (!error?.response) {
    const tiempo = error?.code === "ECONNABORTED";
    return {
      estado: 0,
      red: true,
      mensaje: tiempo
        ? "El servidor tardó demasiado en responder. Revisa tu conexión e intenta de nuevo."
        : "No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.",
      errores: {},
    };
  }
  const data = error.response.data || {};
  const estado = error.response.status;
  const porDefecto = {
    400: "Revisa los datos marcados",
    401: "Tu sesión no es válida. Inicia sesión de nuevo",
    403: "No tienes permiso para realizar esta acción",
    404: "No encontramos lo que buscas",
    422: "No se pudo completar la operación",
    500: "Ocurrió un error en el servidor. Intenta más tarde",
  };
  return {
    estado,
    mensaje: data.mensaje || porDefecto[estado] || "Ocurrió un error inesperado",
    errores: data.errores || {},
  };
}
