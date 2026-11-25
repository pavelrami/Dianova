import { Link } from "react-router-dom";
import Logo from "../../components/ui/Logo";

/**
 * Pantallas de acceso: panel izquierdo rectilíneo con marca de agua de logo
 * sin destello y formulario sobre tarjeta a la derecha.
 */
export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-[#ffe6a7]/20 bg-gradient-to-br from-[#432818] via-[#6f1d1b] to-[#99582a] px-6 py-8 text-white lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
        <MarcaAguaLogoSinDestello />

        <div className="relative z-10">
          <Link to="/" className="inline-block" aria-label="Ir al inicio de Dianova">
            <Logo claro />
          </Link>
        </div>

        <div className="relative z-10 my-10 max-w-md border-l-2 border-[#ffe6a7] pl-5 lg:my-0">
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl lg:text-[32px]">
            {titulo}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#ffe6a7]/90 sm:text-base">
            {subtitulo}
          </p>
        </div>

        <div className="relative z-10 hidden max-w-sm border border-[#ffe6a7]/25 bg-[#432818]/75 px-5 py-3.5 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ffe6a7]">
            Tu semana, en orden
          </p>
          <p className="mt-1 text-sm leading-snug text-white/85">
            Tareas, clases y recordatorios juntos
          </p>
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

/** Marca de agua del libro del logo en el fondo, sin destello. */
function MarcaAguaLogoSinDestello() {
  return (
    <svg
      className="pointer-events-none absolute -right-20 -bottom-20 h-[440px] w-[440px] opacity-[.08]"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <path
        d="M12 22c6-2.6 12.4-2.6 19 1.6V47c-6.6-4.2-13-4.2-19-1.6Z"
        fill="none"
        stroke="#ffe6a7"
        strokeWidth="1.3"
      />
      <path
      
        d="M52 22c-6-2.6-12.4-2.6-19 1.6V47c6.6-4.2 13-4.2 19-1.6Z"
        fill="none"
        stroke="#ffe6a7"
        strokeWidth="1.3"
      />
    </svg>
  );
}