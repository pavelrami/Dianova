import { useState } from "react";
import Modal from "../../../components/ui/Modal";
import Paginacion from "../../../components/ui/Paginacion";
import Avatar from "../../../components/ui/Avatar";
import Pestanas from "../../../components/ui/Pestanas";
import { FilasEsqueleto } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import useConsulta, { useRetraso } from "../../../hooks/useConsulta";
import { tareasApi } from "../../../api/servicios";
import { ESTADO_SEGUIMIENTO, Insignia } from "../../../utils/etiquetas";
import { fechaHora } from "../../../utils/formato";

/** Docente/Admin: avance individual de cada estudiante en una tarea (seguimientos_tarea), paginado en el servidor. */
export default function AvanceModal({ tarea, onCerrar }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const qr = useRetraso(q);
  const { datos, cargando, error, recargar } = useConsulta(
    (signal) => (tarea ? tareasApi.seguimientos(tarea.id, { page, size, estado, q: qr }, signal) : Promise.resolve(null)),
    [tarea?.id, page, size, estado, qr],
    { activo: Boolean(tarea) }
  );

  return (
    <Modal abierto={Boolean(tarea)} onCerrar={onCerrar} titulo={`Avance: ${tarea?.titulo ?? ""}`} descripcion={tarea?.materia?.nombre} ancho="max-w-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Pestanas
          valor={estado}
          onCambio={(v) => { setEstado(v); setPage(0); }}
          opciones={[
            { valor: "", etiqueta: "Todos" },
            { valor: "PENDIENTE", etiqueta: "Por empezar" },
            { valor: "EN_PROCESO", etiqueta: "En progreso" },
            { valor: "COMPLETADA", etiqueta: "Completado" },
          ]}
        />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0); }}
          placeholder="Buscar estudiante…"
          className="h-10 rounded-xl border border-linea px-3 text-sm outline-none focus:border-caramelo"
          aria-label="Buscar estudiante"
        />
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-linea">
        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={4} columnas={3} />
        ) : datos?.contenido.length === 0 ? (
          <Vacio titulo="Sin estudiantes" mensaje="No hay seguimientos con ese filtro." />
        ) : (
          <ul className={`divide-y divide-linea ${cargando ? "opacity-60" : ""}`}>
            {datos?.contenido.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar nombre={s.estudiante.nombreCompleto} url={s.estudiante.avatarUrl} tamano="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-tinta">{s.estudiante.nombreCompleto}</p>
                  <p className="truncate text-xs text-tenue">{s.completadaEn ? `Completada ${fechaHora(s.completadaEn)}` : s.estudiante.correo}</p>
                </div>
                <Insignia mapa={ESTADO_SEGUIMIENTO} valor={s.estado} />
              </li>
            ))}
          </ul>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={(t) => { setSize(t); setPage(0); }} cargando={cargando} />
      </div>
    </Modal>
  );
}
