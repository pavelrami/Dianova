import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { resumenApi, materiasApi } from "../../api/servicios";
import useConsulta from "../../hooks/useConsulta";
import Boton from "../../components/ui/Boton";
import Pestanas from "../../components/ui/Pestanas";
import { Spinner } from "../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../components/ui/Estados";
import { aInputFecha, capitalizar, hora, horaCorta, relativa } from "../../utils/formato";
import { TIPO_EVENTO } from "../../utils/etiquetas";
import EventoFormulario from "./eventos/EventoFormulario";

const TONO_CANELA = "#dcc6a3";
const TONO_OSCURO_SIDEBAR = "#633b1d";

const HORA_INI = 7;
const HORA_FIN = 21;
const ALTO_HORA = 52;
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const lunesDe = (d) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
const sumarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mismoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function carriles(lista) {
  const orden = [...lista].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
  const finDe = (i) => Math.max(new Date(i.fin), new Date(i.inicio).getTime() + 45 * 60000);
  const out = [];
  let grupo = [];
  let finGrupo = 0;
  const cerrar = () => {
    const finCarril = [];
    const asign = grupo.map((i) => {
      let c = finCarril.findIndex((f) => f <= new Date(i.inicio).getTime());
      if (c === -1) {
        c = finCarril.length;
        finCarril.push(0);
      }
      finCarril[c] = finDe(i);
      return { item: i, carril: c };
    });
    asign.forEach((a) => out.push({ ...a, total: finCarril.length }));
    grupo = [];
  };
  for (const i of orden) {
    if (grupo.length && new Date(i.inicio).getTime() >= finGrupo) cerrar();
    grupo.push(i);
    finGrupo = Math.max(finGrupo, finDe(i));
  }
  if (grupo.length) cerrar();
  return out;
}

function colorDe(item) {
  if (item.tipo === "ENTREGA") return { fondo: TONO_OSCURO_SIDEBAR, texto: "#faf6ee" };
  if (item.tipo === "CLASE") return { fondo: TONO_CANELA, texto: "#1f1916" };
  if (item.subtipo === "EXAMEN") return { fondo: "#7a4924", texto: "#faf6ee" };
  if (["ESTUDIO", "ASESORIA"].includes(item.subtipo)) return { fondo: "#cad8c5", texto: "#1f1916" };
  return { fondo: "#efe3ce", texto: "#1f1916" };
}

