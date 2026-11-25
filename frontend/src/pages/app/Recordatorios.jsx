import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import ListaRecordatorios from "./recordatorios/ListaRecordatorios";

const TONO_CANELA = "#dcc6a3";

/** Prototipo 07 · Recordatorios del usuario (correo, SMS y WhatsApp). */
export default function Recordatorios() {
  return (
    <div className="space-y-4 bg-crema font-sans text-[15px] text-tinta">
      {/* Fila 1: Título y acceso a configuración */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="titulo-pagina leading-tight">Mis recordatorios</h1>
          <p className="mt-1 text-sm text-tenue">
            Programa avisos desde tus tareas o eventos con el ícono de campana.
          </p>
        </div>
        <Link
          to="/app/perfil#notificaciones"
          className="inline-flex h-10 items-center gap-2 rounded-sm border border-[#c6ad86] bg-white px-4 text-sm font-semibold text-tinta transition-colors hover:brightness-95"
          style={{ backgroundColor: TONO_CANELA }}
        >
          <Settings className="size-4" aria-hidden /> Canales y anticipación
        </Link>
      </div>

      {/* Fila 2: Listado de recordatorios */}
      <ListaRecordatorios />
    </div>
  );
}