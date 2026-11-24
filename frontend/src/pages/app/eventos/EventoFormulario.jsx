import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import Campo from "../../../components/ui/Campo";
import Boton from "../../../components/ui/Boton";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../auth/AuthContext";
import useFormulario from "../../../hooks/useFormulario";
import { longitud, posteriorA, requerido } from "../../../utils/validaciones";
import { aInputFechaHora } from "../../../utils/formato";
import { TIPO_EVENTO } from "../../../utils/etiquetas";
import { eventosApi, materiasApi } from "../../../api/servicios";

export default function EventoFormulario({ abierto, onCerrar, onGuardado, evento }) {
  const { esEstudiante } = useAuth();
  const toast = useToast();
  const editando = Boolean(evento);
  const [materias, setMaterias] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const vacio = { titulo: "", descripcion: "", ubicacion: "", inicio: "", fin: "", tipo: esEstudiante ? "PERSONAL" : "CLASE", materiaId: "", estado: "PROGRAMADO" };
  const f = useFormulario(vacio, {
    titulo: [requerido("El título es obligatorio"), longitud(0, 150, "El título")],
    descripcion: [longitud(0, 2000, "La descripción")],
    ubicacion: [longitud(0, 150, "La ubicación")],
    inicio: [requerido("La fecha de inicio es obligatoria")],
    fin: [requerido("La fecha de fin es obligatoria"), posteriorA("inicio", "El fin del evento debe ser posterior a su inicio")],
    tipo: [requerido("Elige un tipo de evento")],
  });

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral(null);
    f.reiniciar(
      evento
        ? {
            titulo: evento.titulo, descripcion: evento.descripcion || "", ubicacion: evento.ubicacion || "",
            inicio: aInputFechaHora(evento.inicio), fin: aInputFechaHora(evento.fin), tipo: evento.tipo,
            materiaId: evento.materia?.id ? String(evento.materia.id) : "", estado: evento.estado,
          }
        : vacio
    );
    if (!esEstudiante) materiasApi.listar({ size: 50 }).then((p) => setMaterias(p.contenido)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, evento]);

  const guardar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    const v = f.valores;
    const body = {
      titulo: v.titulo.trim(), descripcion: v.descripcion.trim() || null, ubicacion: v.ubicacion.trim() || null,
      inicio: v.inicio, fin: v.fin, tipo: v.tipo, materiaId: v.materiaId ? Number(v.materiaId) : null,
      estado: editando ? v.estado : null,
    };
    try {
      const r = editando ? await eventosApi.actualizar(evento.id, body) : await eventosApi.crear(body);
      toast.exito(editando ? "Evento actualizado" : r.materia ? "Evento programado: avisamos a los inscritos" : "Evento creado");
      onGuardado?.(r);
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={editando ? "Editar evento" : "Nuevo evento"}
      descripcion={esEstudiante ? "Tus eventos personales solo los ves tú." : "Si eliges una materia, se invita a todos sus inscritos."}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Boton>
          <Boton type="submit" form="form-evento" cargando={enviando}>{editando ? "Guardar cambios" : "Crear evento"}</Boton>
        </>
      }
    >
      <form id="form-evento" onSubmit={guardar} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded-xl bg-vino-suave px-3 py-2.5 text-sm text-vino" role="alert">{errorGeneral}</p>}
        <Campo etiqueta="Título" placeholder="Ej. Repaso para el parcial" {...f.campo("titulo")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Inicio" type="datetime-local" {...f.campo("inicio")} />
          <Campo etiqueta="Fin" type="datetime-local" {...f.campo("fin")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tipo" como="select" {...f.campo("tipo")}>
            {Object.entries(TIPO_EVENTO).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}
          </Campo>
          <Campo etiqueta="Ubicación" opcional placeholder="Aula, laboratorio o enlace" {...f.campo("ubicacion")} />
        </div>
        {!esEstudiante && (
          <Campo etiqueta="Materia" opcional como="select" disabled={editando} ayuda={editando ? "La materia no se puede cambiar" : "Déjalo vacío para un evento personal"} {...f.campo("materiaId")}>
            <option value="">Sin materia (personal)</option>
            {materias.map((m) => <option key={m.id} value={m.id}>{m.nombre} ({m.codigoGrupo})</option>)}
          </Campo>
        )}
        {editando && (
          <Campo etiqueta="Estado" como="select" {...f.campo("estado")}>
            <option value="PROGRAMADO">Programado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="FINALIZADO">Finalizado</option>
          </Campo>
        )}
        <Campo etiqueta="Descripción" opcional como="textarea" {...f.campo("descripcion")} />
      </form>
    </Modal>
  );
}
