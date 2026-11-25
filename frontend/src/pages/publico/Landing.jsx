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

// Ajustes de movimiento y scroll suave en la portada
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
    texto: "Tu semestre a la vista: lo que entregas, cuándo tienes clase y qué viene después.",
    puntos: [
      "Crea tareas personales y marca tu avance",
      "Consulta tu calendario y tus eventos",
      "Confirma asistencia a talleres y exámenes",
      "Recibe recordatorios por correo, SMS o WhatsApp",
    ],
  },
  docente: {
    titulo: "Docente",
    texto: "Publica una vez y cada estudiante inscrito tiene su propio seguimiento.",
    puntos: [
      "Publica tareas de tus materias (o guárdalas en borrador)",
      "Programa eventos y asesorías para tu grupo",
      "Consulta a tus inscritos y su avance",
      "Registra la asistencia a tus eventos",
    ],
  },
  admin: {
    titulo: "Administrador",
    texto: "Control total del sistema con datos ordenados y trazables.",
    puntos: [
      "Gestiona usuarios y roles",
      "Crea materias, horarios e inscripciones",
      "Define los periodos académicos",
      "Supervisa el envío de recordatorios",
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
    <div ref={raiz} className="bg-crema text-[15px] text-tinta">
      {/* Encabezado */}
      <header className="sticky top-0 z-40 border-b border-linea bg-crema/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Dianova, inicio"><Logo /></Link>
          <nav className="hidden items-center gap-7 font-medium md:flex" aria-label="Secciones">
            <a href="#funciones" className="hover:text-canela">Funciones</a>
            <a href="#roles" className="hover:text-canela">Para quién</a>
            <a href="#avisos" className="hover:text-canela">Recordatorios</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {autenticado ? (
              <Link
                to="/app"
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-canela bg-canela px-4 font-semibold text-white hover:bg-espresso"
              >
                Ir a mi panel <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center rounded-sm border border-linea bg-superficie px-4 font-semibold hover:bg-crema-2"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="inline-flex h-10 items-center gap-2 rounded-sm border border-canela bg-canela px-4 font-semibold text-white hover:bg-espresso"
                >
                  Crear mi cuenta
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="rounded-sm border border-linea p-2 md:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
          >
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-linea bg-crema px-4 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col font-medium" aria-label="Secciones">
              {[["#funciones", "Funciones"], ["#roles", "Para quién"], ["#avisos", "Recordatorios"]].map(([h, t]) => (
                <a key={h} href={h} onClick={() => setMenu(false)} className="py-3">{t}</a>
              ))}
            </nav>
            <div className="mt-3 grid gap-2">
              <Link
                to={autenticado ? "/app" : "/login"}
                className="flex h-11 items-center justify-center rounded-sm border border-linea bg-superficie font-semibold"
              >
                {autenticado ? "Ir a mi panel" : "Iniciar sesión"}
              </Link>
              {!autenticado && (
                <Link
                  to="/registro"
                  className="flex h-11 items-center justify-center gap-2 rounded-sm border border-canela bg-canela font-semibold text-white"
                >
                  Crear mi cuenta
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Portada */}
      <section className="relative overflow-hidden border-b border-linea bg-[#dfcaa8] text-tinta" data-portada>
        <TramaLibro />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-16">
          <div>
            <p className="inline-flex items-center rounded-sm border border-linea bg-superficie px-3 py-1 font-medium text-tinta" data-hero-meta-item>
              Planificación académica
            </p>
            <h1 className="mt-4 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              <span className="linea">
                <span data-linea-in>Cada gran logro</span>
              </span>
              <span className="linea">
                <span data-linea-in>
                  empieza con <span className="relative inline-block text-canela">orden<TrazoOrden /></span>
                </span>
              </span>
            </h1>
            <div data-hero-meta>
              <p className="mt-4 max-w-lg leading-relaxed text-tinta/85">
                Organiza tus clases, tareas, eventos y recordatorios en un solo lugar. Para estudiantes, docentes y administradores.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={autenticado ? "/app" : "/registro"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-canela bg-canela px-5 font-semibold text-white transition-colors hover:bg-espresso"
                >
                  {autenticado ? "Ir a mi panel" : "Crear mi cuenta"}
                </Link>
                {!autenticado && (
                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-sm border border-linea bg-superficie px-5 font-semibold text-tinta hover:bg-crema"
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

      {/* Funciones */}
      <section id="funciones" className="scroll-mt-20 border-b border-linea bg-crema-2 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl" data-revelar>
            <p className="font-semibold text-canela">Todo tu semestre</p>
            <h2 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              Un solo lugar para lo que tienes que hacer, cuándo y dónde
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-6">
            <Bloque
              className="md:col-span-4"
              icono={ClipboardCheck}
              titulo="Tareas con seguimiento"
              texto="Cada tarea tiene su prioridad, su fecha y tu avance: por empezar, en progreso o completada."
            >
              <div className="mt-4 space-y-2">
                {[
                  ["Proyecto final: prototipo", "Alta", "bg-vino-suave text-vino border border-vino/25"],
                  ["Reporte de laboratorio", "Media", "bg-mantequilla-suave text-tinta border border-linea"],
                  ["Lectura de ética", "Baja", "bg-crema text-tenue border border-linea"],
                ].map(([t, p, c]) => (
                  <div
                    key={t}
                    className="flex items-center justify-between rounded-sm border border-linea bg-crema px-3.5 py-2.5"
                  >
                    <span>{t}</span>
                    <span className={`inline-flex items-center rounded-sm px-2.5 py-0.5 font-medium ${c}`}>{p}</span>
                  </div>
                ))}
              </div>
            </Bloque>
            <Bloque
              className="md:col-span-2 bg-crema"
              icono={CalendarDays}
              titulo="Calendario"
              texto="Tus clases salen de tu horario; los eventos y entregas aparecen solos."
            />
            <Bloque
              className="md:col-span-2"
              icono={CalendarRange}
              titulo="Eventos"
              texto="Exámenes, talleres y asesorías. Confirma si vas con un toque."
            />
            <Bloque
              className="md:col-span-4"
              icono={BookOpen}
              titulo="Materias y avance"
              texto="Ve en qué va cada materia según las tareas que ya completaste."
            >
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Cálculo Vectorial", 78, "#b58b4e"],
                  ["Física General III", 68, "#8FAF8B"],
                ].map(([n, v, c]) => (
                  <div key={n} className="rounded-sm border border-linea bg-crema p-3.5">
                    <p className="font-medium">{n}</p>
                    <div className="mt-2 h-2 rounded-sm bg-linea">
                      <div className="h-full rounded-sm" style={{ width: `${v}%`, background: c }} />
                    </div>
                  </div>
                ))}
              </div>
            </Bloque>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-20 border-b border-linea py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div data-revelar>
            <p className="font-semibold text-canela">Para quién</p>
            <h2 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              Cada rol ve exactamente lo que necesita
            </h2>
            <p className="mt-3 leading-relaxed text-tenue">
              Un estudiante solo ve sus datos y los de sus materias. Un docente publica en las materias que imparte. El administrador gestiona todo.
            </p>
            <div role="tablist" aria-label="Roles" className="mt-5 inline-flex rounded-sm border border-linea bg-crema-2 p-1">
              {Object.entries(ROLES).map(([k, v]) => (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  aria-selected={rol === k}
                  onClick={() => setRol(k)}
                  className={`rounded-sm px-4 py-2 font-semibold ${
                    rol === k ? "border border-linea bg-superficie text-tinta" : "text-tenue hover:text-tinta"
                  }`}
                >
                  {v.titulo}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-sm border border-caramelo/40 bg-caramelo-suave p-6 text-tinta sm:p-8" data-revelar role="tabpanel">
            <Simbolo className="size-8" colorLibro="#864d26" colorDestello="#864d26" />
            <h3 className="mt-3 text-lg font-semibold text-tinta">{ROLES[rol].titulo}</h3>
            <p className="mt-2 leading-relaxed text-tinta/85">{ROLES[rol].texto}</p>
            <ul className="mt-4 space-y-2.5 border-t border-caramelo/30 pt-4 text-tinta">
              {ROLES[rol].puntos.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 bg-canela" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recordatorios */}
      <section id="avisos" className="scroll-mt-20 border-b border-linea bg-[#efe2ca] py-16 text-tinta md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <div data-revelar>
            <p className="font-semibold text-canela">Recordatorios que sí llegan</p>
            <h2 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              Por correo, SMS o WhatsApp, solo si tú lo autorizas
            </h2>
            <p className="mt-3 leading-relaxed text-tinta/85">
              Cuando un docente publica una tarea o programa un evento, te avisamos por los canales que activaste. También puedes programar tus propios recordatorios con la anticipación que prefieras.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {[[Mail, "Correo"], [MessageSquare, "SMS"], [MessageCircle, "WhatsApp"]].map(([I, t]) => (
                <li
                  key={t}
                  className="flex items-center gap-2 rounded-sm border border-linea bg-superficie px-3.5 py-2.5 font-medium text-tinta"
                >
                  <I className="size-4 text-canela" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-2 text-tenue">
              <ShieldCheck className="size-4 shrink-0 text-canela" aria-hidden />
              <span>Contraseñas cifradas y sesiones que puedes cerrar en cualquier momento.</span>
            </p>
          </div>
          <div
            className="mx-auto w-full max-w-sm rounded-sm border border-linea bg-superficie p-4"
            data-revelar
            aria-hidden
          >
            <div className="space-y-2.5 rounded-sm border border-linea bg-crema p-4 text-tinta">
              <p className="text-center text-tenue">Hoy</p>
              <div className="max-w-[85%] rounded-sm border border-linea bg-superficie p-3">
                Dianova: nueva tarea en Física General III: &ldquo;Reporte de laboratorio&rdquo;. Entrega: jue 18:00.
              </div>
              <div className="max-w-[85%] rounded-sm border border-linea bg-superficie p-3">
                Dianova: &ldquo;Examen parcial&rdquo; empieza mañana a las 16:00 en Aula Magna.
              </div>
              <div className="ml-auto w-fit rounded-sm border border-linea bg-crema-2 px-3 py-1.5 font-medium">
                ¡Gracias!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6" data-revelar>
          <Simbolo className="mx-auto size-10" fondo />
          <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl">
            Empieza a ordenar tu semestre hoy
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl leading-relaxed text-tenue">
            Crea tu cuenta de estudiante en menos de un minuto. Tu docente y tu escuela pueden sumarse cuando quieran.
          </p>
          <Link
            to={autenticado ? "/app" : "/registro"}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-sm border border-canela bg-canela px-5 font-semibold text-white hover:bg-espresso"
          >
            {autenticado ? "Ir a mi panel" : "Crear mi cuenta"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-linea bg-crema-2">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 text-tenue sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Proyecto académico · Planificación de tareas, eventos y recordatorios · {new Date().getFullYear()}</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-tinta">Iniciar sesión</Link>
            <Link to="/registro" className="hover:text-tinta">Registro</Link>
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

// Tarjeta de ejemplo con anillo de progreso y tareas marcadas
function Planificador() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="rounded-sm border border-linea bg-superficie p-6" data-planner>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-tenue">Hoy</p>
            <p className="text-lg font-semibold">3 entregas</p>
          </div>
          <svg viewBox="0 0 64 64" className="size-14">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#e8ddd0" strokeWidth="6" />
            <circle
              data-anillo
              cx="32"
              cy="32"
              r={R}
              fill="none"
              stroke="#b58b4e"
              strokeWidth="6"
              strokeLinecap="butt"
              strokeDasharray={C}
              strokeDashoffset="0"
              transform="rotate(-90 32 32)"
            />
          </svg>
        </div>
        <ul className="mt-4 space-y-2.5">
          {TAREAS_DEMO.map((t) => (
            <li
              key={t}
              className="flex items-center gap-3 rounded-sm border border-linea bg-crema px-3.5 py-2.5"
              data-tarea
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-sm bg-canela" data-casilla>
                <svg viewBox="0 0 16 16" className="size-3.5">
                  <path
                    data-palomita
                    d="M3.5 8.5l3 3 6-7"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="relative text-tenue">
                {t}
                <span className="absolute left-0 right-0 top-1/2 h-px bg-tenue" data-tachado />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="mt-3 rounded-sm border border-linea bg-superficie px-4 py-2.5 sm:absolute sm:-left-4 sm:-bottom-5 sm:mt-0"
        data-flotante
      >
        <p className="flex items-center gap-2 font-semibold">
          <MessageCircle className="size-4 text-salvia-tinta" /> Recordatorio enviado
        </p>
        <p className="text-tenue">WhatsApp · 2 h antes</p>
      </div>
      <div
        className="mt-2 rounded-sm border border-linea bg-crema-2 px-4 py-2 font-semibold text-tinta sm:absolute sm:-left-6 sm:-top-4 sm:mt-0"
        data-flotante
      >
        Examen · jue 16:00
      </div>
    </div>
  );
}

// Subrayado bajo la palabra destacada
function TrazoOrden() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-1.5 left-0 h-2.5 w-full"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      aria-hidden
      data-trazo
    >
      <path d="M2 8c40-6 96-7 196-2" fill="none" stroke="#b58b4e" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Contorno sutil en el fondo de la portada
function TramaLibro() {
  return (
    <svg
      className="pointer-events-none absolute -right-40 -top-24 h-[520px] w-[520px] opacity-[.07]"
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
      className={`rounded-sm border border-linea bg-superficie p-6 ${className}`}
      data-bloque
    >
      <span className="grid size-10 place-items-center rounded-sm border border-linea bg-crema-2 text-canela">
        <Icono className="size-5" aria-hidden />
      </span>
      <h3 className="mt-3.5 text-lg font-semibold">{titulo}</h3>
      <p className="mt-1.5 leading-relaxed text-tenue">{texto}</p>
      {children}
    </article>
  );
}

// Secuencia inicial de entrada
function firma() {
  const tl = gsap.timeline({ defaults: { ease: M.ease } });
  gsap.set("[data-linea-in]", { yPercent: 115 });
  tl.to("[data-linea-in]", { yPercent: 0, duration: M.dur * 1.2, stagger: 0.12 }, 0)
    .from("[data-hero-meta-item], [data-hero-meta] > *", { y: M.dist, autoAlpha: 0, duration: M.dur, stagger: M.stagger }, 0.25)
    .from("[data-planner]", { y: 32, scale: 0.98, autoAlpha: 0, duration: M.dur * 1.1 }, 0.15)
    .from("[data-flotante]", { y: 18, autoAlpha: 0, duration: M.dur, stagger: 0.16 }, 0.55);

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
    tl.to(c, { backgroundColor: "#864d26", boxShadow: "inset 0 0 0 0px #d9c9b3", scale: 1.08, duration: 0.18, ease: "power2.out" }, t0)
      .to(c, { scale: 1, duration: 0.3, ease: M.pop }, t0 + 0.18)
      .to(palomitas[i], { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, t0 + 0.05)
      .to(tachados[i], { scaleX: 1, duration: 0.35, ease: M.easeIO }, t0 + 0.12)
      .to("[data-anillo]", { strokeDashoffset: C * (1 - (i + 1) / casillas.length), duration: 0.4, ease: M.easeIO }, t0 + 0.1);
  });

  return tl;
}

// Revelado de bloques al desplazarse
function revelados() {
  gsap.utils.toArray("[data-revelar]").forEach((el) => {
    gsap.from(el, { y: M.dist, autoAlpha: 0, duration: M.dur, ease: M.ease, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });
  const bloques = gsap.utils.toArray("[data-bloque]");
  if (bloques.length) {
    gsap.from(bloques, { y: M.dist, autoAlpha: 0, duration: M.dur, ease: M.ease, stagger: M.stagger, scrollTrigger: { trigger: bloques[0], start: "top 85%", once: true } });
  }
}