import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/** Estructura interna: menú lateral (fijo en escritorio, cajón en celular) + barra superior en todas las vistas. */
export default function AppLayout() {
  const [menuMovil, setMenuMovil] = useState(false);
  const [colapsado, setColapsado] = useState(() => {
    try { return localStorage.getItem("dianova.menu") === "1"; } catch { return false; }
  });
  const location = useLocation();

  useEffect(() => setMenuMovil(false), [location.pathname]);
  useEffect(() => {
    try { localStorage.setItem("dianova.menu", colapsado ? "1" : "0"); } catch { /* sin almacenamiento */ }
  }, [colapsado]);

  return (
    <div className="min-h-svh bg-crema">
      <Sidebar
        abiertoMovil={menuMovil}
        onCerrarMovil={() => setMenuMovil(false)}
        colapsado={colapsado}
        onColapsar={() => setColapsado((c) => !c)}
      />
      <div className={`transition-[padding] duration-300 ${colapsado ? "lg:pl-[88px]" : "lg:pl-[272px]"}`}>
        <Navbar onAbrirMenu={() => setMenuMovil(true)} />
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-4 sm:px-6 lg:px-10 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
