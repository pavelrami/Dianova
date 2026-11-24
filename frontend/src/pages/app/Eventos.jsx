import { useEffect, useState } from "react";
import { Plus, Search, Clock, MapPin, Users, BellPlus, Pencil, Trash2, Check, X, CalendarRange } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { eventosApi, materiasApi } from "../../api/servicios";
import useConsulta, { useRetraso } from "../../hooks/useConsulta";
import Boton from "../../components/ui/Boton";
import Pestanas from "../../components/ui/Pestanas";
import Paginacion from "../../components/ui/Paginacion";
import { ConfirmarModal } from "../../components/ui/Modal";
import { TarjetasEsqueleto } from "../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../components/ui/Estados";
import { useToast } from "../../components/ui/Toast";
import { ESTADO_EVENTO, Insignia, RESPUESTA, TIPO_EVENTO } from "../../utils/etiquetas";
import { hora, relativa } from "../../utils/formato";
import EventoFormulario from "./eventos/EventoFormulario";
import ParticipantesModal from "./eventos/ParticipantesModal";
import RecordatorioFormulario from "./recordatorios/RecordatorioFormulario";

const ahoraIso = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00:00`;
};

/** Prototipo 06 · Eventos y actividades. */
export default function Eventos() {
  const { usuario, esEstudiante } = useAuth();
  const toast = useToast();
  const [tipo, setTipo] = useState("");
  const [cuando, setCuando] = useState("proximos");
  const [materiaId, setMateriaId] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [formulario, setFormulario] = useState({ abierto: false, evento: null });
  const [invitados, setInvitados] = useState(null);
  const [recordar, setRecordar] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const qr = useRetraso(q);
  const { datos: materias } = useConsulta(() => materiasApi.listar({ size: 50 }), []);

  useEffect(() => setPage(0), [tipo, cuando, materiaId, qr, size]);
  const consulta = {
    tipo, materiaId, q: qr, page, size,
    ...(cuando === "proximos" ? { desde: ahoraIso(), dir: "asc" } : { hasta: ahoraIso(), dir: "desc" }),
  };
  const { datos, cargando, error, recargar, setDatos } = useConsulta((s) => eventosApi.listar(consulta, s), [JSON.stringify(consulta)]);

  const responder = async (e, respuesta) => {
    try {
      const act = await eventosApi.responder(e.id, respuesta);
      setDatos((d) => ({ ...d, contenido: d.contenido.map((x) => (x.id === e.id ? act : x)) }));
      toast.exito(respuesta === "CONFIRMADA" ? "¡Te esperamos!" : "Respuesta registrada");
    } catch (err) {
      toast.error(err.mensaje);
    }
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await eventosApi.eliminar(eliminar.id);
      toast.exito("Evento eliminado");
      setEliminar(null);
      recargar();
    } catch (err) {
      toast.error(err.mensaje);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="migas">Eventos / {cuando === "proximos" ? "Próximos eventos" : "Eventos pasados"}</p>
          <h1 className="titulo-pagina mt-1">Eventos y Actividades</h1>
          <p className="mt-1 text-tenue">{datos ? `${datos.totalElementos} ${datos.totalElementos === 1 ? "evento" : "eventos"}` : " "}</p>
        </div>
        <Boton icono={Plus} onClick={() => setFormulario({ abierto: true, evento: null })}>Crear evento</Boton>
      </div>

      <Pestanas
        valor={tipo}
        onCambio={setTipo}
        etiqueta="Tipo de evento"
        className="w-fit"
        opciones={[
          { valor: "", etiqueta: "Todos" },
          { valor: "EXAMEN", etiqueta: "Exámenes" },
          { valor: "TALLER", etiqueta: "Talleres" },
          { valor: "ESTUDIO", etiqueta: "Grupos de estudio" },
          { valor: "ASESORIA", etiqueta: "Asesorías" },
          { valor: "SOCIAL", etiqueta: "Universitarios" },
          { valor: "PERSONAL", etiqueta: "Personales" },
        ]}
      />

      <div className="grid gap-2 sm:grid-cols-[200px_220px_1fr]">
        <select value={cuando} onChange={(e) => setCuando(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Fecha">
          <option value="proximos">Fecha: Próximos</option>
          <option value="pasados">Fecha: Pasados</option>
        </select>
        <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Materia">
          <option value="">Materia: Todas</option>
          {materias?.contenido.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <label className="relative">
          <span className="sr-only">Buscar eventos</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título o lugar…" className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
        </label>
      </div>

      {error ? (
        <ErrorCarga error={error} onReintentar={recargar} />
      ) : cargando && !datos ? (
        <TarjetasEsqueleto n={6} />
      ) : datos.contenido.length === 0 ? (
        <div className="tarjeta"><Vacio titulo="No hay eventos" mensaje="Prueba con otro filtro o crea uno nuevo." icono={CalendarRange} /></div>
      ) : (
        <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${cargando ? "opacity-60" : ""}`}>
          {datos.contenido.map((e) => {
            const t = TIPO_EVENTO[e.tipo];
            const propio = e.creador?.id === usuario.id || (!esEstudiante && usuario.rol === "ADMIN");
            const gestiona = propio || (e.materia && !esEstudiante);
            return (
              <article key={e.id} className="tarjeta animar-entrada flex flex-col overflow-hidden">
                <div className="px-5 pb-4 pt-4" style={{ background: `${t.barra}26` }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`chip ${t.clase}`}>{t.texto}</span>
                    {e.estado !== "PROGRAMADO" && <Insignia mapa={ESTADO_EVENTO} valor={e.estado} />}
                  </div>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-tinta">{e.titulo}</h2>
                </div>
                <div className="flex-1 space-y-2 px-5 py-4 text-sm text-tinta">
                  <p className="flex items-center gap-2"><Clock className="size-4 text-tenue" aria-hidden />{relativa(e.inicio)} – {hora(e.fin)}</p>
                  {e.ubicacion && <p className="flex items-center gap-2"><MapPin className="size-4 text-tenue" aria-hidden />{e.ubicacion}</p>}
                  <p className="flex items-center gap-2"><Users className="size-4 text-tenue" aria-hidden />{e.materia ? e.materia.nombre : "Evento personal"}</p>
                  {e.totalParticipantes > 0 && <p className="text-tenue">{e.confirmados} de {e.totalParticipantes} confirmaron</p>}
                  {e.descripcion && <p className="line-clamp-2 text-tenue">{e.descripcion}</p>}
                  {e.miRespuesta && <Insignia mapa={RESPUESTA} valor={e.miRespuesta} />}
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-linea px-5 py-3">
                  {e.miRespuesta && e.estado === "PROGRAMADO" && (
                    <>
                      <Boton tamano="sm" variante={e.miRespuesta === "CONFIRMADA" ? "oscuro" : "secundario"} icono={Check} onClick={() => responder(e, "CONFIRMADA")}>Asistiré</Boton>
                      <Boton tamano="sm" variante="fantasma" icono={X} onClick={() => responder(e, "RECHAZADA")}>No asistiré</Boton>
                    </>
                  )}
                  {!esEstudiante && e.materia && gestiona && <Boton tamano="sm" variante="secundario" icono={Users} onClick={() => setInvitados(e)}>Invitados</Boton>}
                  <div className="ml-auto flex gap-1">
                    {new Date(e.inicio) > new Date() && e.estado === "PROGRAMADO" && (
                      <button type="button" onClick={() => setRecordar({ tipo: "evento", id: e.id, titulo: e.titulo, fecha: e.inicio })} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label="Programar recordatorio" title="Programar recordatorio"><BellPlus className="size-4" /></button>
                    )}
                    {propio && (
                      <>
                        <button type="button" onClick={() => setFormulario({ abierto: true, evento: e })} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label="Editar" title="Editar"><Pencil className="size-4" /></button>
                        <button type="button" onClick={() => setEliminar(e)} className="grid size-9 place-items-center rounded-lg text-vino hover:bg-vino-suave" aria-label="Eliminar" title="Eliminar"><Trash2 className="size-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {datos && datos.totalElementos > 0 && (
        <div className="tarjeta overflow-hidden"><Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={setSize} opciones={[6, 12, 24]} cargando={cargando} /></div>
      )}

      <EventoFormulario abierto={formulario.abierto} evento={formulario.evento} onCerrar={() => setFormulario({ abierto: false, evento: null })} onGuardado={() => { setFormulario({ abierto: false, evento: null }); recargar(); }} />
      <ParticipantesModal evento={invitados} onCerrar={() => setInvitados(null)} />
      <RecordatorioFormulario destino={recordar} onCerrar={() => setRecordar(null)} onGuardado={() => setRecordar(null)} />
      <ConfirmarModal
        abierto={Boolean(eliminar)}
        onCerrar={() => setEliminar(null)}
        onConfirmar={confirmarEliminar}
        cargando={eliminando}
        peligro
        titulo="¿Eliminar este evento?"
        textoConfirmar="Eliminar"
        mensaje={<>Se eliminará <b>"{eliminar?.titulo}"</b> junto con sus invitaciones y recordatorios. Esta acción no se puede deshacer.</>}
      />
    </div>
  );
}
