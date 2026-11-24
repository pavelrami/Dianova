/** Pestañas tipo "segmento" como en el prototipo (Todas · Pendientes · Completadas…). */
export default function Pestanas({ opciones, valor, onCambio, etiqueta = "Filtro", className = "" }) {
  return (
    <div role="tablist" aria-label={etiqueta} className={`flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-[#f2ebe1] p-1 ${className}`}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={String(o.valor)}
            role="tab"
            type="button"
            aria-selected={activo}
            onClick={() => onCambio(o.valor)}
            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
              activo ? "bg-white text-tinta shadow-sm" : "text-tenue hover:text-tinta"
            }`}
          >
            {o.icono && <o.icono className="size-4" aria-hidden />}
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
