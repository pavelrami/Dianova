import { useEffect, useState } from "react";
import { Mail, MessageSquare, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../../components/ui/Modal";
import Campo from "../../../components/ui/Campo";
import Boton from "../../../components/ui/Boton";
import { useToast } from "../../../components/ui/Toast";
import useFormulario from "../../../hooks/useFormulario";
import { fechaFutura, longitud, requerido } from "../../../utils/validaciones";
import { aInputFechaHora, fechaHora } from "../../../utils/formato";
import { perfilApi, recordatoriosApi } from "../../../api/servicios";

const CANALES = [
  { valor: "EMAIL", texto: "Correo", icono: Mail, pref: "emailHabilitado" },
  { valor: "SMS", texto: "SMS", icono: MessageSquare, pref: "smsHabilitado" },
  { valor: "WHATSAPP", texto: "WhatsApp", icono: MessageCircle, pref: "whatsappHabilitado" },
];

/**
 * Programa un recordatorio para una tarea o un evento (solo uno de los dos, como exige el modelo).
 * destino = { tipo: "tarea" | "evento", id, titulo, fecha }
 */
export default function RecordatorioFormulario({ destino, onCerrar, onGuardado }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const f = useFormulario(
    { canal: "EMAIL", programadoPara: "", mensaje: "" },
    {
      canal: [requerido("Elige un canal")],
      programadoPara: [requerido("Elige la fecha y hora"), fechaFutura("El recordatorio debe programarse en el futuro")],
      mensaje: [longitud(0, 500, "El mensaje")],
    }
  );

  useEffect(() => {
    if (!destino) return;
    setErrorGeneral(null);
    perfilApi.preferencias().then((p) => {
      setPrefs(p);
      const base = destino.fecha ? new Date(new Date(destino.fecha).getTime() - (p.minutosAnticipacion || 60) * 60000) : null;
      const sugerida = base && base > new Date() ? aInputFechaHora(base) : "";
      f.reiniciar({ canal: p.emailHabilitado ? "EMAIL" : p.whatsappHabilitado ? "WHATSAPP" : p.smsHabilitado ? "SMS" : "EMAIL", programadoPara: sugerida, mensaje: "" });
    }).catch(() => setPrefs(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destino]);

  const guardar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    try {
      const r = await recordatoriosApi.crear({
        tareaId: destino.tipo === "tarea" ? destino.id : null,
        eventoId: destino.tipo === "evento" ? destino.id : null,
        canal: f.valores.canal,
        programadoPara: f.valores.programadoPara,
        mensaje: f.valores.mensaje.trim() || null,
      });
      toast.exito(`Recordatorio programado para ${fechaHora(r.programadoPara)}`);
      onGuardado?.(r);
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      abierto={Boolean(destino)}
      onCerrar={onCerrar}
      titulo="Programar recordatorio"
      descripcion={destino?.titulo}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Boton>
          <Boton type="submit" form="form-recordatorio" cargando={enviando}>Programar</Boton>
        </>
      }
    >
      <form id="form-recordatorio" onSubmit={guardar} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded-xl bg-vino-suave px-3 py-2.5 text-sm text-vino" role="alert">{errorGeneral}</p>}
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-tinta">Canal</legend>
          <div className="grid grid-cols-3 gap-2">
            {CANALES.map(({ valor, texto, icono: Icono, pref }) => {
              const activo = f.valores.canal === valor;
              const permitido = prefs ? prefs[pref] : true;
              return (
                <label
                  key={valor}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-medium transition-colors ${
                    activo ? "border-vino bg-vino-suave text-vino" : "border-linea bg-white text-tinta hover:border-caramelo"
                  } ${!permitido ? "opacity-60" : ""}`}
                >
                  <input type="radio" name="canal" value={valor} checked={activo} onChange={() => f.establecer("canal", valor)} className="sr-only" />
                  <Icono className="size-5" aria-hidden />
                  {texto}
                  {!permitido && <span className="text-[11px] font-normal text-tenue">desactivado</span>}
                </label>
              );
            })}
          </div>
          {f.errores.canal && <p className="mt-1.5 text-[13px] text-error" role="alert">{f.errores.canal}</p>}
          {prefs && !prefs[CANALES.find((c) => c.valor === f.valores.canal).pref] && (
            <p className="mt-1.5 text-[13px] text-tenue">
              Este canal está desactivado en tus{" "}
              <Link to="/app/perfil#notificaciones" className="font-semibold text-vino underline">preferencias</Link>.
            </p>
          )}
        </fieldset>
        <Campo etiqueta="Fecha y hora del aviso" type="datetime-local" {...f.campo("programadoPara")} />
        <Campo etiqueta="Mensaje" opcional como="textarea" placeholder="Si lo dejas vacío, usamos un mensaje con el título y la fecha" {...f.campo("mensaje")} />
      </form>
    </Modal>
  );
}
