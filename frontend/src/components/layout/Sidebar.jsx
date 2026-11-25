import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, ClipboardCheck, CalendarDays, CalendarRange, Bell, BookOpen, Users, GraduationCap, Search, ChevronsLeft, X, ShieldCheck,
} from "lucide-react";
import Logo, { Simbolo } from "../ui/Logo";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../auth/AuthContext";
import { ROLES } from "../../utils/etiquetas";

const TONO_SIDEBAR = "#633b1d";
const TONO_CREMITA = "#faf6ee";

const MENU = {
  ESTUDIANTE: [
    { a: "/app", texto: "Resumen", icono: Home, fin: true },
    { a: "/app/tareas", texto: "Tareas", icono: ClipboardCheck },
    { a: "/app/calendario", texto: "Calendario", icono: CalendarDays },
    { a: "/app/eventos", texto: "Eventos", icono: CalendarRange },
    { a: "/app/recordatorios", texto: "Recordatorios", icono: Bell },
    { a: "/app/materias", texto: "Materias", icono: BookOpen },
  ],
  DOCENTE: [
    { a: "/app", texto: "Resumen", icono: Home, fin: true },
    { a: "/app/tareas", texto: "Tareas publicadas", icono: ClipboardCheck },
    { a: "/app/calendario", texto: "Calendario", icono: CalendarDays },
    { a: "/app/eventos", texto: "Eventos", icono: CalendarRange },
    { a: "/app/materias", texto: "Mis materias", icono: BookOpen },
    { a: "/app/recordatorios", texto: "Recordatorios", icono: Bell },
  ],
  ADMIN: [
    { a: "/app", texto: "Resumen", icono: Home, fin: true },
    { a: "/app/admin/usuarios", texto: "Usuarios", icono: Users },
    { a: "/app/materias", texto: "Materias", icono: BookOpen },
    { a: "/app/admin/periodos", texto: "Periodos", icono: GraduationCap },
    { a: "/app/tareas", texto: "Tareas", icono: ClipboardCheck },
    { a: "/app/eventos", texto: "Eventos", icono: CalendarRange },
    { a: "/app/admin/recordatorios", texto: "Recordatorios", icono: ShieldCheck },
  ],
};

export default function Sidebar({ abiertoMovil, onCerrarMovil, colapsado, onColapsar }) {
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const items = MENU[rol] || [];

  const buscar = (e) => {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/app/tareas?q=${encodeURIComponent(q)}` : "/app/tareas");
    setBusqueda("");
  };

  return (
    <>
      {abiertoMovil && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCerrarMovil}
          aria-hidden
        />
      )}
      <aside
        style={{ backgroundColor: TONO_SIDEBAR, color: TONO_CREMITA }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col rounded-sm transition-[width,transform] duration-300
        ${abiertoMovil ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        w-[280px] ${colapsado ? "lg:w-[88px]" : "lg:w-[272px]"}`}
        aria-label="Menú principal"
      >
        <div className="flex h-20 items-center justify-between px-6" style={{ color: TONO_CREMITA }}>
          {colapsado ? (
            <Simbolo className="mx-auto hidden size-9 lg:block" colorLibro={TONO_CREMITA} colorDestello={TONO_CREMITA} />
          ) : null}
          <span className={colapsado ? "lg:hidden" : ""} style={{ color: TONO_CREMITA }}>
            <Logo claro />
          </span>
          <button
            type="button"
            onClick={onCerrarMovil}
            className="rounded-sm p-2 hover:bg-white/10 lg:hidden"
            style={{ color: TONO_CREMITA }}
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        {!colapsado && (
          <form onSubmit={buscar} className="px-5 pb-4" role="search">
            <label className="relative block">
              <span className="sr-only">Buscar tareas</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-80"
                style={{ color: TONO_CREMITA }}
                aria-hidden
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar tareas…"
                style={{ color: TONO_CREMITA }}
                className="h-11 w-full rounded-sm border border-white/20 bg-white/10 pl-9 pr-3 text-sm placeholder:text-[#faf6ee]/70 outline-none focus:border-[#faf6ee]"
              />
            </label>
          </form>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {items.map(({ a, texto, icono: Icono, fin }) => (
            <NavLink
              key={a}
              to={a}
              end={fin}
              title={colapsado ? texto : undefined}
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: TONO_CREMITA, color: TONO_SIDEBAR }
                  : { color: TONO_CREMITA }
              }
              className={({ isActive }) =>
                `flex h-12 items-center gap-3 rounded-sm px-3.5 text-[15px] font-medium transition-colors ${
                  isActive ? "" : "hover:bg-white/10"
                } ${colapsado ? "lg:justify-center lg:px-0" : ""}`
              }
            >
              <Icono className="size-5 shrink-0" aria-hidden />
              <span className={colapsado ? "lg:sr-only" : ""}>{texto}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={onColapsar}
          style={{ backgroundColor: TONO_SIDEBAR, color: TONO_CREMITA }}
          className={`absolute -right-4 top-1/2 hidden size-8 place-items-center rounded-sm border border-white/25 shadow-lg hover:brightness-110 lg:grid ${
            colapsado ? "rotate-180" : ""
          }`}
          aria-label={colapsado ? "Expandir menú" : "Contraer menú"}
        >
          <ChevronsLeft className="size-4" />
        </button>

        {usuario && (
          <NavLink
            to="/app/perfil"
            style={{ color: TONO_CREMITA }}
            className={`m-4 flex items-center gap-3 rounded-sm border border-white/15 bg-white/10 p-3 hover:bg-white/15 ${
              colapsado ? "lg:justify-center lg:p-2" : ""
            }`}
          >
            <Avatar nombre={usuario.nombreCompleto} url={usuario.avatarUrl} tamano="size-10" />
            <span className={`min-w-0 ${colapsado ? "lg:hidden" : ""}`}>
              <span className="block truncate text-sm font-semibold" style={{ color: TONO_CREMITA }}>
                {usuario.nombreCompleto}
              </span>
              <span className="block truncate text-xs opacity-85" style={{ color: TONO_CREMITA }}>
                {ROLES[usuario.rol]}{usuario.carrera ? ` · ${usuario.carrera}` : ""}
              </span>
            </span>
          </NavLink>
        )}
      </aside>
    </>
  );
}