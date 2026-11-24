import { useEffect, useState } from "react";
import { Search, Trash2, UserPlus } from "lucide-react";
import Modal, { ConfirmarModal } from "../../../components/ui/Modal";
import Paginacion from "../../../components/ui/Paginacion";
import Avatar from "../../../components/ui/Avatar";
import Boton from "../../../components/ui/Boton";
import { FilasEsqueleto } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import { useToast } from "../../../components/ui/Toast";
import useConsulta, { useRetraso } from "../../../hooks/useConsulta";
import { materiasApi, usuariosApi } from "../../../api/servicios";
import { ESTADO_INSCRIPCION, Insignia } from "../../../utils/etiquetas";
import { fechaCorta } from "../../../utils/formato";

/** Estudiantes inscritos (N:M). Docente: solo consulta. Administrador: inscribe, cambia estado o elimina. */
export default function InscritosModal({ materia, admin, onCerrar, onCambio }) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [q, setQ] = useState("");
  const qr = useRetraso(q);
  const [busca, setBusca] = useState("");
  const buscaR = useRetraso(busca);
  const [candidatos, setCandidatos] = useState([]);
  const [elegido, setElegido] = useState("");
  const [errorElegido, setErrorElegido] = useState(null);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [quitar, setQuitar] = useState(null);
  const [quitando, setQuitando] = useState(false);

  useEffect(() => setPage(0), [qr, size]);
  const { datos, cargando, error, recargar, setDatos } = useConsulta(
    (s) => (materia ? materiasApi.inscritos(materia.id, { q: qr, page, size }, s) : Promise.resolve(null)),
    [materia?.id, qr, page, size],
    { activo: Boolean(materia) }
  );

  useEffect(() => {
    if (!admin || !materia) return;
    usuariosApi.listar({ rol: "ESTUDIANTE", activo: true, q: buscaR, size: 8 }).then((p) => setCandidatos(p.contenido)).catch(() => setCandidatos([]));
  }, [admin, materia, buscaR]);

  const inscribir = async (e) => {
    e.preventDefault();
    if (!elegido) {
      setErrorElegido("Elige un estudiante");
      return;
    }
    setInscribiendo(true);
    setErrorElegido(null);
    try {
      await materiasApi.inscribir(materia.id, Number(elegido));
      toast.exito("Estudiante inscrito");
      setElegido("");
      recargar();
      onCambio?.();
    } catch (err) {
      setErrorElegido(err.errores?.estudianteId || err.mensaje);
    } finally {
      setInscribiendo(false);
    }
  };

  const cambiarEstado = async (i, estado) => {
    try {
      const act = await materiasApi.cambiarInscripcion(i.id, estado);
      setDatos((d) => ({ ...d, contenido: d.contenido.map((x) => (x.id === i.id ? act : x)) }));
      onCambio?.();
    } catch (err) {
      toast.error(err.mensaje);
    }
  };

  const confirmarQuitar = async () => {
    setQuitando(true);
    try {
      await materiasApi.eliminarInscripcion(quitar.id);
      toast.exito("Inscripción eliminada");
      setQuitar(null);
      recargar();
      onCambio?.();
    } catch (err) {
      toast.error(err.mensaje);
    } finally {
      setQuitando(false);
    }
  };

  return (
    <Modal abierto={Boolean(materia)} onCerrar={onCerrar} titulo="Estudiantes inscritos" descripcion={materia?.nombre} ancho="max-w-2xl">
      {admin && (
        <form onSubmit={inscribir} noValidate className="mb-5 space-y-2 rounded-2xl bg-crema-2 p-4">
          <p className="font-semibold text-tinta">Inscribir estudiante</p>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nombre o correo…" className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Buscar estudiante" />
            <select value={elegido} onChange={(e) => { setElegido(e.target.value); setErrorElegido(null); }} aria-invalid={Boolean(errorElegido)} className={`h-11 rounded-xl border bg-white px-3 text-sm ${errorElegido ? "border-error" : "border-linea"}`} aria-label="Estudiante">
              <option value="">Elige un estudiante</option>
              {candidatos.map((c) => <option key={c.id} value={c.id}>{c.nombreCompleto} · {c.correo}</option>)}
            </select>
            <Boton type="submit" icono={UserPlus} cargando={inscribiendo}>Inscribir</Boton>
          </div>
          {errorElegido && <p className="text-[13px] text-error" role="alert">{errorElegido}</p>}
        </form>
      )}
      <label className="relative block">
        <span className="sr-only">Buscar inscrito</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar inscrito…" className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
      </label>
      <div className="mt-3 overflow-hidden rounded-2xl border border-linea">
        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={4} columnas={3} />
        ) : datos?.contenido.length === 0 ? (
          <Vacio titulo="Sin inscritos" mensaje={qr ? "Nadie coincide con la búsqueda." : "Esta materia aún no tiene estudiantes."} />
        ) : (
          <ul className={`divide-y divide-linea ${cargando ? "opacity-60" : ""}`}>
            {datos?.contenido.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar nombre={i.estudiante.nombreCompleto} url={i.estudiante.avatarUrl} tamano="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-tinta">{i.estudiante.nombreCompleto}</p>
                  <p className="truncate text-xs text-tenue">{i.estudiante.correo} · desde {fechaCorta(i.fechaInscripcion)}</p>
                </div>
                {admin ? (
                  <>
                    <select value={i.estado} onChange={(e) => cambiarEstado(i, e.target.value)} className="h-9 rounded-lg border border-linea bg-white px-2 text-sm" aria-label={`Estado de ${i.estudiante.nombreCompleto}`}>
                      <option value="ACTIVA">Activa</option>
                      <option value="BAJA">Baja</option>
                      <option value="FINALIZADA">Finalizada</option>
                    </select>
                    <button type="button" onClick={() => setQuitar(i)} className="grid size-9 place-items-center rounded-lg text-vino hover:bg-vino-suave" aria-label={`Quitar a ${i.estudiante.nombreCompleto}`}><Trash2 className="size-4" /></button>
                  </>
                ) : (
                  <Insignia mapa={ESTADO_INSCRIPCION} valor={i.estado} />
                )}
              </li>
            ))}
          </ul>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={setSize} cargando={cargando} />
      </div>
      <ConfirmarModal abierto={Boolean(quitar)} onCerrar={() => setQuitar(null)} onConfirmar={confirmarQuitar} cargando={quitando} peligro titulo="¿Quitar inscripción?" textoConfirmar="Quitar" mensaje={<>Se eliminará la inscripción de <b>{quitar?.estudiante.nombreCompleto}</b>. Su avance en las tareas de la materia se conserva. Si solo quieres darlo de baja, cambia el estado a "Baja".</>} />
    </Modal>
  );
}
