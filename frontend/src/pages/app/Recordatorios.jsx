import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import ListaRecordatorios from "./recordatorios/ListaRecordatorios";

/** Prototipo 07 · Recordatorios del usuario (correo, SMS y WhatsApp). */
export default function Recordatorios() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="migas">Recordatorios</p>
          <h1 className="titulo-pagina mt-1">Mis recordatorios</h1>
          <p className="mt-1 text-tenue">Programa avisos desde tus tareas o eventos con el ícono de campana.</p>
        </div>
        <Link to="/app/perfil#notificaciones" className="inline-flex h-11 items-center gap-2 rounded-xl border border-linea bg-white px-4 text-sm font-semibold text-tinta hover:border-caramelo">
          <Settings className="size-4" aria-hidden /> Canales y anticipación
        </Link>
      </div>
      <ListaRecordatorios />
    </div>
  );
}
