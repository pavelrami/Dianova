import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ClipboardCheck,
  CalendarDays,
  CalendarRange,
  BookOpen,
  Mail,
  MessageSquare,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import Logo, { Simbolo } from "../../components/ui/Logo";
import { useAuth } from "../../auth/AuthContext";

// Tiempos y suavizado de las animaciones en la portada
const M = {
  ease: "power3.out",
  easeIO: "power2.inOut",
  pop: "power2.out",
  dur: 0.85,
  stagger: 0.08,
  dist: 24,
  lerp: 0.1,
};

const TAREAS_DEMO = ["Reporte de laboratorio", "Ejercicios de álgebra", "Repasar para el parcial"];
const R = 26;
const C = 2 * Math.PI * R;

const ROLES = {
  estudiante: {
    titulo: "Estudiante",
    texto: "Revisa entregas pendientes, horarios de clase y fechas importantes del semestre.",
    puntos: [
      "Registra tareas y marca tu avance",
      "Consulta calendario y próximos eventos",
      "Confirma asistencia a exámenes o talleres",
      "Recibe avisos por correo, SMS o WhatsApp",
    ],
  },
  docente: {
    titulo: "Docente",
    texto: "Comparte actividades y avisos de tus materias sin repetir el seguimiento uno por uno.",
    puntos: [
      "Publica tareas o déjalas en borrador",
      "Agenda sesiones, prácticas y asesorías",
      "Revisa quiénes están inscritos y su progreso",
      "Lleva control de asistencia en tus eventos",
    ],
  },
  admin: {
    titulo: "Administrador",
    texto: "Administra usuarios, materias, periodos y avisos desde un mismo panel.",
    puntos: [
      "Gestiona cuentas y permisos por rol",
      "Configura materias, grupos y horarios",
      "Administra los periodos académicos",
      "Revisa el estado de los recordatorios",
    ],
  },
};

