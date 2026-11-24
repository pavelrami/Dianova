import { useEffect, useState } from "react";
import { Mail, MessageSquare, MessageCircle, Send, Ban, Trash2, Search, BellOff, ClipboardCheck, CalendarRange } from "lucide-react";
import { recordatoriosApi } from "../../../api/servicios";
import useConsulta, { useRetraso } from "../../../hooks/useConsulta";
import Pestanas from "../../../components/ui/Pestanas";
import Paginacion from "../../../components/ui/Paginacion";
import Avatar from "../../../components/ui/Avatar";
import { ConfirmarModal } from "../../../components/ui/Modal";
import { FilasEsqueleto } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import { useToast } from "../../../components/ui/Toast";
import { CANAL, ESTADO_RECORDATORIO, Insignia } from "../../../utils/etiquetas";
import { fechaHora, relativa } from "../../../utils/formato";

const ICONO_CANAL = { EMAIL: Mail, SMS: MessageSquare, WHATSAPP: MessageCircle };

/** Lista paginada de recordatorios. admin=true muestra los de todos los usuarios (supervisión). */
export default function ListaRecordatorios({ admin = false }) {
  const toast = useToast();
  const [estado, setEstado] = useState(admin ? "" : "PENDIENTE");
  const [canal, setCanal] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [accion, setAccion] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const qr = useRetraso(q);

  useEffect(() => setPage(0), [estado, canal, qr, size]);
  const params = { estado, canal, q: qr, page, size, orden: "programado", dir: estado === "PENDIENTE" ? "asc" : "desc" };
  const { datos, cargando, error, recargar } = useConsulta(
    (s) => (admin ? recordatoriosApi.todos(params, s) : recordatoriosApi.listar(params, s)),
    [JSON.stringify(params), admin]
  );

  const ejecutar = async () => {
    setProcesando(true);
    try {
      if (accion.tipo === "enviar") {
        const r = await recordatoriosApi.enviar(accion.r.id);
        if (r.estado === "ENVIADO") toast.exito(`Enviado por ${CANAL[r.canal].texto}`);
        else toast.error(`No se pudo enviar: ${r.detalleError || "revisa la configuración"}`);
      } else if (accion.tipo === "cancelar") {
        await recordatoriosApi.cancelar(accion.r.id);
        toast.exito("Recordatorio cancelado");
      } else {
        await recordatoriosApi.eliminar(accion.r.id);
        toast.exito("Recordatorio eliminado");
      }
      setAccion(null);
      recargar();
    } catch (e) {
      toast.error(e.mensaje);
    } finally {
      setProcesando(false);
    }
  };

  const textos = {
    enviar: { titulo: "¿Enviar ahora?", boton: "Enviar ahora", msg: (r) => <>Se enviará en este momento por <b>{CANAL[r.canal].texto}</b>{admin ? <> a <b>{r.usuario.nombreCompleto}</b></> : ""}.</> },
    cancelar: { titulo: "¿Cancelar recordatorio?", boton: "Cancelar recordatorio", msg: () => "Ya no se enviará. Quedará en el historial como cancelado." },
    eliminar: { titulo: "¿Eliminar del historial?", boton: "Eliminar", msg: () => "Se borrará el registro de este recordatorio. Esta acción no se puede deshacer." },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Pestanas
          valor={estado}
          onCambio={setEstado}
          etiqueta="Estado"
          className="w-fit"
          opciones={[
            { valor: "", etiqueta: "Todos" },
            { valor: "PENDIENTE", etiqueta: "Pendientes" },
            { valor: "ENVIADO", etiqueta: "Enviados" },
            { valor: "FALLIDO", etiqueta: "Fallidos" },
            { valor: "CANCELADO", etiqueta: "Cancelados" },
          ]}
        />
        <div className="grid gap-2 sm:grid-cols-[170px_1fr] lg:w-[480px]">
          <select value={canal} onChange={(e) => setCanal(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Canal">
            <option value="">Canal: Todos</option>
            <option value="EMAIL">Correo</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
          <label className="relative">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={admin ? "Buscar por usuario o mensaje…" : "Buscar en mensajes…"} className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
          </label>
        </div>
      </div>

      <section className="tarjeta overflow-hidden">
        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={5} columnas={4} />
        ) : datos.contenido.length === 0 ? (
          <Vacio titulo="Sin recordatorios" mensaje={admin ? "No hay recordatorios con ese filtro." : "Programa uno desde una tarea o un evento con el ícono de campana."} icono={BellOff} />
        ) : (
          <ul className={`divide-y divide-linea ${cargando ? "opacity-60" : ""}`}>
            {datos.contenido.map((r) => {
              const Icono = ICONO_CANAL[r.canal];
              const Ref = r.tarea ? ClipboardCheck : CalendarRange;
              return (
                <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className={`mt-0.5 h-11 w-1 shrink-0 rounded-full ${r.estado === "FALLIDO" ? "bg-vino" : r.estado === "ENVIADO" ? "bg-salvia" : r.estado === "CANCELADO" ? "bg-linea" : "bg-caramelo"}`} aria-hidden />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-semibold text-tinta">
                        <Ref className="size-4 shrink-0 text-tenue" aria-hidden />
                        <span className="truncate">{r.tarea?.titulo || r.evento?.titulo}</span>
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-tenue">
                        <span className="inline-flex items-center gap-1"><Icono className="size-3.5" aria-hidden />{CANAL[r.canal].texto}</span>
                        <span>· {r.estado === "ENVIADO" && r.enviadoEn ? `Enviado ${fechaHora(r.enviadoEn)}` : relativa(r.programadoPara)}</span>
                        {r.intentos > 0 && r.estado !== "ENVIADO" && <span>· {r.intentos} {r.intentos === 1 ? "intento" : "intentos"}</span>}
                      </p>
                      {r.mensaje && <p className="mt-1 line-clamp-2 text-sm text-tinta/80">{r.mensaje}</p>}
                      {r.detalleError && r.estado !== "ENVIADO" && <p className="mt-1 text-xs text-vino">{r.detalleError}</p>}
                    </div>
                  </div>
                  {admin && (
                    <div className="flex items-center gap-2 sm:w-56">
                      <Avatar nombre={r.usuario.nombreCompleto} url={r.usuario.avatarUrl} tamano="size-8" />
                      <div className="min-w-0 text-sm">
                        <p className="truncate font-medium text-tinta">{r.usuario.nombreCompleto}</p>
                        <p className="truncate text-xs text-tenue">{r.usuario.correo}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <Insignia mapa={ESTADO_RECORDATORIO} valor={r.estado} />
                    <div className="flex">
                      {(r.estado === "PENDIENTE" || r.estado === "FALLIDO") && (
                        <BotonIcono etiqueta="Enviar ahora" icono={Send} onClick={() => setAccion({ tipo: "enviar", r })} />
                      )}
                      {r.estado === "PENDIENTE" && <BotonIcono etiqueta="Cancelar" icono={Ban} onClick={() => setAccion({ tipo: "cancelar", r })} />}
                      <BotonIcono etiqueta="Eliminar" icono={Trash2} peligro onClick={() => setAccion({ tipo: "eliminar", r })} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={setSize} cargando={cargando} />
      </section>

      <ConfirmarModal
        abierto={Boolean(accion)}
        onCerrar={() => setAccion(null)}
        onConfirmar={ejecutar}
        cargando={procesando}
        peligro={accion?.tipo === "eliminar"}
        titulo={accion ? textos[accion.tipo].titulo : ""}
        textoConfirmar={accion ? textos[accion.tipo].boton : ""}
        mensaje={accion ? textos[accion.tipo].msg(accion.r) : null}
      />
    </div>
  );
}

function BotonIcono({ etiqueta, icono: Icono, onClick, peligro }) {
  return (
    <button type="button" onClick={onClick} aria-label={etiqueta} title={etiqueta} className={`grid size-9 place-items-center rounded-lg ${peligro ? "text-vino hover:bg-vino-suave" : "text-tenue hover:bg-caramelo-suave hover:text-tinta"}`}>
      <Icono className="size-4" />
    </button>
  );
}
