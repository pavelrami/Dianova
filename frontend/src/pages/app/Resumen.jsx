import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, Inbox, CalendarDays, ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { resumenApi, tareasApi } from "../../api/servicios";
import useConsulta from "../../hooks/useConsulta";
import { ErrorCarga, Vacio } from "../../components/ui/Estados";
import { TarjetasEsqueleto } from "../../components/ui/Cargando";
import Boton from "../../components/ui/Boton";
import { useToast } from "../../components/ui/Toast";
import { fechaCorta, hora, relativa, saludo } from "../../utils/formato";
import { TIPO_EVENTO } from "../../utils/etiquetas";
import TareaFormulario from "./tareas/TareaFormulario";

const TONO_CANELA = "#dcc6a3";
const TONO_OSCURO_SIDEBAR = "#633b1d";

/** Prototipo 03: panel principal. El contenido cambia según el rol. */
export default function Resumen() {
  const { usuario, esEstudiante, esDocente, esAdmin } = useAuth();
  const toast = useToast();
  const { datos, cargando, error, recargar, setDatos } = useConsulta(() => resumenApi.resumen(), []);
  const [nueva, setNueva] = useState(false);

  const marcar = async (t) => {
    const nuevo = t.miSeguimiento?.estado === "COMPLETADA" ? "EN_PROCESO" : "COMPLETADA";
    try {
      const act = await tareasApi.progreso(t.id, nuevo);
      setDatos((d) => ({ ...d, tareasPrioritarias: d.tareasPrioritarias.map((x) => (x.id === t.id ? act : x)) }));
      toast.exito(nuevo === "COMPLETADA" ? "¡Tarea completada!" : "Tarea reabierta");
    } catch (e) {
      toast.error(e.mensaje);
    }
  };

  const pendientesSemana = datos?.metricas?.find((m) => m.clave === "pendientes")?.valor ?? 0;
  const clasesHoy = datos?.agendaHoy?.filter((a) => a.tipo === "CLASE").length ?? 0;
  const bienvenida = saludo(usuario.nombre).toUpperCase().replaceAll(",", "");

  return (
    <div className="space-y-6 bg-crema font-sans text-[15px] text-tinta">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="titulo-pagina">{bienvenida}</h1>
          <p className="mt-1 text-sm text-tenue">
            {esEstudiante
              ? `Tienes ${clasesHoy} ${clasesHoy === 1 ? "clase" : "clases"} hoy y ${pendientesSemana} ${pendientesSemana === 1 ? "tarea pendiente" : "tareas pendientes"}`
              : esDocente
                ? "Así van tus materias y las entregas de tus estudiantes"
                : "Resumen general del sistema"}
          </p>
        </div>
        {!esAdmin && (
          <Boton icono={Plus} onClick={() => setNueva(true)}>
            Nueva tarea
          </Boton>
        )}
      </div>

      {error ? (
        <ErrorCarga error={error} onReintentar={recargar} />
      ) : cargando && !datos ? (
        <TarjetasEsqueleto n={3} />
      ) : (
        <>
          <section className={`grid gap-4 sm:grid-cols-2 ${datos.metricas.length > 3 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`} aria-label="Indicadores">
            {datos.metricas.map((m) => (
              <article key={m.clave} className="tarjeta animar-entrada rounded-sm bg-white p-5">
                <p className="text-sm font-medium text-tinta">{m.etiqueta}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-tinta">
                  {m.valor}
                  {m.clave === "progreso" && "%"}
                </p>
                {m.clave === "progreso" ? (
                  <div className="mt-3">
                    <div className="h-2 overflow-hidden rounded-sm bg-[#ece2da]" role="progressbar" aria-valuenow={m.valor} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-sm bg-caramelo transition-[width] duration-700" style={{ width: `${m.valor}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-tenue">{m.detalle}</p>
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-tenue">
                    <Inbox className="size-4" aria-hidden /> {m.detalle}
                  </p>
                )}
              </article>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
            <div className="space-y-6">
              {datos.proximaClase ? (
                <article
                  className="rounded-sm border border-[#c6ad86] p-6"
                  style={{ backgroundColor: TONO_CANELA }}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-espresso/85">Próxima clase</p>
                  <h2 className="mt-1 text-lg font-semibold text-espresso">{datos.proximaClase.materia}</h2>
                  <p className="mt-1 text-sm text-espresso/85">
                    {datos.proximaClase.aula ? `${datos.proximaClase.aula} · ` : ""}
                    {relativa(datos.proximaClase.inicio)} – {hora(datos.proximaClase.fin)}
                  </p>
                  {datos.proximaClase.docente && (
                    <span className="chip mt-3 rounded-sm bg-white/80 text-xs text-espresso">
                      <Clock className="size-3.5" aria-hidden /> {datos.proximaClase.docente}
                    </span>
                  )}
                </article>
              ) : (
                !esAdmin && (
                  <article
                    className="rounded-sm border border-[#c6ad86] p-6"
                    style={{ backgroundColor: TONO_CANELA }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-espresso/85">Próxima clase</p>
                    <p className="mt-1 text-sm text-espresso">No tienes clases en los próximos días.</p>
                  </article>
                )
              )}

              <article className="tarjeta rounded-sm bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-tinta">Agenda de hoy</h2>
                  <span className="text-xs text-tenue">Hoy · {fechaCorta(new Date())}</span>
                </div>
                {datos.agendaHoy.length === 0 ? (
                  <Vacio titulo="Día libre" mensaje="No hay clases, eventos ni entregas para hoy." icono={CalendarDays} />
                ) : (
                  <ul className="mt-4 space-y-4">
                    {datos.agendaHoy.map((a, i) => (
                      <li key={`${a.tipo}-${a.referenciaId}-${i}`} className="flex gap-3">
                        <span className="w-1 shrink-0 rounded-sm" style={{ background: a.color || TIPO_EVENTO[a.subtipo]?.barra || "#711B1A" }} aria-hidden />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-tinta">
                            {hora(a.inicio)} · {a.titulo}
                          </p>
                          <p className="truncate text-xs text-tenue">
                            {a.tipo === "CLASE" ? "Clase" : a.tipo === "ENTREGA" ? "Entrega" : TIPO_EVENTO[a.subtipo]?.texto}
                            {a.lugar ? ` · ${a.lugar}` : ""}
                            {a.detalle && a.tipo !== "EVENTO" ? ` · ${a.detalle}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>

            <div className="space-y-6">
              <article className="tarjeta rounded-sm bg-white p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-tinta">{esEstudiante ? "Tareas prioritarias" : "Próximas entregas"}</h2>
                  <Link to="/app/tareas" className="text-xs font-medium text-canela hover:text-vino">Ver todas</Link>
                </div>
                {datos.tareasPrioritarias.length === 0 ? (
                  <Vacio titulo="Todo al día" mensaje="No hay entregas pendientes." />
                ) : (
                  <ul className="mt-3 divide-y divide-linea">
                    {datos.tareasPrioritarias.map((t) => {
                      const hecha = t.miSeguimiento?.estado === "COMPLETADA";
                      return (
                        <li key={t.id} className="flex items-center gap-3 py-3">
                          {esEstudiante ? (
                            <input
                              type="checkbox"
                              checked={hecha}
                              onChange={() => marcar(t)}
                              className="size-4 shrink-0 cursor-pointer rounded-sm accent-espresso"
                              aria-label={`Marcar "${t.titulo}" como ${hecha ? "en proceso" : "completada"}`}
                            />
                          ) : (
                            <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-caramelo-suave text-xs font-semibold text-espresso">
                              {t.avance ? `${t.avance.completadas}/${t.avance.total}` : "—"}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm ${hecha ? "text-tenue line-through" : "text-tinta"}`}>{t.titulo}</p>
                            {t.materia && <p className="truncate text-xs text-tenue">{t.materia.nombre}</p>}
                          </div>
                          <span className="shrink-0 text-xs text-tenue">{relativa(t.fechaEntrega).split(" · ")[0]}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>

              <article
                className="relative overflow-hidden rounded-sm border border-[#c6ad86] p-6 text-tinta"
                style={{ backgroundColor: TONO_CANELA }}
              >
                <p className="text-base font-semibold text-espresso">Próximos eventos</p>
                {datos.proximosEventos.length === 0 ? (
                  <p className="mt-2 text-sm text-tinta/85">No hay eventos programados.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {datos.proximosEventos.slice(0, 3).map((e) => (
                      <li key={e.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-tinta">{e.titulo}</p>
                          <p className="text-xs text-tinta/80">{relativa(e.inicio)}{e.ubicacion ? ` · ${e.ubicacion}` : ""}</p>
                        </div>
                        <span className={`chip shrink-0 rounded-sm text-xs ${TIPO_EVENTO[e.tipo]?.clase}`}>{TIPO_EVENTO[e.tipo]?.texto}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/app/eventos"
                  style={{ backgroundColor: TONO_OSCURO_SIDEBAR }}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm px-4 text-sm font-semibold text-white hover:brightness-110"
                >
                  Ver eventos <ArrowRight className="size-4" aria-hidden />
                </Link>
              </article>

              {esAdmin && (
                <article className="tarjeta flex items-center justify-between gap-4 rounded-sm bg-white p-5">
                  <div>
                    <p className="text-sm font-semibold text-tinta">Gestión rápida</p>
                    <p className="text-xs text-tenue">Usuarios, materias e inscripciones</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/app/admin/usuarios" className="inline-flex h-10 items-center rounded-sm border border-linea px-3 text-sm font-medium hover:border-caramelo">Usuarios</Link>
                    <Link to="/app/materias" className="inline-flex h-10 items-center gap-1 rounded-sm border border-linea px-3 text-sm font-medium hover:border-caramelo"><BookOpen className="size-4" /> Materias</Link>
                  </div>
                </article>
              )}
            </div>
          </div>
        </>
      )}

      <TareaFormulario abierto={nueva} onCerrar={() => setNueva(false)} onGuardada={() => { setNueva(false); recargar(); }} />
    </div>
  );
}