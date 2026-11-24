import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, CalendarDays, LogOut, UserRound, ChevronDown, Settings } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import Avatar from "../ui/Avatar";
import { ConfirmarModal } from "../ui/Modal";
import { Simbolo } from "../ui/Logo";
import { recordatoriosApi } from "../../api/servicios";
import { relativa } from "../../utils/formato";
import { CANAL, ROLES } from "../../utils/etiquetas";

/** Barra superior visible en toda la parte interna: datos del usuario, avatar, perfil y cerrar sesión. */
export default function Navbar({ onAbrirMenu }) {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [campana, setCampana] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [pendientes, setPendientes] = useState(null);
  const refMenu = useRef(null);
  const refCampana = useRef(null);

  useEffect(() => {
    const fuera = (e) => {
      if (refMenu.current && !refMenu.current.contains(e.target)) setMenu(false);
      if (refCampana.current && !refCampana.current.contains(e.target)) setCampana(false);
    };
    const esc = (e) => e.key === "Escape" && (setMenu(false), setCampana(false));
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  // Próximos recordatorios para la campana
  useEffect(() => {
    const ctrl = new AbortController();
    recordatoriosApi
      .listar({ estado: "PENDIENTE", size: 5, orden: "programado", dir: "asc" }, ctrl.signal)
      .then(setPendientes)
      .catch(() => setPendientes(null));
    return () => ctrl.abort();
  }, [campana]);

  const salir = async () => {
    setSaliendo(true);
    await cerrarSesion();
  };

  if (!usuario) return null;
  const total = pendientes?.totalElementos ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-linea/70 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button type="button" onClick={onAbrirMenu} className="-ml-1 rounded-xl p-2 text-tinta hover:bg-caramelo-suave lg:hidden" aria-label="Abrir menú">
          <Menu className="size-6" />
        </button>
        <Link to="/app" className="flex items-center gap-2 lg:hidden" aria-label="Ir al resumen">
          <Simbolo className="size-8" fondo />
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link to="/app/calendario" className="hidden rounded-xl p-2.5 text-tinta hover:bg-caramelo-suave sm:inline-flex" aria-label="Calendario" title="Calendario">
            <CalendarDays className="size-5" />
          </Link>

          <div className="relative" ref={refCampana}>
            <button
              type="button"
              onClick={() => setCampana((v) => !v)}
              className="relative rounded-xl p-2.5 text-tinta hover:bg-caramelo-suave"
              aria-label={`Recordatorios pendientes: ${total}`}
              aria-expanded={campana}
            >
              <Bell className="size-5" />
              {total > 0 && (
                <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-vino px-1 text-[10px] font-bold leading-4 text-white">
                  {total > 9 ? "9+" : total}
                </span>
              )}
            </button>
            {campana && (
              <div className="animar-entrada absolute right-0 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-linea bg-white shadow-[var(--shadow-suave)]">
                <div className="flex items-center justify-between bg-mantequilla px-4 py-3">
                  <p className="font-semibold text-espresso">Recordatorios</p>
                  <span className="chip bg-white/70 text-espresso">{total} pendientes</span>
                </div>
                <ul className="max-h-80 divide-y divide-linea overflow-y-auto">
                  {pendientes?.contenido?.length ? (
                    pendientes.contenido.map((r) => (
                      <li key={r.id} className="flex gap-3 px-4 py-3">
                        <span className="mt-1 h-10 w-1 shrink-0 rounded-full bg-vino" aria-hidden />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-tinta">{r.tarea?.titulo || r.evento?.titulo}</p>
                          <p className="text-xs text-tenue">
                            {relativa(r.programadoPara)} · {CANAL[r.canal]?.texto}
                          </p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-6 text-center text-sm text-tenue">No tienes recordatorios pendientes.</li>
                  )}
                </ul>
                <Link
                  to="/app/recordatorios"
                  onClick={() => setCampana(false)}
                  className="block border-t border-linea bg-crema-2 px-4 py-3 text-center text-sm font-semibold text-tinta hover:bg-mantequilla-suave"
                >
                  Ver todos los recordatorios →
                </Link>
              </div>
            )}
          </div>

          <div className="relative" ref={refMenu}>
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              className="flex items-center gap-2.5 rounded-2xl p-1.5 pr-2 hover:bg-caramelo-suave"
              aria-haspopup="menu"
              aria-expanded={menu}
              aria-label={`Menú de ${usuario.nombreCompleto}`}
            >
              <Avatar nombre={usuario.nombreCompleto} url={usuario.avatarUrl} tamano="size-9" />
              <span className="hidden min-w-0 text-left md:block">
                <span className="block max-w-[180px] truncate text-sm font-semibold text-tinta">{usuario.nombreCompleto}</span>
                <span className="block max-w-[180px] truncate text-xs text-tenue">{usuario.correo}</span>
              </span>
              <ChevronDown className="hidden size-4 text-tenue md:block" aria-hidden />
            </button>
            {menu && (
              <div role="menu" className="animar-entrada absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-linea bg-white shadow-[var(--shadow-suave)]">
                <div className="flex items-center gap-3 border-b border-linea px-4 py-4">
                  <Avatar nombre={usuario.nombreCompleto} url={usuario.avatarUrl} tamano="size-11" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-tinta">{usuario.nombreCompleto}</p>
                    <p className="truncate text-xs text-tenue">{usuario.correo}</p>
                    <span className="chip mt-1 bg-mantequilla-suave text-espresso">{ROLES[usuario.rol]}</span>
                  </div>
                </div>
                <button role="menuitem" type="button" onClick={() => { setMenu(false); navigate("/app/perfil"); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-tinta hover:bg-crema">
                  <UserRound className="size-4" /> Mi perfil
                </button>
                <button role="menuitem" type="button" onClick={() => { setMenu(false); navigate("/app/perfil#notificaciones"); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-tinta hover:bg-crema">
                  <Settings className="size-4" /> Notificaciones
                </button>
                <button role="menuitem" type="button" onClick={() => { setMenu(false); setConfirmarSalida(true); }} className="flex w-full items-center gap-3 border-t border-linea px-4 py-3 text-sm font-semibold text-vino hover:bg-vino-suave">
                  <LogOut className="size-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmarModal
        abierto={confirmarSalida}
        onCerrar={() => setConfirmarSalida(false)}
        onConfirmar={salir}
        cargando={saliendo}
        titulo="¿Cerrar sesión?"
        mensaje="Tu sesión se cerrará en este dispositivo y el token dejará de ser válido."
        textoConfirmar="Cerrar sesión"
      />
    </header>
  );
}
