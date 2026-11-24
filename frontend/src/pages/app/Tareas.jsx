import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Clock, Pencil, Trash2, BellPlus, Send, BarChart3, ListFilter } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { tareasApi, materiasApi } from "../../api/servicios";
import useConsulta, { useRetraso } from "../../hooks/useConsulta";
import Boton from "../../components/ui/Boton";
import Pestanas from "../../components/ui/Pestanas";
import Paginacion from "../../components/ui/Paginacion";
import { ConfirmarModal } from "../../components/ui/Modal";
import { FilasEsqueleto } from "../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../components/ui/Estados";
import { useToast } from "../../components/ui/Toast";
import { ESTADO_SEGUIMIENTO, Insignia, PRIORIDAD, PUBLICACION } from "../../utils/etiquetas";
import { relativa, vencida } from "../../utils/formato";
import TareaFormulario from "./tareas/TareaFormulario";
import AvanceModal from "./tareas/AvanceModal";
import RecordatorioFormulario from "./recordatorios/RecordatorioFormulario";

const RANGOS = {
  "": () => ({}),
  semana: () => {
    const hoy = new Date();
    const ini = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return { desde: iso(ini), hasta: iso(new Date(ini.getTime() + 7 * 86400000)) };
  },
  proximos: () => ({ desde: iso(new Date()), hasta: iso(new Date(Date.now() + 7 * 86400000)) }),
  vencidas: () => ({ hasta: iso(new Date()) }),
};
function iso(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

/** Prototipo 04 · "Mis Tareas". Filtros y paginación se resuelven en el servidor. */
export default function Tareas() {
  const { esEstudiante, esDocente } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [pestana, setPestana] = useState("todas");
  const [materiaId, setMateriaId] = useState(params.get("materiaId") || "");
  const [prioridad, setPrioridad] = useState("");
  const [rango, setRango] = useState("");
  const [orden, setOrden] = useState("entrega");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [materias, setMaterias] = useState([]);
  const [formulario, setFormulario] = useState({ abierto: false, tarea: null });
  const [avance, setAvance] = useState(null);
  const [recordar, setRecordar] = useState(null);
  const [confirmar, setConfirmar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const qr = useRetraso(q);

  useEffect(() => setQ(params.get("q") || ""), [params]);
  useEffect(() => setPage(0), [qr, pestana, materiaId, prioridad, rango, orden, size]);
  useEffect(() => {
    materiasApi.listar({ size: 50 }).then((p) => setMaterias(p.contenido)).catch(() => {});
  }, []);

  const filtrosPestana = esEstudiante
    ? { todas: {}, pendientes: { pendientes: true }, completadas: { estado: "COMPLETADA" }, urgentes: { pendientes: true, prioridad: "ALTA" } }[pestana]
    : { todas: {}, publicadas: { publicacion: "PUBLICADA" }, borradores: { publicacion: "BORRADOR" } }[pestana];

  const consulta = {
    q: qr, materiaId, prioridad, ...RANGOS[rango](), ...filtrosPestana,
    orden: orden.split(":")[0], dir: orden.split(":")[1] || (orden === "creado" ? "desc" : "asc"), page, size,
  };
  const { datos, cargando, error, recargar, setDatos } = useConsulta((signal) => tareasApi.listar(consulta, signal), [JSON.stringify(consulta)]);

  const cambiarEstado = async (t, estado) => {
    try {
      const act = await tareasApi.progreso(t.id, estado);
      setDatos((d) => ({ ...d, contenido: d.contenido.map((x) => (x.id === t.id ? act : x)) }));
      toast.exito(estado === "COMPLETADA" ? "¡Tarea completada!" : "Avance actualizado");
    } catch (e) {
      toast.error(e.mensaje);
    }
  };

  const ejecutarConfirmacion = async () => {
    setProcesando(true);
    try {
      if (confirmar.accion === "eliminar") {
        await tareasApi.eliminar(confirmar.tarea.id);
        toast.exito("Tarea eliminada");
      } else {
        await tareasApi.publicar(confirmar.tarea.id);
        toast.exito("Tarea publicada: avisamos a los estudiantes inscritos");
      }
      setConfirmar(null);
      recargar();
    } catch (e) {
      toast.error(e.mensaje);
    } finally {
      setProcesando(false);
    }
  };

  const titulo = esEstudiante ? "Mis Tareas" : esDocente ? "Tareas publicadas" : "Tareas";
  const pestanas = esEstudiante
    ? [
        { valor: "todas", etiqueta: "Todas" },
        { valor: "pendientes", etiqueta: "Pendientes" },
        { valor: "completadas", etiqueta: "Completadas" },
        { valor: "urgentes", etiqueta: "Urgentes" },
      ]
    : [
        { valor: "todas", etiqueta: "Todas" },
        { valor: "publicadas", etiqueta: "Publicadas" },
        { valor: "borradores", etiqueta: "Borradores" },
      ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="migas">Tareas / Semestre actual</p>
          <h1 className="titulo-pagina mt-1">{titulo}</h1>
          <p className="mt-1 text-tenue">{datos ? `${datos.totalElementos} ${datos.totalElementos === 1 ? "tarea" : "tareas"} con estos filtros` : " "}</p>
        </div>
        <Boton icono={Plus} onClick={() => setFormulario({ abierto: true, tarea: null })}>
          Nueva tarea
        </Boton>
      </div>

      <Pestanas opciones={pestanas} valor={pestana} onCambio={setPestana} etiqueta="Filtrar tareas" className="w-fit" />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(4,minmax(0,180px))_1fr]">
        <Selector etiqueta="Materia" valor={materiaId} onCambio={setMateriaId}>
          <option value="">Materia: Todas</option>
          {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </Selector>
        <Selector etiqueta="Prioridad" valor={prioridad} onCambio={setPrioridad}>
          <option value="">Prioridad: Todas</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </Selector>
        <Selector etiqueta="Fecha" valor={rango} onCambio={setRango}>
          <option value="">Fecha: Todas</option>
          <option value="semana">Esta semana</option>
          <option value="proximos">Próximos 7 días</option>
          <option value="vencidas">Vencidas</option>
        </Selector>
        <Selector etiqueta="Ordenar" valor={orden} onCambio={setOrden}>
          <option value="entrega">Entrega más próxima</option>
          <option value="entrega:desc">Entrega más lejana</option>
          <option value="creado">Más recientes</option>
          <option value="titulo">Título (A-Z)</option>
        </Selector>
        <label className="relative col-span-2 lg:col-span-1">
          <span className="sr-only">Buscar tareas</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título o descripción…" className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
        </label>
      </div>

      <section className="tarjeta overflow-hidden">
        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={6} columnas={5} />
        ) : datos.contenido.length === 0 ? (
          <Vacio
            titulo="No hay tareas con estos filtros"
            mensaje="Cambia los filtros o crea una tarea nueva."
            icono={ListFilter}
            accion={<Boton variante="suave" tamano="sm" icono={Plus} onClick={() => setFormulario({ abierto: true, tarea: null })}>Nueva tarea</Boton>}
          />
        ) : (
          <div className={`transition-opacity ${cargando ? "opacity-60" : ""}`} aria-busy={cargando}>
            {/* Escritorio: tabla */}
            <table className="hidden w-full text-left md:table">
              <thead className="border-b border-linea bg-crema-2 text-sm text-tinta">
                <tr>
                  <th className="px-5 py-3 font-semibold">Título de la tarea</th>
                  <th className="px-3 py-3 font-semibold">Materia</th>
                  <th className="px-3 py-3 font-semibold">Fecha de entrega</th>
                  <th className="px-3 py-3 font-semibold">Prioridad</th>
                  <th className="px-3 py-3 font-semibold">{esEstudiante ? "Estado" : "Avance"}</th>
                  <th className="px-3 py-3 font-semibold"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {datos.contenido.map((t) => (
                  <FilaTarea key={t.id} t={t} esEstudiante={esEstudiante} onEstado={cambiarEstado}
                    onEditar={() => setFormulario({ abierto: true, tarea: t })}
                    onEliminar={() => setConfirmar({ accion: "eliminar", tarea: t })}
                    onPublicar={() => setConfirmar({ accion: "publicar", tarea: t })}
                    onAvance={() => setAvance(t)}
                    onRecordar={() => setRecordar({ tipo: "tarea", id: t.id, titulo: t.titulo, fecha: t.fechaEntrega })} />
                ))}
              </tbody>
            </table>
            {/* Celular: tarjetas */}
            <ul className="divide-y divide-linea md:hidden">
              {datos.contenido.map((t) => (
                <TarjetaTarea key={t.id} t={t} esEstudiante={esEstudiante} onEstado={cambiarEstado}
                  onEditar={() => setFormulario({ abierto: true, tarea: t })}
                  onEliminar={() => setConfirmar({ accion: "eliminar", tarea: t })}
                  onPublicar={() => setConfirmar({ accion: "publicar", tarea: t })}
                  onAvance={() => setAvance(t)}
                  onRecordar={() => setRecordar({ tipo: "tarea", id: t.id, titulo: t.titulo, fecha: t.fechaEntrega })} />
              ))}
            </ul>
          </div>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={setSize} cargando={cargando} />
      </section>

      <TareaFormulario abierto={formulario.abierto} tarea={formulario.tarea} onCerrar={() => setFormulario({ abierto: false, tarea: null })} onGuardada={() => { setFormulario({ abierto: false, tarea: null }); recargar(); }} />
      <AvanceModal tarea={avance} onCerrar={() => setAvance(null)} />
      <RecordatorioFormulario destino={recordar} onCerrar={() => setRecordar(null)} onGuardado={() => setRecordar(null)} />
      <ConfirmarModal
        abierto={Boolean(confirmar)}
        onCerrar={() => setConfirmar(null)}
        onConfirmar={ejecutarConfirmacion}
        cargando={procesando}
        peligro={confirmar?.accion === "eliminar"}
        titulo={confirmar?.accion === "eliminar" ? "¿Eliminar esta tarea?" : "¿Publicar esta tarea?"}
        textoConfirmar={confirmar?.accion === "eliminar" ? "Eliminar" : "Publicar"}
        mensaje={
          confirmar?.accion === "eliminar" ? (
            <>Se eliminará <b>"{confirmar?.tarea.titulo}"</b> con el avance de todos los estudiantes y sus recordatorios. Esta acción no se puede deshacer.</>
          ) : (
            <>Todos los estudiantes inscritos en <b>{confirmar?.tarea.materia?.nombre}</b> verán la tarea y recibirán un aviso por los canales que tengan activos (correo, SMS o WhatsApp).</>
          )
        }
      />
    </div>
  );
}

function Selector({ etiqueta, valor, onCambio, children }) {
  return (
    <label>
      <span className="sr-only">{etiqueta}</span>
      <select value={valor} onChange={(e) => onCambio(e.target.value)} className="h-11 w-full rounded-xl border border-linea bg-white px-3 text-sm text-tinta outline-none focus:border-caramelo">
        {children}
      </select>
    </label>
  );
}

function MateriaChip({ m }) {
  if (!m) return <span className="text-sm text-tenue">Personal</span>;
  return (
    <span className="chip max-w-[180px] truncate" style={{ background: `${m.color}2e`, color: "#3B2414" }}>
      <span className="size-2 shrink-0 rounded-full" style={{ background: m.color }} aria-hidden />
      <span className="truncate">{m.nombre}</span>
    </span>
  );
}

function Entrega({ t }) {
  const hecha = t.miSeguimiento?.estado === "COMPLETADA";
  const tarde = vencida(t.fechaEntrega) && !hecha;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${tarde ? "font-medium text-vino" : "text-tinta"}`}>
      {tarde && <Clock className="size-4" aria-hidden />}
      {relativa(t.fechaEntrega)}
    </span>
  );
}

function SelectorEstado({ t, onEstado }) {
  const actual = t.miSeguimiento?.estado;
  return (
    <label>
      <span className="sr-only">Estado de "{t.titulo}"</span>
      <select
        value={actual}
        onChange={(e) => onEstado(t, e.target.value)}
        className={`h-8 rounded-full border-0 px-3 text-xs font-semibold outline-none ${ESTADO_SEGUIMIENTO[actual]?.clase}`}
      >
        {actual !== "COMPLETADA" && <option value="PENDIENTE">Por empezar</option>}
        <option value="EN_PROCESO">En progreso</option>
        <option value="COMPLETADA">Completado</option>
      </select>
    </label>
  );
}

function Avance({ a }) {
  if (!a) return null;
  const pct = a.total ? Math.round((a.completadas * 100) / a.total) : 0;
  return (
    <div className="w-32">
      <div className="flex justify-between text-xs text-tenue"><span>{a.completadas}/{a.total}</span><span>{pct}%</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#ece2da]"><div className="h-full rounded-full bg-caramelo" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Acciones({ t, esEstudiante, onEditar, onEliminar, onPublicar, onAvance, onRecordar }) {
  const personal = t.origen === "PERSONAL";
  const puedeGestionar = !esEstudiante || personal;
  return (
    <div className="flex items-center justify-end gap-1">
      {!esEstudiante && t.estadoPublicacion === "BORRADOR" && <IconoBoton etiqueta="Publicar" icono={Send} onClick={onPublicar} />}
      {!esEstudiante && t.origen === "DOCENTE" && t.estadoPublicacion === "PUBLICADA" && <IconoBoton etiqueta="Ver avance" icono={BarChart3} onClick={onAvance} />}
      {esEstudiante && t.miSeguimiento?.estado !== "COMPLETADA" && !vencida(t.fechaEntrega) && <IconoBoton etiqueta="Programar recordatorio" icono={BellPlus} onClick={onRecordar} />}
      {puedeGestionar && <IconoBoton etiqueta="Editar" icono={Pencil} onClick={onEditar} />}
      {puedeGestionar && <IconoBoton etiqueta="Eliminar" icono={Trash2} onClick={onEliminar} peligro />}
    </div>
  );
}

function IconoBoton({ etiqueta, icono: Icono, onClick, peligro }) {
  return (
    <button type="button" onClick={onClick} title={etiqueta} aria-label={etiqueta} className={`grid size-9 place-items-center rounded-lg transition-colors ${peligro ? "text-vino hover:bg-vino-suave" : "text-tenue hover:bg-caramelo-suave hover:text-tinta"}`}>
      <Icono className="size-4" />
    </button>
  );
}

function FilaTarea({ t, esEstudiante, onEstado, ...acciones }) {
  const hecha = t.miSeguimiento?.estado === "COMPLETADA";
  return (
    <tr className="align-middle hover:bg-crema-2/60">
      <td className="max-w-[340px] px-5 py-3.5">
        <div className="flex items-start gap-3">
          {esEstudiante && (
            <input type="checkbox" checked={hecha} onChange={() => onEstado(t, hecha ? "EN_PROCESO" : "COMPLETADA")} className="mt-1 size-[18px] shrink-0 cursor-pointer accent-espresso" aria-label={`Marcar "${t.titulo}" como ${hecha ? "en proceso" : "completada"}`} />
          )}
          <div className="min-w-0">
            <p className={`font-medium ${hecha ? "text-tenue line-through" : "text-tinta"}`}>{t.titulo}</p>
            {t.descripcion && <p className="line-clamp-1 text-sm text-tenue">{t.descripcion}</p>}
          </div>
        </div>
      </td>
      <td className="px-3 py-3.5"><MateriaChip m={t.materia} /></td>
      <td className="px-3 py-3.5"><Entrega t={t} /></td>
      <td className="px-3 py-3.5"><Insignia mapa={PRIORIDAD} valor={t.prioridad} /></td>
      <td className="px-3 py-3.5">
        {esEstudiante ? <SelectorEstado t={t} onEstado={onEstado} /> : t.origen === "PERSONAL" ? <span className="text-sm text-tenue">Personal</span> : t.estadoPublicacion === "BORRADOR" ? <Insignia mapa={PUBLICACION} valor="BORRADOR" /> : <Avance a={t.avance} />}
      </td>
      <td className="px-3 py-3.5"><Acciones t={t} esEstudiante={esEstudiante} {...acciones} /></td>
    </tr>
  );
}

function TarjetaTarea({ t, esEstudiante, onEstado, ...acciones }) {
  const hecha = t.miSeguimiento?.estado === "COMPLETADA";
  return (
    <li className="space-y-2.5 px-4 py-4">
      <div className="flex items-start gap-3">
        {esEstudiante && (
          <input type="checkbox" checked={hecha} onChange={() => onEstado(t, hecha ? "EN_PROCESO" : "COMPLETADA")} className="mt-1 size-5 shrink-0 accent-espresso" aria-label={`Marcar "${t.titulo}"`} />
        )}
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${hecha ? "text-tenue line-through" : "text-tinta"}`}>{t.titulo}</p>
          <div className="mt-1"><Entrega t={t} /></div>
        </div>
        <Insignia mapa={PRIORIDAD} valor={t.prioridad} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <MateriaChip m={t.materia} />
        {esEstudiante ? <SelectorEstado t={t} onEstado={onEstado} /> : t.estadoPublicacion === "BORRADOR" ? <Insignia mapa={PUBLICACION} valor="BORRADOR" /> : <Avance a={t.avance} />}
      </div>
      <Acciones t={t} esEstudiante={esEstudiante} {...acciones} />
    </li>
  );
}
