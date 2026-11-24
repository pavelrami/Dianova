import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import Paginacion from "../../../components/ui/Paginacion";
import Avatar from "../../../components/ui/Avatar";
import Pestanas from "../../../components/ui/Pestanas";
import { FilasEsqueleto } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import { useToast } from "../../../components/ui/Toast";
import useConsulta from "../../../hooks/useConsulta";
import { eventosApi } from "../../../api/servicios";
import { Insignia, RESPUESTA } from "../../../utils/etiquetas";

/** Invitados de un evento (participaciones_evento, N:M usuario-evento) y registro de asistencia. */
export default function ParticipantesModal({ evento, onCerrar }) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [respuesta, setRespuesta] = useState("");
  const { datos, cargando, error, recargar, setDatos } = useConsulta(
    (signal) => (evento ? eventosApi.participantes(evento.id, { page, size, respuesta }, signal) : Promise.resolve(null)),
    [evento?.id, page, size, respuesta],
    { activo: Boolean(evento) }
  );
  const yaEmpezo = evento && new Date(evento.inicio) <= new Date();

  const asistencia = async (p, valor) => {
    try {
      const act = await eventosApi.asistencia(evento.id, p.id, valor);
      setDatos((d) => ({ ...d, contenido: d.contenido.map((x) => (x.id === p.id ? act : x)) }));
    } catch (e) {
      toast.error(e.mensaje);
    }
  };

  return (
    <Modal abierto={Boolean(evento)} onCerrar={onCerrar} titulo="Invitados" descripcion={evento?.titulo} ancho="max-w-2xl">
      <Pestanas
        valor={respuesta}
        onCambio={(v) => { setRespuesta(v); setPage(0); }}
        opciones={[
          { valor: "", etiqueta: "Todos" },
          { valor: "CONFIRMADA", etiqueta: "Asistirán" },
          { valor: "RECHAZADA", etiqueta: "No asistirán" },
          { valor: "PENDIENTE", etiqueta: "Sin responder" },
        ]}
      />
      {!yaEmpezo && <p className="mt-3 text-sm text-tenue">La asistencia se podrá registrar cuando el evento empiece.</p>}
      <div className="mt-4 overflow-hidden rounded-2xl border border-linea">
        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={4} columnas={3} />
        ) : datos?.contenido.length === 0 ? (
          <Vacio titulo="Sin invitados" mensaje="No hay invitados con ese filtro." />
        ) : (
          <ul className={`divide-y divide-linea ${cargando ? "opacity-60" : ""}`}>
            {datos?.contenido.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar nombre={p.usuario.nombreCompleto} url={p.usuario.avatarUrl} tamano="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-tinta">{p.usuario.nombreCompleto}</p>
                  <p className="truncate text-xs text-tenue">{p.usuario.correo}</p>
                </div>
                <Insignia mapa={RESPUESTA} valor={p.respuesta} />
                {yaEmpezo && (
                  <label className="flex items-center gap-2 text-sm text-tinta">
                    <input type="checkbox" className="size-4 accent-vino" checked={Boolean(p.asistio)} onChange={(e) => asistencia(p, e.target.checked)} />
                    Asistió
                  </label>
                )}
              </li>
            ))}
          </ul>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={(t) => { setSize(t); setPage(0); }} cargando={cargando} />
      </div>
    </Modal>
  );
}
