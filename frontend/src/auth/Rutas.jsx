import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { PantallaCarga } from "../components/ui/Cargando";
import NoAutorizado from "../pages/NoAutorizado";

/** Solo deja pasar con sesión iniciada. Si no, manda al login y recuerda a dónde quería ir. */
export function RutaPrivada() {
  const { autenticado, cargando } = useAuth();
  const location = useLocation();
  if (cargando) return <PantallaCarga />;
  if (!autenticado) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}

/** Restringe por rol. Muestra la pantalla 403 si el rol no alcanza. */
export function RutaRol({ roles }) {
  const { rol } = useAuth();
  if (!roles.includes(rol)) return <NoAutorizado />;
  return <Outlet />;
}

/** Login y registro: si ya hay sesión, va directo al panel. */
export function RutaPublica() {
  const { autenticado, cargando } = useAuth();
  if (cargando) return <PantallaCarga />;
  if (autenticado) return <Navigate to="/app" replace />;
  return <Outlet />;
}