export default function Landing() {
  const raiz = useRef(null);
  const { autenticado } = useAuth();
  const [rol, setRol] = useState("estudiante");
  const [menu, setMenu] = useState(false);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let lenis = null;
    let ctx = null;
    const tick = (t) => lenis?.raf(t * 1000);
    try {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      lenis = new Lenis({ lerp: M.lerp, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      ctx = gsap.context(() => {
        firma();
        revelados();
      }, raiz);
    } catch (e) {
      console.warn("[dianova] animaciones desactivadas", e);
    }
    return () => {
      ctx?.revert();
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return (
    <div ref={raiz} className="bg-crema text-tinta">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 border-b border-linea bg-crema/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Dianova, inicio">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Secciones">
            <a href="#funciones" className="hover:text-vino">Funciones</a>
            <a href="#roles" className="hover:text-vino">Para quién</a>
            <a href="#avisos" className="hover:text-vino">Recordatorios</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {autenticado ? (
              <Link
                to="/app"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-vino px-4 text-sm font-semibold text-white hover:bg-vino-press"
              >
                Ir a mi panel <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold hover:bg-caramelo-suave"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-vino px-4 text-sm font-semibold text-white hover:bg-vino-press"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="rounded-md p-2 md:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
          >
            {menu ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-linea bg-crema px-4 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col text-base font-medium" aria-label="Secciones">
              {[["#funciones", "Funciones"], ["#roles", "Para quién"], ["#avisos", "Recordatorios"]].map(([h, t]) => (
                <a key={h} href={h} onClick={() => setMenu(false)} className="py-3">
                  {t}
                </a>
              ))}
            </nav>
            <div className="mt-3 grid gap-2">
              <Link
                to={autenticado ? "/app" : "/login"}
                className="flex h-12 items-center justify-center rounded-md border border-linea font-semibold"
              >
                {autenticado ? "Ir a mi panel" : "Iniciar sesión"}
              </Link>
              {!autenticado && (
                <Link
                  to="/registro"
                  className="flex h-12 items-center justify-center gap-2 rounded-md bg-vino font-semibold text-white"
                >
                  Crear cuenta
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Sección principal */}
      <section className="relative overflow-hidden border-b border-linea" data-portada>
        <TramaLibro />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-16">
          <div>
            <p className="inline-flex items-center rounded-sm border border-linea bg-mantequilla px-2.5 py-1 text-xs font-semibold text-espresso" data-hero-meta-item>
              Control escolar y materias
            </p>
            <h1 className="mt-4 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="linea">
                <span data-linea-in>Tus materias y entregas</span>
              </span>
              <span className="linea">
                <span data-linea-in>
                  bien <span className="relative inline-block text-vino">ordenadas<TrazoOrden /></span>
                </span>
              </span>
            </h1>
            <div data-hero-meta>
              <p className="mt-5 max-w-lg text-lg text-tenue">
                Lleva el seguimiento de tareas, horarios, eventos y recordatorios del semestre sin perderte entre chats o notas sueltas.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={autenticado ? "/app" : "/registro"}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-vino px-6 text-base font-semibold text-white transition-colors hover:bg-vino-press"
                >
                  {autenticado ? "Ir a mi panel" : "Crear cuenta"}
                </Link>
                {!autenticado && (
                  <Link
                    to="/login"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-linea px-5 font-semibold text-tinta hover:bg-caramelo-suave"
                  >
                    Ya tengo cuenta
                  </Link>
                )}
              </div>
            </div>
          </div>
          <Planificador />
        </div>
      </section>

      {/* Funciones principales */}
      <section id="funciones" className="scroll-mt-20 border-b border-linea bg-crema-2 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl" data-revelar>
            <p className="font-semibold text-canela">Seguimiento diario</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Qué toca entregar, a qué hora y en qué materia
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-6">
            <Bloque
              className="md:col-span-4"
              icono={ClipboardCheck}
              titulo="Tareas y prioridades"
              texto="Revisa fechas límite, nivel de prioridad y estado de cada actividad (pendiente, en curso o terminada)."
            >
              <div className="mt-5 space-y-2">
                {[
                  ["Proyecto final: prototipo", "Alta", "bg-vino text-white"],
                  ["Reporte de laboratorio", "Media", "bg-caramelo text-white"],
                  ["Lectura de ética", "Baja", "bg-[#efe7dc] text-tinta"],
                ].map(([t, p, c]) => (
                  <div
                    key={t}
                    className="flex items-center justify-between rounded-sm border border-linea bg-crema-2 px-3 py-2.5 text-sm"
                  >
                    <span>{t}</span>
                    <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${c}`}>{p}</span>
                  </div>
                ))}
              </div>
            </Bloque>
            <Bloque
              className="md:col-span-2 bg-mantequilla border-[#f1d58f]"
              icono={CalendarDays}
              titulo="Calendario"
              texto="Consulta tu horario de clases junto con entregas y actividades programadas."
            />
            <Bloque
              className="md:col-span-2"
              icono={CalendarRange}
              titulo="Eventos"
              texto="Exámenes, prácticas y asesorías con confirmación de asistencia."
            />
            <Bloque
              className="md:col-span-4"
              icono={BookOpen}
              titulo="Avance por materia"
              texto="Observa el porcentaje completado en cada asignatura conforme avanzas en tus tareas."
            >
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Cálculo Vectorial", 78, "#C99A4B"],
                  ["Física General III", 68, "#8FAF8B"],
                ].map(([n, v, c]) => (
                  <div key={n} className="rounded-sm border border-linea bg-crema-2 p-3 text-sm">
                    <p className="font-medium">{n}</p>
                    <div className="mt-2 h-2 rounded-sm bg-[#ece2da]">
                      <div className="h-full rounded-sm" style={{ width: `${v}%`, background: c }} />
                    </div>
                  </div>
                ))}
              </div>
            </Bloque>
          </div>
        </div>
      </section>

      {/* Vistas según el rol */}
      <section id="roles" className="scroll-mt-20 border-b border-linea py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div data-revelar>
            <p className="font-semibold text-canela">Roles del sistema</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Permisos y opciones según tu perfil
            </h2>
            <p className="mt-4 text-tenue">
              Cada cuenta trabaja sobre lo que le corresponde: alumnos con sus materias, docentes con sus grupos y administración con la configuración general.
            </p>
            <div role="tablist" aria-label="Roles" className="mt-6 inline-flex rounded-md border border-linea bg-[#f2ebe1] p-1">
              {Object.entries(ROLES).map(([k, v]) => (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  aria-selected={rol === k}
                  onClick={() => setRol(k)}
                  className={`rounded-sm px-4 py-2 text-sm font-semibold ${
                    rol === k ? "bg-white text-tinta" : "text-tenue hover:text-tinta"
                  }`}
                >
                  {v.titulo}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-espresso-2 bg-espresso p-7 text-white sm:p-9" data-revelar role="tabpanel">
            <Simbolo className="size-10" colorLibro="#FFE5A8" colorDestello="#FFE5A8" />
            <h3 className="mt-4 text-2xl font-bold text-mantequilla">{ROLES[rol].titulo}</h3>
            <p className="mt-2 text-[#f6e9d3]">{ROLES[rol].texto}</p>
            <ul className="mt-5 space-y-3">
              {ROLES[rol].puntos.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[#f6e9d3]">
                  <span className="mt-2 size-1.5 shrink-0 bg-mantequilla" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recordatorios y avisos */}
      <section
        id="avisos"
        className="scroll-mt-20 border-b border-linea bg-espresso py-16 text-white md:py-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <div data-revelar>
            <p className="font-semibold text-mantequilla">Recordatorios</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Avisos por correo, SMS o WhatsApp según actives
            </h2>
            <p className="mt-4 text-[#f6e9d3]">
              Recibe notificaciones cuando se publique una actividad o se programe un evento, o configura recordatorios propios antes de la fecha de entrega.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {[[Mail, "Correo"], [MessageSquare, "SMS"], [MessageCircle, "WhatsApp"]].map(([I, t]) => (
                <li
                  key={t}
                  className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-3"
                >
                  <I className="size-5 text-mantequilla" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#e8d6bd]">
              <ShieldCheck className="size-4" aria-hidden /> Acceso con credenciales protegidas y cierre de sesión disponible en cualquier momento.
            </p>
          </div>
          <div
            className="mx-auto w-full max-w-sm rounded-md border border-white/15 bg-[#2e1a0e] p-4"
            data-revelar
            aria-hidden
          >
            <div className="rounded-sm bg-[#f3ece3] p-4 text-tinta">
              <p className="text-center text-xs text-tenue">Hoy</p>
              <div className="mt-3 max-w-[85%] rounded-sm border border-linea bg-white p-3 text-sm">
                Dianova: nueva tarea en Física General III: "Reporte de laboratorio". Entrega: jue 18:00.
              </div>
              <div className="mt-2 max-w-[85%] rounded-sm border border-linea bg-white p-3 text-sm">
                Dianova: "Examen parcial" mañana a las 16:00 en Aula Magna.
              </div>
              <div className="ml-auto mt-2 w-fit rounded-sm bg-mantequilla px-3 py-2 text-sm">
                Enterado
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6" data-revelar>
          <Simbolo className="mx-auto size-14" fondo />
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Listo para organizar tu semestre
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-tenue">
            Registra tu cuenta para comenzar y sumar tus materias, tareas y horarios de clase.
          </p>
          <Link
            to={autenticado ? "/app" : "/registro"}
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-md bg-vino px-6 font-semibold text-white hover:bg-vino-press"
          >
            {autenticado ? "Ir a mi panel" : "Crear cuenta"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-linea bg-crema-2">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-tenue sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Dianova · Seguimiento de tareas, eventos y recordatorios · {new Date().getFullYear()}</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-vino">Iniciar sesión</Link>
            <Link to="/registro" className="hover:text-vino">Registro</Link>
          </div>
        </div>
      </footer>

      <style>{`
        .linea{display:block;overflow:hidden;padding:.08em .12em .14em 0;margin:-.08em -.12em -.14em 0}
        .linea>[data-linea-in]{display:block}
      `}</style>
    </div>
  );
}

// Tarjeta de ejemplo con progreso circular y marcado de tareas
function Planificador() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="rounded-md border border-linea bg-white p-6" data-planner>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tenue">Hoy</p>
            <p className="text-xl font-bold">3 entregas</p>
          </div>
          <svg viewBox="0 0 64 64" className="size-16">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#ece2da" strokeWidth="7" />
            <circle
              data-anillo
              cx="32"
              cy="32"
              r={R}
              fill="none"
              stroke="#BD9457"
              strokeWidth="7"
              strokeLinecap="butt"
              strokeDasharray={C}
              strokeDashoffset="0"
              transform="rotate(-90 32 32)"
            />
          </svg>
        </div>
        <ul className="mt-5 space-y-2.5">
          {TAREAS_DEMO.map((t) => (
            <li
              key={t}
              className="flex items-center gap-3 rounded-sm border border-linea bg-crema-2 px-3.5 py-3"
              data-tarea
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-espresso" data-casilla>
                <svg viewBox="0 0 16 16" className="size-4">
                  <path
                    data-palomita
                    d="M3.5 8.5l3 3 6-7"
                    fill="none"
                    stroke="#FFE5A8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="relative text-[15px] text-tenue">
                {t}
                <span className="absolute left-0 right-0 top-1/2 h-px bg-tenue" data-tachado />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Subrayado manual bajo "ordenadas"
function TrazoOrden() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      aria-hidden
      data-trazo
    >
      <path d="M2 8c40-6 96-7 196-2" fill="none" stroke="#BD9457" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// Fondo sutil con contorno de libro
function TramaLibro() {
  return (
    <svg
      className="pointer-events-none absolute -right-40 -top-24 h-[560px] w-[560px] opacity-[.07]"
      viewBox="0 0 64 64"
      aria-hidden
    >
      <path d="M12 22c6-2.6 12.4-2.6 19 1.6V47c-6.6-4.2-13-4.2-19-1.6Z" fill="none" stroke="#442816" strokeWidth="1" />
      <path d="M52 22c-6-2.6-12.4-2.6-19 1.6V47c6.6-4.2 13-4.2 19-1.6Z" fill="none" stroke="#442816" strokeWidth="1" />
    </svg>
  );
}

function Bloque({ className = "", icono: Icono, titulo, texto, children }) {
  return (
    <article
      className={`rounded-md border border-linea bg-white p-6 ${className}`}
      data-bloque
    >
      <span className="grid size-11 place-items-center rounded-sm bg-espresso text-mantequilla">
        <Icono className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-xl font-bold">{titulo}</h3>
      <p className="mt-1.5 text-tenue">{texto}</p>
      {children}
    </article>
  );
}

// Animación inicial de portada y tarjeta
function firma() {
  const tl = gsap.timeline({ defaults: { ease: M.ease } });
  gsap.set("[data-linea-in]", { yPercent: 115 });
  tl.to("[data-linea-in]", { yPercent: 0, duration: M.dur * 1.2, stagger: 0.12 }, 0)
    .from("[data-hero-meta-item], [data-hero-meta] > *", { y: M.dist, autoAlpha: 0, duration: M.dur, stagger: M.stagger }, 0.25)
    .from("[data-planner]", { y: 40, scale: 0.96, autoAlpha: 0, duration: M.dur * 1.1 }, 0.15);

  const trazo = document.querySelector("[data-trazo] path");
  if (trazo) {
    const L = trazo.getTotalLength();
    tl.fromTo(trazo, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.8, ease: M.easeIO }, 0.7);
  }

  const casillas = gsap.utils.toArray("[data-casilla]");
  const palomitas = gsap.utils.toArray("[data-palomita]");
  const tachados = gsap.utils.toArray("[data-tachado]");
  gsap.set(casillas, { backgroundColor: "#ffffff", boxShadow: "inset 0 0 0 1.5px #d9c9b3" });
  palomitas.forEach((p) => {
    const L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
  });
  gsap.set(tachados, { scaleX: 0, transformOrigin: "0 50%" });
  gsap.set("[data-anillo]", { strokeDashoffset: C });

  casillas.forEach((c, i) => {
    const t0 = 1.0 + i * 0.38;
    tl.to(c, { backgroundColor: "#442816", boxShadow: "inset 0 0 0 0px #d9c9b3", scale: 1.15, duration: 0.18, ease: "power2.out" }, t0)
      .to(c, { scale: 1, duration: 0.35, ease: M.pop }, t0 + 0.18)
      .to(palomitas[i], { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, t0 + 0.05)
      .to(tachados[i], { scaleX: 1, duration: 0.35, ease: M.easeIO }, t0 + 0.12)
      .to("[data-anillo]", { strokeDashoffset: C * (1 - (i + 1) / casillas.length), duration: 0.4, ease: M.easeIO }, t0 + 0.1);
  });

  return tl;
}

// Aparición de bloques al hacer scroll
function revelados() {
  gsap.utils.toArray("[data-revelar]").forEach((el) => {
    gsap.from(el, {
      y: M.dist,
      autoAlpha: 0,
      duration: M.dur,
      ease: M.ease,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
  const bloques = gsap.utils.toArray("[data-bloque]");
  if (bloques.length) {
    gsap.from(bloques, {
      y: M.dist,
      autoAlpha: 0,
      duration: M.dur,
      ease: M.ease,
      stagger: M.stagger,
      scrollTrigger: { trigger: bloques[0], start: "top 85%", once: true },
    });
  }
}