import { Loader2 } from "lucide-react";
import { Simbolo } from "./Logo";

export function Spinner({ texto = "Cargando…", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-10 text-sm text-tenue ${className}`} role="status">
      <Loader2 className="size-5 animate-spin text-caramelo" aria-hidden />
      {texto}
    </div>
  );
}

export function PantallaCarga() {
  return (
    <div className="grid min-h-svh place-items-center bg-crema" role="status" aria-label="Cargando Dianova">
      <div className="flex flex-col items-center gap-4">
        <Simbolo className="size-14 animate-pulse" fondo />
        <p className="text-sm text-tenue">Preparando tu planificador…</p>
      </div>
    </div>
  );
}

/** Filas de esqueleto mientras llega la respuesta de la API. */
export function FilasEsqueleto({ filas = 5, columnas = 4 }) {
  return (
    <div className="space-y-3 p-4" aria-hidden>
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columnas }).map((__, j) => (
            <div key={j} className="esqueleto h-5" style={{ flex: j === 0 ? 3 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TarjetasEsqueleto({ n = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="tarjeta space-y-3 p-5">
          <div className="esqueleto h-5 w-2/3" />
          <div className="esqueleto h-4 w-1/2" />
          <div className="esqueleto h-16" />
        </div>
      ))}
    </div>
  );
}
