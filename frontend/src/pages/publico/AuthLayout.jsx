import { Link } from "react-router-dom";
import Logo, { Destello } from "../../components/ui/Logo";

/**
 * Pantallas de acceso (prototipo 01 y 02): panel cálido a la izquierda con la composición
 * de la marca y formulario sobre tarjeta mantequilla a la derecha. En celular, el panel se reduce a un encabezado.
 */
export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_10%_0%,#5c341b_0%,#442816_45%,#8d532b_100%)] px-6 pb-10 pt-6 text-white lg:px-14 lg:py-12">
        <PatronLibros />
        <Link to="/" className="relative inline-block" aria-label="Ir al inicio de Dianova">
          <Logo claro />
        </Link>
        <div className="relative mt-8 max-w-md lg:mt-[22vh]">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{titulo}</h1>
          <p className="mt-3 text-base text-[#f6e9d3] sm:text-lg">{subtitulo}</p>
        </div>
        <div className="relative mt-10 hidden w-fit items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm lg:flex">
          <AnilloProgreso />
          <div>
            <p className="font-semibold">Tu semana, en orden</p>
            <p className="text-sm text-[#f6e9d3]">Tareas, clases y recordatorios juntos</p>
          </div>
        </div>
      </aside>
      <main className="flex items-start justify-center bg-crema-2 px-4 py-8 sm:items-center sm:px-8 lg:py-12">
        <div className="w-full max-w-[460px] rounded-[28px] border border-[#f0d796] bg-mantequilla p-6 shadow-[0_24px_60px_-30px_rgb(68_40_22/.45)] sm:p-9">
          {children}
        </div>
      </main>
    </div>
  );
}

function AnilloProgreso() {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 56 56" className="size-14" aria-hidden>
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(255 255 255 / .2)" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="#FFE5A8" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.18} transform="rotate(-90 28 28)" />
      <g transform="translate(20 20)" color="#FFE5A8">
        <Destello className="size-4" />
      </g>
    </svg>
  );
}

/** Páginas del libro del logo repetidas como trama muy tenue. */
function PatronLibros() {
  return (
    <svg className="pointer-events-none absolute -right-24 -bottom-24 h-[520px] w-[520px] opacity-[.09]" viewBox="0 0 64 64" aria-hidden>
      <path d="M12 22c6-2.6 12.4-2.6 19 1.6V47c-6.6-4.2-13-4.2-19-1.6Z" fill="none" stroke="#FFE5A8" strokeWidth="1.2" />
      <path d="M52 22c-6-2.6-12.4-2.6-19 1.6V47c6.6-4.2 13-4.2 19-1.6Z" fill="none" stroke="#FFE5A8" strokeWidth="1.2" />
      <path d="M47 6.5c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7Z" fill="#FFE5A8" />
    </svg>
  );
}
