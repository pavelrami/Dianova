/**
 * Logo de Dianova: un libro abierto (el orden del estudio) con un destello de cuatro puntas
 * (el logro). El destello es el elemento que se repite en el sitio: botón principal,
 * avisos de éxito y la animación firma de la portada.
 */
export function Simbolo({ className = "size-8", fondo = false, colorLibro = "currentColor", colorDestello = "currentColor" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
      {fondo && <rect width="64" height="64" rx="16" fill="#442816" />}
      <path
        className="logo-pagina"
        d="M12 22c6-2.6 12.4-2.6 19 1.6V47c-6.6-4.2-13-4.2-19-1.6Z"
        stroke={fondo ? "#FFE5A8" : colorLibro}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path
        className="logo-pagina"
        d="M52 22c-6-2.6-12.4-2.6-19 1.6V47c6.6-4.2 13-4.2 19-1.6Z"
        stroke={fondo ? "#FFE5A8" : colorLibro}
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path className="logo-destello" d="M47 6.5c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7Z" fill={fondo ? "#FFE5A8" : colorDestello} />
    </svg>
  );
}

/** Destello suelto (rima de la marca). */
export function Destello({ className = "size-4" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M8 0c.9 4.9 3.1 7.1 8 8-4.9.9-7.1 3.1-8 8-.9-4.9-3.1-7.1-8-8C4.9 7.1 7.1 4.9 8 0Z" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ claro = false, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Simbolo className="size-9" colorLibro={claro ? "#FFE5A8" : "#442816"} colorDestello={claro ? "#FFE5A8" : "#BD9457"} />
      <span className={`text-[22px] font-bold tracking-tight ${claro ? "text-mantequilla" : "text-espresso"}`}>Dianova</span>
    </span>
  );
}