/** Prototipo 05 · Calendario académico: clases (horarios), eventos y entregas en un mismo lugar. */
export default function Calendario() {
  const { esAdmin } = useAuth();
  const movil = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const [vista, setVista] = useState(movil ? "agenda" : "semana");
  const [ancla, setAncla] = useState(() => new Date());
  const [materiaId, setMateriaId] = useState("");
  const [tipo, setTipo] = useState("");
  const [nuevoEvento, setNuevoEvento] = useState(false);
  const { datos: materias } = useConsulta(() => materiasApi.listar({ size: 50 }), []);

  const rango = useMemo(() => {
    if (vista === "mes") {
      const primero = new Date(ancla.getFullYear(), ancla.getMonth(), 1);
      const ini = lunesDe(primero);
      return { ini, fin: sumarDias(ini, 42) };
    }
    const ini = lunesDe(ancla);
    return { ini, fin: sumarDias(ini, vista === "agenda" ? 14 : 7) };
  }, [vista, ancla]);

  const { datos, cargando, error, recargar } = useConsulta(
    (signal) => resumenApi.calendario({ desde: aInputFecha(rango.ini), hasta: aInputFecha(rango.fin), materiaId }, signal),
    [rango.ini.getTime(), rango.fin.getTime(), materiaId]
  );
  const items = (datos || []).filter((i) => !tipo || i.tipo === tipo);

  const mover = (dir) => {
    if (vista === "mes") setAncla(new Date(ancla.getFullYear(), ancla.getMonth() + dir, 1));
    else setAncla(sumarDias(ancla, dir * (vista === "agenda" ? 14 : 7)));
  };

  const etiquetaRango = capitalizar(
    vista === "mes"
      ? ancla.toLocaleDateString("es-MX", { month: "long", year: "numeric" })
      : `${rango.ini.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} – ${sumarDias(rango.fin, -1).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`
  );

  return (
    <div className="space-y-4 bg-crema font-sans text-[15px] text-tinta">
      {/* Fila 1: Título y botón */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="titulo-pagina leading-tight">Calendario Académico</h1>
          <p className="mt-1 text-sm text-tenue">{etiquetaRango}</p>
        </div>
        {!esAdmin && (
          <Boton icono={Plus} onClick={() => setNuevoEvento(true)}>
            Nuevo evento
          </Boton>
        )}
      </div>

      {/* Fila 2: Navegación, filtros y vista */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => mover(-1)}
            className="grid size-10 place-items-center rounded-sm border border-linea bg-white hover:border-caramelo"
            aria-label="Anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setAncla(new Date())}
            className="h-10 rounded-sm border border-linea bg-white px-4 text-sm font-medium hover:border-caramelo"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            className="grid size-10 place-items-center rounded-sm border border-linea bg-white hover:border-caramelo"
            aria-label="Siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
          <span className="ml-2 hidden text-base font-semibold text-tinta sm:inline">{etiquetaRango}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={materiaId}
            onChange={(e) => setMateriaId(e.target.value)}
            className="h-10 rounded-sm border border-linea bg-white px-3 text-sm outline-none focus:border-caramelo"
            aria-label="Filtrar por materia"
          >
            <option value="">Materia: Todas</option>
            {materias?.contenido.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="h-10 rounded-sm border border-linea bg-white px-3 text-sm outline-none focus:border-caramelo"
            aria-label="Filtrar por tipo"
          >
            <option value="">Tipo: Todos</option>
            <option value="CLASE">Clases</option>
            <option value="ENTREGA">Tareas / Entregas</option>
            <option value="EVENTO">Eventos</option>
          </select>
          <Pestanas
            valor={vista}
            onCambio={setVista}
            etiqueta="Vista"
            className="rounded-sm"
            opciones={[
              { valor: "semana", etiqueta: "Semana" },
              { valor: "mes", etiqueta: "Mes" },
              { valor: "agenda", etiqueta: "Agenda" },
            ]}
          />
        </div>
      </div>

      {/* Fila compacta: Leyenda */}
      <Leyenda />

      {/* Fila 3: Contenido principal según vista */}
      {error ? (
        <ErrorCarga error={error} onReintentar={recargar} />
      ) : cargando && !datos ? (
        <div className="tarjeta rounded-sm bg-white">
          <Spinner texto="Cargando calendario…" />
        </div>
      ) : vista === "semana" ? (
        <VistaSemana ini={rango.ini} items={items} cargando={cargando} />
      ) : vista === "mes" ? (
        <VistaMes ini={rango.ini} mes={ancla.getMonth()} items={items} cargando={cargando} />
      ) : (
        <VistaAgenda items={items} cargando={cargando} />
      )}

      <EventoFormulario
        abierto={nuevoEvento}
        onCerrar={() => setNuevoEvento(false)}
        onGuardado={() => {
          setNuevoEvento(false);
          recargar();
        }}
      />
    </div>
  );
}

function Leyenda() {
  const l = [
    ["Clases", TONO_CANELA],
    ["Tareas / Entregas", TONO_OSCURO_SIDEBAR],
    ["Exámenes", "#7a4924"],
    ["Estudio / Asesoría", "#cad8c5"],
    ["Otros eventos", "#efe3ce"],
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tenue" aria-label="Leyenda de colores">
      {l.map(([t, c]) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm border border-black/10" style={{ backgroundColor: c }} aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}

function VistaSemana({ ini, items, cargando }) {
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(ini, i));
  const hoy = new Date();
  const horas = Array.from({ length: HORA_FIN - HORA_INI }, (_, i) => HORA_INI + i);
  const ahoraTop = (hoy.getHours() + hoy.getMinutes() / 60 - HORA_INI) * ALTO_HORA;

  return (
    <div className={`tarjeta overflow-x-auto rounded-sm bg-white ${cargando ? "opacity-60" : ""}`} data-lenis-prevent>
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-linea">
          <div />
          {dias.map((d) => {
            const esHoy = mismoDia(d, hoy);
            return (
              <div
                key={d.toISOString()}
                className="border-l border-linea py-3 text-center"
                style={esHoy ? { backgroundColor: TONO_CANELA } : undefined}
              >
                <p className="text-xs text-tenue">{DIAS[(d.getDay() + 6) % 7]}</p>
                <p
                  className="text-lg font-bold"
                  style={{ color: esHoy ? TONO_OSCURO_SIDEBAR : undefined }}
                >
                  {d.getDate()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="relative grid grid-cols-[64px_repeat(7,1fr)]" style={{ height: horas.length * ALTO_HORA }}>
          <div>
            {horas.map((h) => (
              <div key={h} className="pr-2 text-right text-xs text-tenue" style={{ height: ALTO_HORA }}>
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
          {dias.map((d) => {
            const delDia = carriles(items.filter((i) => mismoDia(new Date(i.inicio), d)));
            return (
              <div
                key={d.toISOString()}
                className="relative border-l border-linea"
                style={{
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${ALTO_HORA - 1}px, #f6f3f0 ${ALTO_HORA - 1}px, #f6f3f0 ${ALTO_HORA}px)`,
                }}
              >
                {delDia.map(({ item: i, carril, total }, k) => {
                  const a = new Date(i.inicio);
                  const b = new Date(i.fin);
                  const top = Math.max(0, (a.getHours() + a.getMinutes() / 60 - HORA_INI) * ALTO_HORA);
                  const alto = Math.max(i.tipo === "ENTREGA" ? 40 : 34, ((b - a) / 3600000) * ALTO_HORA - 4);
                  const c = colorDe(i);
                  return (
                    <div
                      key={`${i.tipo}-${i.referenciaId}-${k}`}
                      className="absolute overflow-hidden rounded-sm px-1.5 py-1 text-[11px] leading-tight ring-1 ring-black/10"
                      style={{
                        top,
                        height: alto,
                        backgroundColor: c.fondo,
                        color: c.texto,
                        left: `calc(${(carril / total) * 100}% + 3px)`,
                        width: `calc(${100 / total}% - 6px)`,
                      }}
                      title={`${i.titulo} · ${hora(i.inicio)}${i.lugar ? ` · ${i.lugar}` : ""}`}
                    >
                      <p className="opacity-80">
                        {i.tipo === "ENTREGA" ? `Entrega ${horaCorta(i.inicio)}` : `${horaCorta(i.inicio)} - ${horaCorta(i.fin)}`}
                      </p>
                      <p className="font-semibold">
                        {i.tipo === "ENTREGA" && <AlertTriangle className="mr-0.5 inline size-3" aria-hidden />}
                        {i.subtipo === "EXAMEN" && <FileText className="mr-0.5 inline size-3" aria-hidden />}
                        {i.titulo}
                      </p>
                      {i.lugar && <p className="truncate opacity-80">{i.lugar}</p>}
                    </div>
                  );
                })}
                {mismoDia(d, hoy) && ahoraTop > 0 && ahoraTop < horas.length * ALTO_HORA && (
                  <div className="absolute left-0 right-0 z-10 border-t-2" style={{ top: ahoraTop, borderColor: TONO_OSCURO_SIDEBAR }} aria-label="Hora actual">
                    <span className="absolute -left-1.5 -top-[5px] size-2 rounded-sm" style={{ backgroundColor: TONO_OSCURO_SIDEBAR }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VistaMes({ ini, mes, items, cargando }) {
  const dias = Array.from({ length: 42 }, (_, i) => sumarDias(ini, i));
  const hoy = new Date();
  return (
    <div className={`tarjeta overflow-hidden rounded-sm bg-white ${cargando ? "opacity-60" : ""}`}>
      <div className="grid grid-cols-7 border-b border-linea text-center text-xs font-semibold text-tinta" style={{ backgroundColor: TONO_CANELA }}>
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((d) => {
          const delDia = items.filter((i) => mismoDia(new Date(i.inicio), d));
          const esHoy = mismoDia(d, hoy);
          return (
            <div
              key={d.toISOString()}
              className={`min-h-20 border-b border-r border-linea p-1 sm:min-h-28 sm:p-1.5 ${d.getMonth() !== mes ? "bg-crema/70" : ""}`}
            >
              <p
                className={`mb-1 grid size-6 place-items-center rounded-sm text-xs font-semibold ${
                  esHoy ? "text-[#faf6ee]" : d.getMonth() !== mes ? "text-tenue/60" : "text-tinta"
                }`}
                style={esHoy ? { backgroundColor: TONO_OSCURO_SIDEBAR } : undefined}
              >
                {d.getDate()}
              </p>
              <ul className="space-y-0.5">
                {delDia.slice(0, 3).map((i, k) => {
                  const c = colorDe(i);
                  return (
                    <li
                      key={k}
                      className="truncate rounded-sm px-1 text-[10px] leading-4 sm:text-[11px]"
                      style={{ backgroundColor: c.fondo, color: c.texto }}
                      title={i.titulo}
                    >
                      <span className="hidden sm:inline">{horaCorta(i.inicio)} </span>
                      {i.titulo}
                    </li>
                  );
                })}
                {delDia.length > 3 && <li className="px-1 text-[10px] text-tenue">+{delDia.length - 3} más</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VistaAgenda({ items, cargando }) {
  if (items.length === 0) {
    return (
      <div className="tarjeta rounded-sm bg-white">
        <Vacio titulo="Sin actividades" mensaje="No hay clases, eventos ni entregas en este periodo." />
      </div>
    );
  }
  const grupos = items.reduce((acc, i) => {
    const k = new Date(i.inicio).toDateString();
    (acc[k] ||= []).push(i);
    return acc;
  }, {});
  return (
    <div className={`space-y-3 ${cargando ? "opacity-60" : ""}`}>
      {Object.entries(grupos).map(([k, lista]) => (
        <section key={k} className="tarjeta rounded-sm bg-white p-4 sm:p-5">
          <h2 className="font-semibold text-tinta">
            {capitalizar(relativa(lista[0].inicio).split(" · ")[0])}{" "}
            <span className="font-normal text-tenue">
              · {new Date(k).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
            </span>
          </h2>
          <ul className="mt-3 space-y-3">
            {lista.map((i, n) => {
              const c = colorDe(i);
              return (
                <li key={n} className="flex gap-3">
                  <span className="w-1 shrink-0 rounded-sm" style={{ backgroundColor: c.fondo }} aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium text-tinta">{i.titulo}</p>
                    <p className="text-sm text-tenue">
                      {i.tipo === "ENTREGA" ? `Entrega a las ${hora(i.inicio)}` : `${hora(i.inicio)} – ${hora(i.fin)}`}
                      {" · "}
                      {i.tipo === "CLASE" ? "Clase" : i.tipo === "ENTREGA" ? i.detalle : TIPO_EVENTO[i.subtipo]?.texto}
                      {i.lugar ? ` · ${i.lugar}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}