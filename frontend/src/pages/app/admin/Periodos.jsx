import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GraduationCap, Search } from "lucide-react";
import { periodosApi } from "../../../api/servicios";
import useConsulta, { useRetraso } from "../../../hooks/useConsulta";
import useFormulario from "../../../hooks/useFormulario";
import Boton from "../../../components/ui/Boton";
import Campo from "../../../components/ui/Campo";
import Paginacion from "../../../components/ui/Paginacion";
import Modal, { ConfirmarModal } from "../../../components/ui/Modal";
import { FilasEsqueleto } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import { useToast } from "../../../components/ui/Toast";
import { longitud, posteriorA, requerido } from "../../../utils/validaciones";

/** Periodos académicos (semestres). Solo uno puede estar activo. */
export default function Periodos() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [activo, setActivo] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [formulario, setFormulario] = useState({ abierto: false, periodo: null });
  const [eliminar, setEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const qr = useRetraso(q);

  // Los filtros viajan a la API como parámetros; el servidor pagina y filtra
  useEffect(() => setPage(0), [qr, activo, size]);
  const params = { q: qr, activo, page, size };
  const { datos, cargando, error, recargar } = useConsulta((s) => periodosApi.listar(params, s), [JSON.stringify(params)]);

  const confirmar = async () => {
    setEliminando(true);
    try {
      await periodosApi.eliminar(eliminar.id);
      toast.exito("Periodo eliminado");
      setEliminar(null);
      recargar();
    } catch (e) {
      toast.error(e.mensaje);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="migas">Administración / Periodos</p>
          <h1 className="titulo-pagina mt-1">Periodos académicos</h1>
          <p className="mt-1 text-tenue">Semestres o ciclos con su rango de fechas. Las materias pertenecen a un periodo.</p>
        </div>
        <Boton icono={Plus} onClick={() => setFormulario({ abierto: true, periodo: null })}>Nuevo periodo</Boton>
      </div>
      <section className="tarjeta overflow-hidden">
        <div className="grid gap-2 border-b border-linea p-4 sm:grid-cols-[1fr_200px]">
          <label className="relative">
            <span className="sr-only">Buscar periodo</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar periodo (ej. 2025)…" className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
          </label>
          <select value={activo} onChange={(e) => setActivo(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Estado del periodo">
            <option value="">Todos los periodos</option>
            <option value="true">Periodo actual</option>
            <option value="false">Otros periodos</option>
          </select>
        </div>
        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={3} columnas={3} />
        ) : datos.contenido.length === 0 ? (
          <Vacio titulo="Sin periodos" mensaje={qr || activo ? "Ningún periodo coincide con estos filtros." : undefined} icono={GraduationCap} />
        ) : (
          <ul className={`divide-y divide-linea ${cargando ? "opacity-60" : ""}`}>
            {datos.contenido.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-tinta">{p.nombre} {p.activo && <span className="chip ml-2 bg-mantequilla text-espresso">Actual</span>}</p>
                  <p className="text-sm text-tenue">{new Date(`${p.fechaInicio}T00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" })} – {new Date(`${p.fechaFin}T00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" })}</p>
                </div>
                <button type="button" onClick={() => setFormulario({ abierto: true, periodo: p })} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label={`Editar ${p.nombre}`}><Pencil className="size-4" /></button>
                <button type="button" onClick={() => setEliminar(p)} className="grid size-9 place-items-center rounded-lg text-vino hover:bg-vino-suave" aria-label={`Eliminar ${p.nombre}`}><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={(t) => { setSize(t); setPage(0); }} cargando={cargando} />
      </section>
      <PeriodoFormulario abierto={formulario.abierto} periodo={formulario.periodo} onCerrar={() => setFormulario({ abierto: false, periodo: null })} onGuardado={() => { setFormulario({ abierto: false, periodo: null }); recargar(); }} />
      <ConfirmarModal abierto={Boolean(eliminar)} onCerrar={() => setEliminar(null)} onConfirmar={confirmar} cargando={eliminando} peligro titulo="¿Eliminar periodo?" textoConfirmar="Eliminar" mensaje={<>Se eliminará <b>{eliminar?.nombre}</b>. Solo es posible si no tiene materias.</>} />
    </div>
  );
}

function PeriodoFormulario({ abierto, periodo, onCerrar, onGuardado }) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const vacio = { nombre: "", fechaInicio: "", fechaFin: "", activo: false };
  const f = useFormulario(vacio, {
    nombre: [requerido("El nombre es obligatorio"), longitud(0, 40, "El nombre")],
    fechaInicio: [requerido("La fecha de inicio es obligatoria")],
    fechaFin: [requerido("La fecha de fin es obligatoria"), posteriorA("fechaInicio", "La fecha de fin debe ser posterior a la de inicio")],
  });
  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral(null);
    f.reiniciar(periodo ? { nombre: periodo.nombre, fechaInicio: periodo.fechaInicio, fechaFin: periodo.fechaFin, activo: periodo.activo } : vacio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, periodo]);

  const guardar = async (e) => {
    e.preventDefault();
    if (!f.validarTodo()) return;
    setEnviando(true);
    try {
      const body = { ...f.valores, nombre: f.valores.nombre.trim(), activo: Boolean(f.valores.activo) };
      if (periodo) await periodosApi.actualizar(periodo.id, body);
      else await periodosApi.crear(body);
      toast.exito(periodo ? "Periodo actualizado" : "Periodo creado");
      onGuardado?.();
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={periodo ? "Editar periodo" : "Nuevo periodo"} pie={<><Boton variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Boton><Boton type="submit" form="form-periodo" cargando={enviando}>Guardar</Boton></>}>
      <form id="form-periodo" onSubmit={guardar} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded-xl bg-vino-suave px-3 py-2.5 text-sm text-vino" role="alert">{errorGeneral}</p>}
        <Campo etiqueta="Nombre" placeholder="2027-1" {...f.campo("nombre")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Inicio" type="date" {...f.campo("fechaInicio")} />
          <Campo etiqueta="Fin" type="date" {...f.campo("fechaFin")} />
        </div>
        <label className="flex items-center gap-3 text-sm text-tinta">
          <input type="checkbox" className="size-5 accent-vino" checked={Boolean(f.valores.activo)} onChange={(e) => f.establecer("activo", e.target.checked)} />
          Marcar como periodo actual (desactiva los demás)
        </label>
      </form>
    </Modal>
  );
}
