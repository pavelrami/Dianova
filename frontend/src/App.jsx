import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { RutaPrivada, RutaPublica, RutaRol } from "./auth/Rutas";
import AppLayout from "./components/layout/AppLayout";
import { PantallaCarga, Spinner } from "./components/ui/Cargando";
import Login from "./pages/publico/Login";
import NoEncontrado from "./pages/NoEncontrado";
import LimiteError from "./components/ui/LimiteError";

// Carga diferida: cada pantalla se descarga solo cuando se visita
const Landing = lazy(() => import("./pages/publico/Landing"));
const Registro = lazy(() => import("./pages/publico/Registro"));
const Recuperar = lazy(() => import("./pages/publico/Recuperar"));
const Resumen = lazy(() => import("./pages/app/Resumen"));
const Tareas = lazy(() => import("./pages/app/Tareas"));
const Calendario = lazy(() => import("./pages/app/Calendario"));
const Eventos = lazy(() => import("./pages/app/Eventos"));
const Recordatorios = lazy(() => import("./pages/app/Recordatorios"));
const Materias = lazy(() => import("./pages/app/Materias"));
const Perfil = lazy(() => import("./pages/app/Perfil"));
const Usuarios = lazy(() => import("./pages/app/admin/Usuarios"));
const Periodos = lazy(() => import("./pages/app/admin/Periodos"));
const Supervision = lazy(() => import("./pages/app/admin/Supervision"));

export default function App() {
  return (
    <Suspense fallback={<PantallaCarga />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<RutaPublica />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<Recuperar />} />
        </Route>
        {/* Antes se recuperaba con un enlace; ahora con un código de 6 dígitos */}
        <Route path="/restablecer" element={<Navigate to="/recuperar" replace />} />

        <Route element={<RutaPrivada />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Pagina><Resumen /></Pagina>} />
            <Route path="tareas" element={<Pagina><Tareas /></Pagina>} />
            <Route path="calendario" element={<Pagina><Calendario /></Pagina>} />
            <Route path="eventos" element={<Pagina><Eventos /></Pagina>} />
            <Route path="recordatorios" element={<Pagina><Recordatorios /></Pagina>} />
            <Route path="materias" element={<Pagina><Materias /></Pagina>} />
            <Route path="perfil" element={<Pagina><Perfil /></Pagina>} />
            {/* Solo administrador */}
            <Route element={<RutaRol roles={["ADMIN"]} />}>
              <Route path="admin/usuarios" element={<Pagina><Usuarios /></Pagina>} />
              <Route path="admin/periodos" element={<Pagina><Periodos /></Pagina>} />
              <Route path="admin/recordatorios" element={<Pagina><Supervision /></Pagina>} />
            </Route>
            <Route path="*" element={<NoEncontrado interno />} />
          </Route>
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </Suspense>
  );
}

function Pagina({ children }) {
  const { pathname } = useLocation();
  return (
    <LimiteError clave={pathname}>
      <Suspense fallback={<Spinner texto="Abriendo…" />}>{children}</Suspense>
    </LimiteError>
  );
}
