import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ClipboardCheck, CalendarDays, CalendarRange, BookOpen, Mail, MessageSquare, MessageCircle, ShieldCheck, ArrowRight, Menu, X,
} from "lucide-react";
import Logo, { Destello, Simbolo } from "../../components/ui/Logo";
import { useAuth } from "../../auth/AuthContext";

/*
 * Ficha de movimiento (detalle técnico en el README):
 * cálida y precisa -> entradas power3.out de 0.9 s, recorrido corto (28 px), escalonado 0.08 s,
 * rebote solo en piezas pequeñas (destello y casillas). Lenis con inercia 0.1. Sin cursor ni marquesinas.
 * Firma: las tareas del planificador se marcan una por una, el anillo se llena y el destello del logo
 * aparece; el mismo destello late en el botón principal.
 */
const M = { ease: "power3.out", easeIO: "power2.inOut", pop: "back.out(1.6)", dur: 0.9, stagger: 0.08, dist: 28, lerp: 0.1 };

const TAREAS_DEMO = ["Reporte de laboratorio", "Ejercicios de álgebra", "Repasar para el parcial"];
const R = 26;
const C = 2 * Math.PI * R;

const ROLES = {
  estudiante: {
    titulo: "Estudiante",
    texto: "Tu semestre a la vista: lo que entregas, cuándo tienes clase y qué viene después.",
    puntos: ["Crea tareas personales y marca tu avance", "Consulta tu calendario y tus eventos", "Confirma asistencia a talleres y exámenes", "Recibe recordatorios por correo, SMS o WhatsApp"],
  },
  docente: {
    titulo: "Docente",
    texto: "Publica una vez y cada estudiante inscrito tiene su propio seguimiento.",
    puntos: ["Publica tareas de tus materias (o guárdalas en borrador)", "Programa eventos y asesorías para tu grupo", "Consulta a tus inscritos y su avance", "Registra la asistencia a tus eventos"],
  },
  admin: {
    titulo: "Administrador",
    texto: "Control total del sistema con datos ordenados y trazables.",
    puntos: ["Gestiona usuarios y roles", "Crea materias, horarios e inscripciones", "Define los periodos académicos", "Supervisa el envío de recordatorios"],
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
      {/* ===== INICIO Encabezado ===== */}
      <header className="sticky top-0 z-40 border-b border-linea/60 bg-crema/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Dianova, inicio"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Secciones">
            <a href="#funciones" className="hover:text-vino">Funciones</a>
            <a href="#roles" className="hover:text-vino">Para quién</a>
            <a href="#avisos" className="hover:text-vino">Recordatorios</a>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {autenticado ? (
              <Link to="/app" className="inline-flex h-10 items-center gap-2 rounded-xl bg-vino px-4 text-sm font-semibold text-white hover:bg-vino-press">Ir a mi panel <ArrowRight className="size-4" /></Link>
            ) : (
              <>
                <Link to="/login" className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold hover:bg-caramelo-suave">Iniciar sesión</Link>
                <Link to="/registro" className="inline-flex h-10 items-center gap-2 rounded-xl bg-vino px-4 text-sm font-semibold text-white hover:bg-vino-press">
                  <Destello className="size-3.5 text-mantequilla" /> Crear mi cuenta
                </Link>
              </>
            )}
          </div>
          <button type="button" className="rounded-xl p-2 md:hidden" onClick={() => setMenu((m) => !m)} aria-label={menu ? "Cerrar menú" : "Abrir menú"} aria-expanded={menu}>
            {menu ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {menu && (
          <div className="border-t border-linea bg-crema px-4 pb-5 pt-3 md:hidden">
            <nav className="flex flex-col text-base font-medium" aria-label="Secciones">
              {[["#funciones", "Funciones"], ["#roles", "Para quién"], ["#avisos", "Recordatorios"]].map(([h, t]) => (
                <a key={h} href={h} onClick={() => setMenu(false)} className="py-3">{t}</a>
              ))}
            </nav>
            <div className="mt-3 grid gap-2">
              <Link to={autenticado ? "/app" : "/login"} className="flex h-12 items-center justify-center rounded-xl border border-linea font-semibold">{autenticado ? "Ir a mi panel" : "Iniciar sesión"}</Link>
              {!autenticado && <Link to="/registro" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-vino font-semibold text-white"><Destello className="size-3.5 text-mantequilla" /> Crear mi cuenta</Link>}
            </div>
          </div>
        )}
      </header>
      {/* ===== FIN Encabezado ===== */}

      {/* ===== INICIO Portada ===== */}
      <section className="relative overflow-hidden" data-portada>
        <TramaLibro />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-16">
          <div>
            <p className="chip bg-mantequilla text-espresso" data-hero-meta-item>Planificación académica</p>
            <h1 className="mt-4 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="linea"><span data-linea-in>Cada gran logro</span></span>
              <span className="linea">
                <span data-linea-in>empieza con <span className="relative inline-block text-vino">orden<TrazoOrden /></span></span>
              </span>
            </h1>
            <div data-hero-meta>
              <p className="mt-5 max-w-lg text-lg text-tenue">
                Organiza tus clases, tareas, eventos y recordatorios en un solo lugar. Para estudiantes, docentes y administradores.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={autenticado ? "/app" : "/registro"}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-vino px-6 text-base font-semibold text-white shadow-[0_10px_24px_-12px_rgb(113_27_26/.8)] transition-colors hover:bg-vino-press"
                >
                  <span data-cta-destello className="inline-flex"><Destello className="size-4 text-mantequilla" /></span>
                  {autenticado ? "Ir a mi panel" : "Crear mi cuenta"}
                </Link>
                {!autenticado && (
                  <Link to="/login" className="inline-flex h-12 items-center justify-center rounded-xl px-5 font-semibold text-tinta hover:bg-caramelo-suave">
                    Ya tengo cuenta
                  </Link>
                )}
              </div>
            </div>
          </div>
          <Planificador />
        </div>
      </section>
      {/* ===== FIN Portada ===== */}

      {/* ===== INICIO Funciones ===== */}
      <section id="funciones" className="scroll-mt-20 bg-crema-2 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl" data-revelar>
            <p className="font-semibold text-canela">Todo tu semestre</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Un solo lugar para lo que tienes que hacer, cuándo y dónde</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-6">
            <Bloque className="md:col-span-4" icono={ClipboardCheck} titulo="Tareas con seguimiento" texto="Cada tarea tiene su prioridad, su fecha y tu avance: por empezar, en progreso o completada.">
              <div className="mt-5 space-y-2">
                {[["Proyecto final: prototipo", "Alta", "bg-vino text-white"], ["Reporte de laboratorio", "Media", "bg-caramelo text-white"], ["Lectura de ética", "Baja", "bg-[#efe7dc] text-tinta"]].map(([t, p, c]) => (
                  <div key={t} className="flex items-center justify-between rounded-xl border border-linea bg-crema-2 px-3 py-2.5 text-sm">
                    <span>{t}</span><span className={`chip ${c}`}>{p}</span>
                  </div>
                ))}
              </div>
            </Bloque>
            <Bloque className="md:col-span-2 bg-mantequilla border-[#f1d58f]" icono={CalendarDays} titulo="Calendario" texto="Tus clases salen de tu horario; los eventos y entregas aparecen solos." />
            <Bloque className="md:col-span-2" icono={CalendarRange} titulo="Eventos" texto="Exámenes, talleres y asesorías. Confirma si vas con un toque." />
            <Bloque className="md:col-span-4" icono={BookOpen} titulo="Materias y avance" texto="Ve en qué va cada materia según las tareas que ya completaste.">
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[["Cálculo Vectorial", 78, "#C99A4B"], ["Física General III", 68, "#8FAF8B"]].map(([n, v, c]) => (
                  <div key={n} className="rounded-xl border border-linea bg-crema-2 p-3 text-sm">
                    <p className="font-medium">{n}</p>
                    <div className="mt-2 h-2 rounded-full bg-[#ece2da]"><div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} /></div>
                  </div>
                ))}
              </div>
            </Bloque>
          </div>
        </div>
      </section>
      {/* ===== FIN Funciones ===== */}

      {/* ===== INICIO Roles ===== */}
      <section id="roles" className="scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div data-revelar>
            <p className="font-semibold text-canela">Para quién</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Cada rol ve exactamente lo que necesita</h2>
            <p className="mt-4 text-tenue">Un estudiante solo ve sus datos y los de sus materias. Un docente publica en las materias que imparte. El administrador gestiona todo.</p>
            <div role="tablist" aria-label="Roles" className="mt-6 inline-flex rounded-2xl bg-[#f2ebe1] p-1">
              {Object.entries(ROLES).map(([k, v]) => (
                <button key={k} role="tab" type="button" aria-selected={rol === k} onClick={() => setRol(k)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${rol === k ? "bg-white shadow-sm" : "text-tenue hover:text-tinta"}`}>
                  {v.titulo}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-espresso p-7 text-white sm:p-9" data-revelar role="tabpanel">
            <Simbolo className="size-10" colorLibro="#FFE5A8" colorDestello="#FFE5A8" />
            <h3 className="mt-4 text-2xl font-bold text-mantequilla">{ROLES[rol].titulo}</h3>
            <p className="mt-2 text-[#f6e9d3]">{ROLES[rol].texto}</p>
            <ul className="mt-5 space-y-3">
              {ROLES[rol].puntos.map((p) => (
                <li key={p} className="flex items-start gap-3"><Destello className="mt-1 size-3.5 shrink-0 text-mantequilla" />{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {/* ===== FIN Roles ===== */}

      {/* ===== INICIO Recordatorios ===== */}
      <section id="avisos" className="scroll-mt-20 bg-[radial-gradient(110%_90%_at_0%_0%,#5c341b_0%,#442816_55%,#3a2213_100%)] py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <div data-revelar>
            <p className="font-semibold text-mantequilla">Recordatorios que sí llegan</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Por correo, SMS o WhatsApp, solo si tú lo autorizas</h2>
            <p className="mt-4 text-[#f6e9d3]">Cuando un docente publica una tarea o programa un evento, te avisamos por los canales que activaste. También puedes programar tus propios recordatorios con la anticipación que prefieras.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {[[Mail, "Correo"], [MessageSquare, "SMS"], [MessageCircle, "WhatsApp"]].map(([I, t]) => (
                <li key={t} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-3"><I className="size-5 text-mantequilla" aria-hidden />{t}</li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#e8d6bd]"><ShieldCheck className="size-4" aria-hidden /> Contraseñas cifradas y sesiones que puedes cerrar en cualquier momento.</p>
          </div>
          <div className="mx-auto w-full max-w-sm rounded-[32px] border border-white/15 bg-[#2e1a0e] p-4 shadow-2xl" data-revelar aria-hidden>
            <div className="rounded-[24px] bg-[#f3ece3] p-4 text-tinta">
              <p className="text-center text-xs text-tenue">Hoy</p>
              <div className="mt-3 max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm">
                Dianova: nueva tarea en Física General III: "Reporte de laboratorio". Entrega: jue 18:00.
              </div>
              <div className="mt-2 max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-sm">
                Dianova: "Examen parcial" empieza mañana a las 16:00 en Aula Magna.
              </div>
              <div className="ml-auto mt-2 w-fit rounded-2xl rounded-tr-sm bg-mantequilla px-3 py-2 text-sm">¡Gracias! 🙌</div>
            </div>
          </div>
        </div>
      </section>
      {/* ===== FIN Recordatorios ===== */}

      {/* ===== INICIO Cierre ===== */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6" data-revelar>
          <Simbolo className="mx-auto size-14" fondo />
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Empieza a ordenar tu semestre hoy</h2>
          <p className="mx-auto mt-3 max-w-xl text-tenue">Crea tu cuenta de estudiante en menos de un minuto. Tu docente y tu escuela pueden sumarse cuando quieran.</p>
          <Link to={autenticado ? "/app" : "/registro"} className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-vino px-6 font-semibold text-white hover:bg-vino-press">
            <Destello className="size-4 text-mantequilla" /> {autenticado ? "Ir a mi panel" : "Crear mi cuenta"}
          </Link>
        </div>
      </section>
      {/* ===== FIN Cierre ===== */}

      <footer className="border-t border-linea bg-crema-2">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-tenue sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <p>Proyecto académico · Planificación de tareas, eventos y recordatorios · {new Date().getFullYear()}</p>
          <div className="flex gap-4"><Link to="/login" className="hover:text-vino">Iniciar sesión</Link><Link to="/registro" className="hover:text-vino">Registro</Link></div>
        </div>
      </footer>

      <style>{`
        .linea{display:block;overflow:hidden;padding:.08em .12em .14em 0;margin:-.08em -.12em -.14em 0}
        .linea>[data-linea-in]{display:block}
      `}</style>
    </div>
  );
}

/** Composición propia de la portada: el planificador de Dianova con su anillo y el destello del logo. */
function Planificador() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="tarjeta relative rounded-[28px] p-6 shadow-[0_30px_60px_-30px_rgb(68_40_22/.45)]" data-planner>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-tenue">Hoy</p>
            <p className="text-xl font-bold">3 entregas</p>
          </div>
          <div className="relative">
            <svg viewBox="0 0 64 64" className="size-16">
              <circle cx="32" cy="32" r={R} fill="none" stroke="#ece2da" strokeWidth="7" />
              <circle data-anillo cx="32" cy="32" r={R} fill="none" stroke="#BD9457" strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset="0" transform="rotate(-90 32 32)" />
            </svg>
            <span className="absolute -right-2 -top-3 text-vino" data-destello><Destello className="size-6" /></span>
          </div>
        </div>
        <ul className="mt-5 space-y-2.5">
          {TAREAS_DEMO.map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl border border-linea bg-crema-2 px-3.5 py-3" data-tarea>
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-espresso" data-casilla>
                <svg viewBox="0 0 16 16" className="size-4"><path data-palomita d="M3.5 8.5l3 3 6-7" fill="none" stroke="#FFE5A8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span className="relative text-[15px] text-tenue">
                {t}
                <span className="absolute left-0 right-0 top-1/2 h-px bg-tenue" data-tachado />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute -left-4 -bottom-6 hidden rounded-2xl border border-linea bg-white px-4 py-3 text-sm shadow-[var(--shadow-suave)] sm:block" data-flotante>
        <p className="flex items-center gap-2 font-semibold"><MessageCircle className="size-4 text-salvia-tinta" /> Recordatorio enviado</p>
        <p className="text-tenue">WhatsApp · 2 h antes</p>
      </div>
      <div className="absolute -left-3 -top-5 rounded-2xl bg-canela px-4 py-2.5 text-sm font-semibold text-white shadow-lg sm:-left-8" data-flotante>
        Examen · jue 16:00
      </div>
    </div>
  );
}

/** Trazo de la marca que subraya la palabra "orden" (va fuera de la máscara de la línea). */
function TrazoOrden() {
  return (
    <svg className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden data-trazo>
      <path d="M2 8c40-6 96-7 196-2" fill="none" stroke="#BD9457" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function TramaLibro() {
  return (
    <svg className="pointer-events-none absolute -right-40 -top-24 h-[560px] w-[560px] opacity-[.07]" viewBox="0 0 64 64" aria-hidden>
      <path d="M12 22c6-2.6 12.4-2.6 19 1.6V47c-6.6-4.2-13-4.2-19-1.6Z" fill="none" stroke="#442816" strokeWidth="1" />
      <path d="M52 22c-6-2.6-12.4-2.6-19 1.6V47c6.6-4.2 13-4.2 19-1.6Z" fill="none" stroke="#442816" strokeWidth="1" />
    </svg>
  );
}

function Bloque({ className = "", icono: Icono, titulo, texto, children }) {
  return (
    <article className={`rounded-[var(--radius-tarjeta)] border border-linea bg-white p-6 shadow-[var(--shadow-tarjeta)] ${className}`} data-bloque>
      <span className="grid size-11 place-items-center rounded-xl bg-espresso text-mantequilla"><Icono className="size-5" aria-hidden /></span>
      <h3 className="mt-4 text-xl font-bold">{titulo}</h3>
      <p className="mt-1.5 text-tenue">{texto}</p>
      {children}
    </article>
  );
}

// ------------------------------------------------------------------ animaciones (GSAP)

/** Firma: el estado final ya está en el HTML; GSAP solo pone el inicio y lo anima. Si algo falla, todo se ve completo. */
function firma() {
  const tl = gsap.timeline({ defaults: { ease: M.ease } });
  gsap.set("[data-linea-in]", { yPercent: 115 });
  tl.to("[data-linea-in]", { yPercent: 0, duration: M.dur * 1.2, stagger: 0.12 }, 0)
    .from("[data-hero-meta-item], [data-hero-meta] > *", { y: M.dist, autoAlpha: 0, duration: M.dur, stagger: M.stagger }, 0.25)
    .from("[data-planner]", { y: 40, scale: 0.96, autoAlpha: 0, duration: M.dur * 1.1 }, 0.15)
    .from("[data-flotante]", { y: 20, autoAlpha: 0, duration: M.dur, stagger: 0.18 }, 0.55);

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
  gsap.set("[data-destello]", { scale: 0, rotate: -120, transformOrigin: "50% 50%" });

  casillas.forEach((c, i) => {
    const t0 = 1.0 + i * 0.38;
    tl.to(c, { backgroundColor: "#442816", boxShadow: "inset 0 0 0 0px #d9c9b3", scale: 1.15, duration: 0.18, ease: "power2.out" }, t0)
      .to(c, { scale: 1, duration: 0.35, ease: M.pop }, t0 + 0.18)
      .to(palomitas[i], { strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }, t0 + 0.05)
      .to(tachados[i], { scaleX: 1, duration: 0.35, ease: M.easeIO }, t0 + 0.12)
      .to("[data-anillo]", { strokeDashoffset: C * (1 - (i + 1) / casillas.length), duration: 0.4, ease: M.easeIO }, t0 + 0.1);
  });
  const fin = 1.0 + casillas.length * 0.38 + 0.15;
  tl.to("[data-destello]", { scale: 1, rotate: 0, duration: 0.7, ease: M.pop }, fin)
    .fromTo("[data-cta-destello]", { scale: 1 }, { scale: 1.5, rotate: 90, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, fin + 0.35);
  return tl;
}

function revelados() {
  gsap.utils.toArray("[data-revelar]").forEach((el) => {
    gsap.from(el, { y: M.dist, autoAlpha: 0, duration: M.dur, ease: M.ease, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });
  const bloques = gsap.utils.toArray("[data-bloque]");
  if (bloques.length) {
    gsap.from(bloques, { y: M.dist, autoAlpha: 0, duration: M.dur, ease: M.ease, stagger: M.stagger, scrollTrigger: { trigger: bloques[0], start: "top 85%", once: true } });
  }
}
