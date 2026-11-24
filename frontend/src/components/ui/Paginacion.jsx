import { ArrowLeft, ArrowRight } from "lucide-react";

/** Paginación del lado del servidor: cada cambio vuelve a pedir la página a la API. */
export default function Paginacion({ pagina, onPagina, tamano, onTamano, opciones = [5, 10, 20], cargando }) {
  if (!pagina) return null;
  const { pagina: actual, totalPaginas, totalElementos, tamano: t } = pagina;
  const desde = totalElementos === 0 ? 0 : actual * t + 1;
  const hasta = Math.min((actual + 1) * t, totalElementos);
  const paginas = rango(actual, totalPaginas);

  return (
    <div className="flex flex-col gap-3 border-t border-linea px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-tenue">
        <label className="flex items-center gap-2">
          Mostrar
          <select
            value={tamano}
            onChange={(e) => onTamano(Number(e.target.value))}
            className="h-9 rounded-lg border border-linea bg-white px-2 text-tinta"
            disabled={cargando}
          >
            {opciones.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
        <span aria-live="polite">
          {desde}–{hasta} de {totalElementos}
        </span>
      </div>
      <nav className="flex items-center gap-1.5" aria-label="Paginación">
        <BotonPagina onClick={() => onPagina(actual - 1)} disabled={actual === 0 || cargando} etiqueta="Página anterior">
          <ArrowLeft className="size-4" />
        </BotonPagina>
        {paginas.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-tenue">…</span>
          ) : (
            <BotonPagina key={p} activo={p === actual} onClick={() => onPagina(p)} disabled={cargando} etiqueta={`Página ${p + 1}`}>
              {p + 1}
            </BotonPagina>
          )
        )}
        <BotonPagina onClick={() => onPagina(actual + 1)} disabled={actual >= totalPaginas - 1 || cargando} etiqueta="Página siguiente">
          <ArrowRight className="size-4" />
        </BotonPagina>
      </nav>
    </div>
  );
}

function BotonPagina({ children, activo, etiqueta, ...props }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      aria-current={activo ? "page" : undefined}
      className={`grid h-10 min-w-10 place-items-center rounded-xl border px-2 text-sm font-medium transition-colors disabled:opacity-40 ${
        activo ? "border-espresso bg-espresso text-mantequilla" : "border-linea bg-white text-tinta hover:border-caramelo"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function rango(actual, total) {
  if (total <= 1) return total === 1 ? [0] : [];
  const set = new Set([0, total - 1, actual, actual - 1, actual + 1].filter((p) => p >= 0 && p < total));
  const orden = [...set].sort((a, b) => a - b);
  const out = [];
  orden.forEach((p, i) => {
    if (i > 0 && p - orden[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}
