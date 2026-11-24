import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registrarAlExpirar, tokenGuardado } from "../api/cliente";
import { authApi } from "../api/servicios";
import { useToast } from "../components/ui/Toast";

const AuthContext = createContext(null);

/** Guarda el JWT y el usuario actual; expone login, registro, logout y refresco del perfil. */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => Boolean(tokenGuardado.leer()));
  const navigate = useNavigate();
  const toast = useToast();

  const limpiarSesion = useCallback(() => {
    tokenGuardado.borrar();
    setUsuario(null);
  }, []);

  // Sesión vencida o revocada en el servidor: se cierra y se vuelve al login
  useEffect(() => {
    registrarAlExpirar(() => {
      limpiarSesion();
      toast.aviso("Tu sesión terminó. Inicia sesión de nuevo.");
      navigate("/login", { replace: true });
    });
  }, [limpiarSesion, navigate, toast]);

  // Al recargar la página, recupera el usuario a partir del token guardado
  useEffect(() => {
    if (!tokenGuardado.leer()) return;
    authApi
      .yo()
      .then(setUsuario)
      .catch(() => limpiarSesion())
      .finally(() => setCargando(false));
  }, [limpiarSesion]);

  const iniciarSesion = useCallback(async (correo, contrasena) => {
    const r = await authApi.login(correo, contrasena);
    tokenGuardado.guardar(r.token);
    setUsuario(r.usuario);
    return r.usuario;
  }, []);

  const registrarse = useCallback(async (datos) => {
    const r = await authApi.registro(datos);
    tokenGuardado.guardar(r.token);
    setUsuario(r.usuario);
    return r.usuario;
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await authApi.logout(); // invalida el token en el servidor
    } catch {
      /* si falla la red igual cerramos localmente */
    }
    limpiarSesion();
    navigate("/login", { replace: true });
  }, [limpiarSesion, navigate]);

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      rol: usuario?.rol,
      esAdmin: usuario?.rol === "ADMIN",
      esDocente: usuario?.rol === "DOCENTE",
      esEstudiante: usuario?.rol === "ESTUDIANTE",
      iniciarSesion,
      registrarse,
      cerrarSesion,
      actualizarUsuario: setUsuario,
    }),
    [usuario, cargando, iniciarSesion, registrarse, cerrarSesion]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
