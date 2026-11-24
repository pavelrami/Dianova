import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import Campo from "../../../components/ui/Campo";
import Boton from "../../../components/ui/Boton";
import { useToast } from "../../../components/ui/Toast";
import useFormulario from "../../../hooks/useFormulario";
import { colorHex, entero, longitud, requerido } from "../../../utils/validaciones";
import { materiasApi, periodosApi, usuariosApi } from "../../../api/servicios";

const COLORES = ["#C99A4B", "#8FAF8B", "#9A5530", "#D9A441", "#711B1A", "#B9A48A", "#B5653B", "#6B4A3A", "#7F8A4E", "#5F7F7A", "#7B4B5E", "#C47A6B"];

export default function MateriaFormulario({ abierto, onCerrar, onGuardada, materia }) {
  const toast = useToast();
  const editando = Boolean(materia);
  const [periodos, setPeriodos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const vacio = { periodoId: "", docenteId: "", codigoGrupo: "", nombre: "", creditos: "5", color: "#C99A4B", aula: "", descripcion: "" };
  const f = useFormulario(vacio, {
    periodoId: [requerido("Elige el periodo")],
    codigoGrupo: [requerido("El código de grupo es obligatorio"), longitud(0, 20, "El código"), (v) => (v && !/^[A-Za-z0-9-]+$/.test(v) ? "Usa solo letras, números y guiones" : null)],
    nombre: [requerido("El nombre es obligatorio"), longitud(0, 120, "El nombre")],
    creditos: [requerido("Los créditos son obligatorios"), entero(1, 20, "Créditos:")],
    color: [colorHex()],
    aula: [longitud(0, 60, "El aula")],
    descripcion: [longitud(0, 1000, "La descripción")],
  });

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral(null);
    Promise.all([periodosApi.listar({ size: 50 }), usuariosApi.listar({ rol: "DOCENTE", activo: true, size: 50 })])
      .then(([p, d]) => {
        setPeriodos(p.contenido);
        setDocentes(d.contenido);
        f.reiniciar(
          materia
            ? {
                periodoId: String(materia.periodo.id), docenteId: materia.docente ? String(materia.docente.id) : "",
                codigoGrupo: materia.codigoGrupo, nombre: materia.nombre, creditos: String(materia.creditos),
                color: materia.color, aula: materia.aula || "", descripcion: materia.descripcion || "",
              }
            : { ...vacio, periodoId: String(p.contenido.find((x) => x.activo)?.id ?? "") }
        );
      })
      .catch((e) => setErrorGeneral(e.mensaje));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, materia]);

  const guardar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    const v = f.valores;
    const body = {
      periodoId: Number(v.periodoId), docenteId: v.docenteId ? Number(v.docenteId) : null, codigoGrupo: v.codigoGrupo.trim(),
      nombre: v.nombre.trim(), creditos: Number(v.creditos), color: v.color, aula: v.aula.trim() || null, descripcion: v.descripcion.trim() || null,
    };
    try {
      const m = editando ? await materiasApi.actualizar(materia.id, body) : await materiasApi.crear(body);
      toast.exito(editando ? "Materia actualizada" : "Materia creada");
      onGuardada?.(m);
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
      titulo={editando ? "Editar materia" : "Nueva materia"}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Boton>
          <Boton type="submit" form="form-materia" cargando={enviando}>{editando ? "Guardar cambios" : "Crear materia"}</Boton>
        </>
      }
    >
      <form id="form-materia" onSubmit={guardar} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded-xl bg-vino-suave px-3 py-2.5 text-sm text-vino" role="alert">{errorGeneral}</p>}
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Campo etiqueta="Nombre" placeholder="Cálculo Vectorial" {...f.campo("nombre")} />
          <Campo etiqueta="Código de grupo" placeholder="MAT-301-A" {...f.campo("codigoGrupo")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Periodo" como="select" {...f.campo("periodoId")}>
            <option value="">Elige un periodo</option>
            {periodos.map((p) => <option key={p.id} value={p.id}>{p.nombre}{p.activo ? " (activo)" : ""}</option>)}
          </Campo>
          <Campo etiqueta="Docente" opcional como="select" {...f.campo("docenteId")}>
            <option value="">Sin asignar</option>
            {docentes.map((d) => <option key={d.id} value={d.id}>{d.nombreCompleto}</option>)}
          </Campo>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Créditos" type="number" min="1" max="20" {...f.campo("creditos")} />
          <Campo etiqueta="Aula" opcional placeholder="Aula 204" {...f.campo("aula")} />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-tinta">Color de la materia</legend>
          <div className="flex flex-wrap gap-2">
            {COLORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => f.establecer("color", c)}
                aria-label={`Color ${c}`}
                aria-pressed={f.valores.color === c}
                className={`size-8 rounded-full border-2 transition-transform ${f.valores.color === c ? "scale-110 border-espresso" : "border-white"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          {f.errores.color && <p className="mt-1.5 text-[13px] text-error" role="alert">{f.errores.color}</p>}
        </fieldset>
        <Campo etiqueta="Descripción" opcional como="textarea" {...f.campo("descripcion")} />
      </form>
    </Modal>
  );
}
