import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import Campo from "../../../components/ui/Campo";
import Boton from "../../../components/ui/Boton";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../auth/AuthContext";
import useFormulario from "../../../hooks/useFormulario";
import { fechaFutura, longitud, requerido } from "../../../utils/validaciones";
import { aInputFechaHora } from "../../../utils/formato";
import { materiasApi, tareasApi } from "../../../api/servicios";

/** Crear o editar una tarea. Estudiante: tarea personal. Docente/Admin: tarea de materia (borrador o publicada). */
export default function TareaFormulario({ abierto, onCerrar, onGuardada, tarea }) {
  const { esEstudiante } = useAuth();
  const toast = useToast();
  const editando = Boolean(tarea);
  const [materias, setMaterias] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const reglas = {
    titulo: [requerido("El título es obligatorio"), longitud(0, 150, "El título")],
    descripcion: [longitud(0, 2000, "La descripción")],
    fechaEntrega: editando ? [requerido("La fecha de entrega es obligatoria")] : [requerido("La fecha de entrega es obligatoria"), fechaFutura("La entrega debe ser en el futuro")],
    prioridad: [requerido("Elige una prioridad")],
    materiaId: esEstudiante ? [] : [requerido("Elige la materia de la tarea")],
  };
  const vacio = { titulo: "", descripcion: "", fechaEntrega: "", prioridad: "MEDIA", materiaId: "", publicar: true };
  const f = useFormulario(vacio, reglas);

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral(null);
    f.reiniciar(
      tarea
        ? {
            titulo: tarea.titulo,
            descripcion: tarea.descripcion || "",
            fechaEntrega: aInputFechaHora(tarea.fechaEntrega),
            prioridad: tarea.prioridad,
            materiaId: tarea.materia?.id ? String(tarea.materia.id) : "",
            publicar: tarea.estadoPublicacion === "PUBLICADA",
          }
        : vacio
    );
    materiasApi.listar({ size: 50, orden: "nombre" }).then((p) => setMaterias(p.contenido)).catch(() => setMaterias([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, tarea]);

  const guardar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    const body = {
      titulo: f.valores.titulo.trim(),
      descripcion: f.valores.descripcion.trim() || null,
      fechaEntrega: f.valores.fechaEntrega,
      prioridad: f.valores.prioridad,
      materiaId: f.valores.materiaId ? Number(f.valores.materiaId) : null,
      publicar: esEstudiante ? null : Boolean(f.valores.publicar),
    };
    try {
      const t = editando ? await tareasApi.actualizar(tarea.id, body) : await tareasApi.crear(body);
      toast.exito(editando ? "Tarea actualizada" : t.estadoPublicacion === "PUBLICADA" && !esEstudiante ? "Tarea publicada: avisamos a tus estudiantes" : "Tarea creada");
      onGuardada?.(t);
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const publicadaYa = editando && tarea.estadoPublicacion === "PUBLICADA";

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={editando ? "Editar tarea" : esEstudiante ? "Nueva tarea personal" : "Nueva tarea para tu materia"}
      descripcion={esEstudiante ? "Solo tú la verás." : "Al publicarla, cada estudiante inscrito tendrá su propio seguimiento."}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Boton>
          <Boton type="submit" form="form-tarea" cargando={enviando}>{editando ? "Guardar cambios" : "Crear tarea"}</Boton>
        </>
      }
    >
      <form id="form-tarea" onSubmit={guardar} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded-xl bg-vino-suave px-3 py-2.5 text-sm text-vino" role="alert">{errorGeneral}</p>}
        <Campo etiqueta="Título" placeholder="Ej. Reporte de laboratorio" {...f.campo("titulo")} />
        <Campo etiqueta="Descripción" opcional como="textarea" placeholder="Instrucciones o notas" {...f.campo("descripcion")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Fecha y hora de entrega" type="datetime-local" {...f.campo("fechaEntrega")} />
          <Campo etiqueta="Prioridad" como="select" {...f.campo("prioridad")}>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </Campo>
        </div>
        <Campo
          etiqueta="Materia"
          opcional={esEstudiante}
          como="select"
          disabled={publicadaYa}
          ayuda={publicadaYa ? "Una tarea publicada no puede cambiar de materia" : esEstudiante ? "Solo materias en las que estás inscrito" : undefined}
          {...f.campo("materiaId")}
        >
          <option value="">{esEstudiante ? "Sin materia" : "Elige una materia"}</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} ({m.codigoGrupo})
            </option>
          ))}
        </Campo>
        {!esEstudiante && !publicadaYa && (
          <label className="flex items-start gap-3 rounded-xl border border-linea bg-crema-2 p-3">
            <input
              type="checkbox"
              className="mt-0.5 size-5 accent-vino"
              checked={Boolean(f.valores.publicar)}
              onChange={(e) => f.establecer("publicar", e.target.checked)}
            />
            <span className="text-sm">
              <span className="font-medium text-tinta">Publicar ahora</span>
              <span className="block text-tenue">Si lo desmarcas, queda como borrador y nadie la ve hasta que la publiques.</span>
            </span>
          </label>
        )}
      </form>
    </Modal>
  );
}
