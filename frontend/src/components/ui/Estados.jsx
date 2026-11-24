import { WifiOff, RefreshCw, Inbox, ShieldAlert } from "lucide-react";
import Boton from "./Boton";

/** Error de red o del servidor con opción de reintentar. */
export function ErrorCarga({ error, onReintentar }) {
  if (!error) return null;
  const red = error.red || error.estado === 0;
  const Icono = red ? WifiOff : error.estado === 403 ? ShieldAlert : RefreshCw;
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-vino/20 bg-vino-suave/50 px-6 py-8 text-center" role="alert">
      <Icono className="size-7 text-vino" aria-hidden />
      <div>
        <p className="font-semibold text-tinta">{red ? "Sin conexión con el servidor" : "No pudimos cargar la información"}</p>
        <p className="mt-1 text-sm text-tenue">{error.mensaje}</p>
      </div>
      {onReintentar && (
        <Boton variante="secundario" tamano="sm" icono={RefreshCw} onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}

export function Vacio({ titulo = "Nada por aquí", mensaje, accion, icono: Icono = Inbox }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-mantequilla-suave text-canela">
        <Icono className="size-6" aria-hidden />
      </span>
      <p className="mt-1 font-semibold text-tinta">{titulo}</p>
      {mensaje && <p className="max-w-sm text-sm text-tenue">{mensaje}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}
