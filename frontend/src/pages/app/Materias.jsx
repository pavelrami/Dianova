import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, UserRound, CalendarDays, Pencil, Trash2, Clock4, Users, BookOpen } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { materiasApi, periodosApi } from "../../api/servicios";
import useConsulta, { useRetraso } from "../../hooks/useConsulta";
import Boton from "../../components/ui/Boton";
import Paginacion from "../../components/ui/Paginacion";
import { ConfirmarModal } from "../../components/ui/Modal";
import { TarjetasEsqueleto } from "../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../components/ui/Estados";
import { useToast } from "../../components/ui/Toast";
import { DIAS_CORTOS } from "../../utils/formato";
import MateriaFormulario from "./materias/MateriaFormulario";
import HorariosModal from "./materias/HorariosModal";
import InscritosModal from "./materias/InscritosModal";

/** Prototipo 08 · Mis materias (estudiante/docente) y gestión de materias (administrador). */
export default function Materias() {
  const { esAdmin, esEstudiante, esDocente } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [periodoId, setPeriodoId] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [formulario, setFormulario] = useState({ abierto: false, materia: null });
  const [horarios, setHorarios] = useState(null);
  const [inscritos, setInscritos] = useState(null);
  const [eliminar, setEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const qr = useRetraso(q);
  const { datos: periodos } = useConsulta(() => periodosApi.listar({ size: 20 }), []);

  useEffect(() => setPage(0), [qr, periodoId, size]);
  const { datos, cargando, error, recargar } = useConsulta((s) => materiasApi.listar({ q: qr, periodoId, page, size }, s), [qr, periodoId, page, size]);

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await materiasApi.eliminar(eliminar.id);
      toast.exito("Materia eliminada");
      setEliminar(null);
      recargar();
    } catch (e) {
      toast.error(e.mensaje);
    } finally {
      setEliminando(false);
    }
  };

  const creditos = datos?.contenido.reduce((s, m) => s + m.creditos, 0) ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="migas">Materias / {periodos?.contenido.find((p) => p.activo)?.nombre ?? "Semestre"}</p>
          <h1 className="titulo-pagina mt-1">{esAdmin ? "Materias" : "Mis Materias"}</h1>
          <p className="mt-1 text-tenue">
            {datos ? `${datos.totalElementos} ${datos.totalElementos === 1 ? "materia" : "materias"}${esEstudiante ? ` · ${creditos} créditos en esta página` : ""}` : " "}
          </p>
        </div>
        {esAdmin && <Boton icono={Plus} onClick={() => setFormulario({ abierto: true, materia: null })}>Agregar materia</Boton>}
      </div>

      <div className="grid gap-2 sm:grid-cols-[220px_1fr]">
        <select value={periodoId} onChange={(e) => setPeriodoId(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Periodo">
          <option value="">Periodo: Todos</option>
          {periodos?.contenido.map((p) => <option key={p.id} value={p.id}>{p.nombre}{p.activo ? " (actual)" : ""}</option>)}
        </select>
        <label className="relative">
          <span className="sr-only">Buscar materia</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o código…" className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
        </label>
      </div>

      {error ? (
        <ErrorCarga error={error} onReintentar={recargar} />
      ) : cargando && !datos ? (
        <TarjetasEsqueleto n={6} />
      ) : datos.contenido.length === 0 ? (
        <div className="tarjeta"><Vacio titulo="Sin materias" mensaje={esEstudiante ? "Aún no estás inscrito en materias. El administrador gestiona las inscripciones." : "No hay materias con ese filtro."} icono={BookOpen} /></div>
      ) : (
        <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${cargando ? "opacity-60" : ""}`}>
          {datos.contenido.map((m) => (
            <article key={m.id} className="tarjeta animar-entrada flex flex-col">
              <div className="flex items-start gap-3 p-5 pb-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: m.color }} aria-hidden>
                  <BookOpen className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-bold leading-snug text-tinta">{m.nombre}</h2>
                  <p className="text-sm text-tenue">{m.codigoGrupo} · {m.creditos} créditos · {m.periodo.nombre}</p>
                </div>
              </div>
              <div className="flex-1 space-y-1.5 px-5 text-sm text-tinta">
                <p className="flex items-center gap-2"><UserRound className="size-4 text-tenue" aria-hidden />{m.docente?.nombreCompleto ?? "Sin docente asignado"}{m.aula ? ` · ${m.aula}` : ""}</p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-tenue" aria-hidden />
                  {m.horarios.length ? m.horarios.map((h) => `${DIAS_CORTOS[h.diaSemana]} ${h.horaInicio.slice(0, 5)}-${h.horaFin.slice(0, 5)}`).join(" · ") : "Horario por definir"}
                </p>
                {!esEstudiante && <p className="flex items-center gap-2"><Users className="size-4 text-tenue" aria-hidden />{m.totalInscritos} {m.totalInscritos === 1 ? "inscrito" : "inscritos"}</p>}
                {esEstudiante && (
                  <div className="pt-2">
                    <div className="flex justify-between text-sm font-medium"><span>Avance del curso</span><span>{m.avance}%</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#ece2da]" role="progressbar" aria-valuenow={m.avance} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance en ${m.nombre}`}>
                      <div className="h-full rounded-full" style={{ width: `${m.avance}%`, background: m.color }} />
                    </div>
                    <span className={`chip mt-3 ${m.tareasPendientes ? "bg-vino text-white" : "bg-salvia text-salvia-tinta"}`}>
                      {m.tareasPendientes ? `${m.tareasPendientes} ${m.tareasPendientes === 1 ? "tarea pendiente" : "tareas pendientes"}` : "Sin entregas pendientes"}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-1 border-t border-linea px-3 py-2">
                {esEstudiante && <Link to={`/app/tareas?materiaId=${m.id}`} className="flex-1 rounded-lg py-2 text-center text-sm font-semibold text-tinta hover:bg-crema-2">Ver tareas</Link>}
                {esDocente && <button type="button" onClick={() => setInscritos(m)} className="flex-1 rounded-lg py-2 text-sm font-semibold text-tinta hover:bg-crema-2">Ver inscritos</button>}
                {esAdmin && (
                  <>
                    <button type="button" onClick={() => setInscritos(m)} className="flex-1 rounded-lg py-2 text-sm font-semibold text-tinta hover:bg-crema-2">Inscripciones</button>
                    <button type="button" onClick={() => setHorarios(m)} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label="Horario" title="Horario"><Clock4 className="size-4" /></button>
                    <button type="button" onClick={() => setFormulario({ abierto: true, materia: m })} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label="Editar" title="Editar"><Pencil className="size-4" /></button>
                    <button type="button" onClick={() => setEliminar(m)} className="grid size-9 place-items-center rounded-lg text-vino hover:bg-vino-suave" aria-label="Eliminar" title="Eliminar"><Trash2 className="size-4" /></button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {datos && datos.totalElementos > 0 && (
        <div className="tarjeta overflow-hidden"><Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={setSize} opciones={[6, 12, 24]} cargando={cargando} /></div>
      )}

      <MateriaFormulario abierto={formulario.abierto} materia={formulario.materia} onCerrar={() => setFormulario({ abierto: false, materia: null })} onGuardada={() => { setFormulario({ abierto: false, materia: null }); recargar(); }} />
      <HorariosModal materia={horarios} onCerrar={() => setHorarios(null)} onCambio={recargar} />
      <InscritosModal materia={inscritos} admin={esAdmin} onCerrar={() => setInscritos(null)} onCambio={recargar} />
      <ConfirmarModal
        abierto={Boolean(eliminar)}
        onCerrar={() => setEliminar(null)}
        onConfirmar={confirmarEliminar}
        cargando={eliminando}
        peligro
        titulo="¿Eliminar materia?"
        textoConfirmar="Eliminar materia"
        mensaje={<>Se eliminará <b>{eliminar?.nombre}</b> con sus horarios, inscripciones, tareas, eventos y recordatorios. Esta acción no se puede deshacer.</>}
      />
    </div>
  );
}
