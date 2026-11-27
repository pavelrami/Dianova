import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, KeyRound, Lock, Mail, MailCheck, MessageSquare, ShieldCheck } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import CampoCodigo, { ReenviarCodigo } from "../../components/ui/CampoCodigo";
import ReglasContrasena from "../../components/ui/ReglasContrasena";
import { Destello } from "../../components/ui/Logo";
import useFormulario from "../../hooks/useFormulario";
import { codigo as reglaCodigo, contrasenaSegura, correo, iguales, requerido } from "../../utils/validaciones";
import { authApi } from "../../api/servicios";
import { useToast } from "../../components/ui/Toast";

const CANALES = [
  { valor: "EMAIL", icono: Mail, titulo: "Correo electrónico", detalle: "Al correo de tu cuenta" },
  { valor: "SMS", icono: MessageSquare, titulo: "SMS", detalle: "Al teléfono que registraste" },
];

/**
 * Recuperación en tres pasos:
 * 1) correo + canal (correo o SMS) → se envía un código de 6 dígitos;
 * 2) se valida el código → la API entrega un token temporal;
 * 3) nueva contraseña con ese token (se cierran todas las sesiones).
 */
export default function Recuperar() {
  const navigate = useNavigate();
  const toast = useToast();
  const [paso, setPaso] = useState(1);
  const [canal, setCanal] = useState("EMAIL");
  const [aviso, setAviso] = useState(null);
  const [vez, setVez] = useState(0);
  const [codigo, setCodigo] = useState("");
  const [errorCodigo, setErrorCodigo] = useState(null);
  const [token, setToken] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const fCorreo = useFormulario({ correo: "" }, { correo: [requerido("El correo es obligatorio"), correo()] });
  const fClave = useFormulario(
    { contrasena: "", confirmar: "" },
    { contrasena: [contrasenaSegura()], confirmar: [requerido("Confirma tu contraseña"), iguales("contrasena")] }
  );
  const correoLimpio = fCorreo.valores.correo.trim();

  const solicitar = async () => {
    const r = await authApi.recuperar(correoLimpio, canal);
    setAviso(r.mensaje);
    setVez((v) => v + 1);
  };

  const enviarPaso1 = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!fCorreo.validarTodo()) return;
    setEnviando(true);
    try {
      await solicitar();
      setCodigo("");
      setErrorCodigo(null);
      setPaso(2);
    } catch (err) {
      if (!fCorreo.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    setErrorCodigo(null);
    try {
      await solicitar();
      setCodigo("");
      toast.exito("Si la cuenta existe, te enviamos un código nuevo");
    } catch (err) {
      setErrorCodigo(err.mensaje);
    }
  };

  const enviarPaso2 = async (e) => {
    e.preventDefault();
    const problema = reglaCodigo()(codigo);
    if (problema) return setErrorCodigo(problema);
    setEnviando(true);
    setErrorCodigo(null);
    try {
      const r = await authApi.verificarCodigo(correoLimpio, codigo);
      setToken(r.token);
      setPaso(3);
    } catch (err) {
      setErrorCodigo(err.errores?.codigo || err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const enviarPaso3 = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!fClave.validarTodo()) return;
    setEnviando(true);
    try {
      const r = await authApi.restablecer(token, fClave.valores.contrasena);
      toast.exito(r.mensaje);
      navigate("/login", { replace: true });
    } catch (err) {
      if (err.errores?.token) {
        // El token de 15 minutos venció: hay que volver a pedir un código
        setErrorGeneral(err.errores.token);
        setToken(null);
      } else if (!fClave.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setToken(null);
    setErrorGeneral(null);
    fClave.reiniciar({ contrasena: "", confirmar: "" });
  };

  const Icono = paso === 1 ? KeyRound : paso === 2 ? (canal === "SMS" ? MessageSquare : MailCheck) : ShieldCheck;
  const titulos = {
    1: "¿Olvidaste tu contraseña?",
    2: canal === "SMS" ? "Revisa tus mensajes" : "Revisa tu correo",
    3: "Crea tu nueva contraseña",
  };

  return (
    <AuthLayout titulo="No te preocupes, suele pasar" subtitulo="Te ayudamos a recuperar el acceso a tu planificación en un momento.">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#f6d48d] text-espresso">
        <span className="relative">
          <Icono className="size-9" />
          <Destello className="absolute -right-5 -top-4 size-4 text-vino" />
        </span>
      </div>
      <Pasos actual={paso} />
      <h2 className="mt-3 text-center text-2xl font-bold text-espresso">{titulos[paso]}</h2>

      {errorGeneral && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-vino/25 bg-white/70 px-3 py-2.5 text-sm text-vino" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            {errorGeneral}{" "}
            {paso === 3 && !token && (
              <button type="button" onClick={reiniciar} className="font-semibold underline">Pedir otro código</button>
            )}
          </span>
        </p>
      )}

      {paso === 1 && (
        <>
          <p className="mt-2 text-center text-sm text-tenue">Escribe el correo de tu cuenta y elige cómo quieres recibir un código de 6 dígitos.</p>
          <form onSubmit={enviarPaso1} noValidate className="mt-6 space-y-4">
            <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="correo@ejemplo.com" icono={Mail} {...fCorreo.campo("correo")} />
            <fieldset>
              <legend className="mb-1.5 block text-sm font-medium text-tinta">Enviar el código por</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {CANALES.map(({ valor, icono: I, titulo, detalle }) => (
                  <label
                    key={valor}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${
                      canal === valor ? "border-vino bg-white ring-2 ring-mantequilla" : "border-linea bg-white/70 hover:border-caramelo"
                    }`}
                  >
                    <input type="radio" name="canal" value={valor} checked={canal === valor} onChange={() => setCanal(valor)} className="sr-only" />
                    <I className={`size-5 shrink-0 ${canal === valor ? "text-vino" : "text-tenue"}`} aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold text-tinta">{titulo}</span>
                      <span className="block text-xs text-tenue">{detalle}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
              Enviar código
            </Boton>
          </form>
        </>
      )}

      {paso === 2 && (
        <>
          <p className="mt-2 text-center text-sm text-tinta">{aviso}. Vence en 10 minutos.</p>
          <form onSubmit={enviarPaso2} noValidate className="mt-6 space-y-4">
            <CampoCodigo valor={codigo} onCambio={setCodigo} error={errorCodigo} disabled={enviando} />
            <Boton type="submit" tamano="lg" className="w-full" cargando={enviando} disabled={codigo.length !== 6}>
              Verificar código
            </Boton>
          </form>
          <div className="mt-5 space-y-3">
            <ReenviarCodigo segundos={60} reinicio={vez} onReenviar={reenviar} />
            <button type="button" onClick={() => setPaso(1)} className="mx-auto flex items-center gap-2 text-sm font-medium text-canela hover:text-vino">
              <ArrowLeft className="size-4" /> Usar otro correo o canal
            </button>
          </div>
        </>
      )}

      {paso === 3 && (
        <form onSubmit={enviarPaso3} noValidate className="mt-6 space-y-4">
          <div>
            <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" icono={Lock} {...fClave.campo("contrasena")} />
            <ReglasContrasena valor={fClave.valores.contrasena} />
          </div>
          <Campo etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" icono={Lock} {...fClave.campo("confirmar")} />
          <p className="text-xs text-tenue">Al guardar, cerraremos tu sesión en todos los dispositivos.</p>
          <Boton type="submit" tamano="lg" className="w-full" cargando={enviando} disabled={!token}>
            Guardar contraseña
          </Boton>
        </form>
      )}

      <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-canela hover:text-vino">
        <ArrowLeft className="size-4" /> Volver a iniciar sesión
      </Link>
    </AuthLayout>
  );
}

function Pasos({ actual }) {
  return (
    <ol className="mt-5 flex items-center justify-center gap-2" aria-label={`Paso ${actual} de 3`}>
      {[1, 2, 3].map((n) => (
        <li key={n} className={`h-1.5 rounded-full transition-all ${n === actual ? "w-8 bg-vino" : n < actual ? "w-4 bg-caramelo" : "w-4 bg-linea"}`} />
      ))}
    </ol>
  );
}
