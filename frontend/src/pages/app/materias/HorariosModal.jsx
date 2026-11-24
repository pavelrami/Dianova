import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import Modal, { ConfirmarModal } from "../../../components/ui/Modal";
import Campo from "../../../components/ui/Campo";
import Boton from "../../../components/ui/Boton";
import { Spinner } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import { useToast } from "../../../components/ui/Toast";
import useConsulta from "../../../hooks/useConsulta";
import useFormulario from "../../../hooks/useFormulario";
import { longitud, posteriorA, requerido } from "../../../utils/validaciones";
import { DIAS } from "../../../utils/formato";
import { materiasApi } from "../../../api/servicios";

/** Administrador: días y horas de clase de una materia (horarios_clase). */
export default function HorariosModal({ materia, onCerrar, onCambio }) {
  const toast = useToast();
  const { datos, cargando, error, recargar } = useConsulta(
    () => (materia ? materiasApi.horarios(materia.id) : Promise.resolve([])),
    [materia?.id],
    { activo: Boolean(materia) }
  );
  const f = useFormulario({ diaSemana: "1", horaInicio: "", horaFin: "", aula: "" }, {
    diaSemana: [requerido("Elige el día")],
    horaInicio: [requerido("La hora de inicio es obligatoria")],
    horaFin: [requerido("La hora de fin es obligatoria"), posteriorA("horaInicio", "La hora de fin debe ser posterior a la de inicio")],
    aula: [longitud(0, 60, "El aula")],
  });
  const [guardando, setGuardando] = useState(false);
  const [borrar, setBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);

  const agregar = async (e) => {
    e.preventDefault();
    if (!f.validarTodo()) return;
    setGuardando(true);
    try {
      await materiasApi.crearHorario(materia.id, { ...f.valores, diaSemana: Number(f.valores.diaSemana), aula: f.valores.aula || null });
      toast.exito("Horario agregado");
      f.reiniciar({ diaSemana: f.valores.diaSemana, horaInicio: "", horaFin: "", aula: f.valores.aula });
      recargar();
      onCambio?.();
    } catch (err) {
      if (!f.ponerErroresServidor(err)) toast.error(err.mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    setBorrando(true);
    try {
      await materiasApi.eliminarHorario(materia.id, borrar.id);
      toast.exito("Horario eliminado");
      setBorrar(null);
      recargar();
      onCambio?.();
    } catch (err) {
      toast.error(err.mensaje);
    } finally {
      setBorrando(false);
    }
  };

  if (!materia) return null;
  return (
    <Modal abierto={Boolean(materia)} onCerrar={onCerrar} titulo="Horario de clases" descripcion={materia?.nombre}>
      {error ? (
        <ErrorCarga error={error} onReintentar={recargar} />
      ) : cargando || !datos ? (
        <Spinner />
      ) : datos.length === 0 ? (
        <Vacio titulo="Sin horario" mensaje="Agrega el primer día de clase." />
      ) : (
        <ul className="divide-y divide-linea rounded-2xl border border-linea">
          {datos.map((h) => (
            <li key={h.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-tinta">{DIAS[h.diaSemana]}</p>
                <p className="text-sm text-tenue">{h.horaInicio.slice(0, 5)} – {h.horaFin.slice(0, 5)}{h.aula ? ` · ${h.aula}` : ""}</p>
              </div>
              <button type="button" onClick={() => setBorrar(h)} className="grid size-9 place-items-center rounded-lg text-vino hover:bg-vino-suave" aria-label={`Eliminar horario del ${DIAS[h.diaSemana]}`}>
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={agregar} noValidate className="mt-5 space-y-3 rounded-2xl bg-crema-2 p-4">
        <p className="font-semibold text-tinta">Agregar día de clase</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo etiqueta="Día" como="select" {...f.campo("diaSemana")}>
            {DIAS.slice(1).map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
          </Campo>
          <Campo etiqueta="Aula" opcional {...f.campo("aula")} />
          <Campo etiqueta="Inicio" type="time" {...f.campo("horaInicio")} />
          <Campo etiqueta="Fin" type="time" {...f.campo("horaFin")} />
        </div>
        <Boton type="submit" icono={Plus} cargando={guardando} variante="suave">Agregar</Boton>
      </form>
      <ConfirmarModal abierto={Boolean(borrar)} onCerrar={() => setBorrar(null)} onConfirmar={eliminar} cargando={borrando} peligro titulo="¿Eliminar este horario?" textoConfirmar="Eliminar" mensaje="La clase dejará de aparecer en el calendario de los inscritos." />
    </Modal>
  );
}
