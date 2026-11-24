import { api } from "./cliente";

/** Quita parámetros vacíos para que la URL quede limpia (el backend los trata como "sin filtro"). */
const limpiar = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== "" && v !== null && v !== undefined));

const datos = (promesa) => promesa.then((r) => r.data);

export const authApi = {
  login: (correo, contrasena) => datos(api.post("/auth/login", { correo, contrasena })),
  registro: (body) => datos(api.post("/auth/registro", body)),
  logout: () => datos(api.post("/auth/logout")),
  yo: () => datos(api.get("/auth/yo")),
  recuperar: (correo) => datos(api.post("/auth/recuperar", { correo })),
  restablecer: (token, contrasena) => datos(api.post("/auth/restablecer", { token, contrasena })),
};

export const perfilApi = {
  actualizar: (body) => datos(api.put("/perfil", body)),
  cambiarContrasena: (body) => datos(api.put("/perfil/contrasena", body)),
  preferencias: () => datos(api.get("/perfil/preferencias")),
  guardarPreferencias: (body) => datos(api.put("/perfil/preferencias", body)),
};

export const resumenApi = {
  resumen: () => datos(api.get("/resumen")),
  calendario: (params, signal) => datos(api.get("/calendario", { params: limpiar(params), signal })),
};

export const tareasApi = {
  listar: (params, signal) => datos(api.get("/tareas", { params: limpiar(params), signal })),
  obtener: (id) => datos(api.get(`/tareas/${id}`)),
  crear: (body) => datos(api.post("/tareas", body)),
  actualizar: (id, body) => datos(api.put(`/tareas/${id}`, body)),
  publicar: (id) => datos(api.post(`/tareas/${id}/publicar`)),
  eliminar: (id) => datos(api.delete(`/tareas/${id}`)),
  progreso: (id, estado) => datos(api.patch(`/tareas/${id}/progreso`, { estado })),
  seguimientos: (id, params, signal) => datos(api.get(`/tareas/${id}/seguimientos`, { params: limpiar(params), signal })),
};

export const eventosApi = {
  listar: (params, signal) => datos(api.get("/eventos", { params: limpiar(params), signal })),
  crear: (body) => datos(api.post("/eventos", body)),
  actualizar: (id, body) => datos(api.put(`/eventos/${id}`, body)),
  eliminar: (id) => datos(api.delete(`/eventos/${id}`)),
  responder: (id, respuesta) => datos(api.post(`/eventos/${id}/respuesta`, { respuesta })),
  participantes: (id, params, signal) => datos(api.get(`/eventos/${id}/participantes`, { params: limpiar(params), signal })),
  asistencia: (id, pid, asistio) => datos(api.patch(`/eventos/${id}/participantes/${pid}/asistencia`, { asistio })),
};

export const recordatoriosApi = {
  listar: (params, signal) => datos(api.get("/recordatorios", { params: limpiar(params), signal })),
  todos: (params, signal) => datos(api.get("/admin/recordatorios", { params: limpiar(params), signal })),
  crear: (body) => datos(api.post("/recordatorios", body)),
  cancelar: (id) => datos(api.patch(`/recordatorios/${id}/cancelar`)),
  enviar: (id) => datos(api.post(`/recordatorios/${id}/enviar`)),
  eliminar: (id) => datos(api.delete(`/recordatorios/${id}`)),
};

export const materiasApi = {
  listar: (params, signal) => datos(api.get("/materias", { params: limpiar(params), signal })),
  obtener: (id) => datos(api.get(`/materias/${id}`)),
  crear: (body) => datos(api.post("/materias", body)),
  actualizar: (id, body) => datos(api.put(`/materias/${id}`, body)),
  eliminar: (id) => datos(api.delete(`/materias/${id}`)),
  horarios: (id) => datos(api.get(`/materias/${id}/horarios`)),
  crearHorario: (id, body) => datos(api.post(`/materias/${id}/horarios`, body)),
  eliminarHorario: (id, hid) => datos(api.delete(`/materias/${id}/horarios/${hid}`)),
  inscritos: (id, params, signal) => datos(api.get(`/materias/${id}/inscripciones`, { params: limpiar(params), signal })),
  inscribir: (id, estudianteId) => datos(api.post(`/materias/${id}/inscripciones`, { estudianteId })),
  cambiarInscripcion: (iid, estado) => datos(api.patch(`/materias/inscripciones/${iid}`, { estado })),
  eliminarInscripcion: (iid) => datos(api.delete(`/materias/inscripciones/${iid}`)),
};

export const periodosApi = {
  listar: (params, signal) => datos(api.get("/periodos", { params: limpiar(params), signal })),
  crear: (body) => datos(api.post("/periodos", body)),
  actualizar: (id, body) => datos(api.put(`/periodos/${id}`, body)),
  eliminar: (id) => datos(api.delete(`/periodos/${id}`)),
};

export const usuariosApi = {
  listar: (params, signal) => datos(api.get("/admin/usuarios", { params: limpiar(params), signal })),
  crear: (body) => datos(api.post("/admin/usuarios", body)),
  actualizar: (id, body) => datos(api.put(`/admin/usuarios/${id}`, body)),
  estado: (id, activo) => datos(api.patch(`/admin/usuarios/${id}/estado`, { activo })),
  eliminar: (id) => datos(api.delete(`/admin/usuarios/${id}`)),
};
