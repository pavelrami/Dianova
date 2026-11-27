import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, MailCheck } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import CampoCodigo, { ReenviarCodigo } from "../../components/ui/CampoCodigo";
import ReglasContrasena from "../../components/ui/ReglasContrasena";
import { Destello } from "../../components/ui/Logo";
import useFormulario from "../../hooks/useFormulario";
import { codigo as reglaCodigo, contrasenaSegura, correo, iguales, longitud, requerido, telefono } from "../../utils/validaciones";
import { useAuth } from "../../auth/AuthContext";
import { authApi } from "../../api/servicios";
import { useToast } from "../../components/ui/Toast";

const reglas = {
  nombre: [requerido("El nombre es obligatorio"), longitud(2, 80, "El nombre")],
  apellidos: [requerido("Los apellidos son obligatorios"), longitud(2, 120, "Los apellidos")],
  correo: [requerido("El correo es obligatorio"), correo(), longitud(0, 160, "El correo")],
  contrasena: [contrasenaSegura()],
  confirmar: [requerido("Confirma tu contraseña"), iguales("contrasena")],
  telefono: [telefono()],
  carrera: [longitud(0, 120, "La carrera")],
};

/**
 * Registro en dos pasos: 1) datos de la cuenta → se envía un código al correo;
 * 2) el estudiante escribe el código y la cuenta se crea ya con el correo verificado.
 */
export default function Registro() {
  const { registrarse } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const f = useFormulario({ nombre: "", apellidos: "", correo: "", contrasena: "", confirmar: "", telefono: "", carrera: "" }, reglas);
  const [paso, setPaso] = useState(1);
  const [codigo, setCodigo] = useState("");
  const [errorCodigo, setErrorCodigo] = useState(null);
  const [envio, setEnvio] = useState(null); // { mensaje, segundosReenvio, minutosVigencia, vez }
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const pedirCodigo = async () => {
    const r = await authApi.registroCodigo(f.valores.correo.trim());
    setEnvio((e) => ({ ...r, vez: (e?.vez || 0) + 1 }));
  };

  const continuar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    try {
      await pedirCodigo();
      setCodigo("");
      setErrorCodigo(null);
      setPaso(2);
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async () => {
    setErrorCodigo(null);
    try {
      await pedirCodigo();
      setCodigo("");
      toast.exito("Te enviamos un código nuevo");
    } catch (err) {
      setErrorCodigo(err.mensaje);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    const problema = reglaCodigo()(codigo);
    if (problema) return setErrorCodigo(problema);
    setEnviando(true);
    setErrorCodigo(null);
    try {
      const { confirmar, ...datos } = f.valores;
      await registrarse({ ...datos, correo: datos.correo.trim(), telefono: datos.telefono.trim() || null, codigo });
      toast.exito("¡Tu cuenta está lista! Tu correo quedó verificado.");
      navigate("/app", { replace: true });
    } catch (err) {
      if (err.errores?.codigo) setErrorCodigo(err.errores.codigo);
      else if (f.ponerErroresServidor(err)) setPaso(1);
      else setErrorCodigo(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  if (paso === 2) {
    return (
      <AuthLayout titulo="Ya casi está" subtitulo="Confirma que el correo es tuyo para proteger tu cuenta.">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#f6d48d] text-espresso">
          <span className="relative">
            <MailCheck className="size-9" />
            <Destello className="absolute -right-5 -top-4 size-4 text-vino" />
          </span>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold text-espresso">Revisa tu correo</h2>
        <p className="mt-2 text-center text-sm text-tinta">
          Escribe el código de 6 dígitos que enviamos a <b className="break-all">{f.valores.correo.trim()}</b>. Vence en{" "}
          {envio?.minutosVigencia ?? 10} minutos.
        </p>
        <form onSubmit={crear} noValidate className="mt-6 space-y-4">
          <CampoCodigo valor={codigo} onCambio={setCodigo} error={errorCodigo} disabled={enviando} />
          <Boton type="submit" tamano="lg" className="w-full" cargando={enviando} disabled={codigo.length !== 6}>
            Verificar y crear mi cuenta
          </Boton>
        </form>
        <div className="mt-5 space-y-3">
          <ReenviarCodigo segundos={envio?.segundosReenvio ?? 60} reinicio={envio?.vez} onReenviar={reenviar} />
          <p className="text-center text-xs text-tenue">Si no lo ves, busca en la carpeta de spam o promociones.</p>
          <button type="button" onClick={() => setPaso(1)} className="mx-auto flex items-center gap-2 text-sm font-medium text-canela hover:text-vino">
            <ArrowLeft className="size-4" /> Corregir mis datos
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout titulo="Tu semestre, en un solo lugar" subtitulo="Crea tu cuenta de estudiante en menos de un minuto.">
      <h2 className="text-center text-2xl font-bold text-espresso">Crea tu cuenta</h2>
      <p className="mt-1.5 text-center text-sm text-tenue">Te enviaremos un código a tu correo para confirmarlo</p>
      <form onSubmit={continuar} noValidate className="mt-6 space-y-4">
        {errorGeneral && (
          <p className="flex items-start gap-2 rounded-xl border border-vino/25 bg-white/70 px-3 py-2.5 text-sm text-vino" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {errorGeneral}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" autoComplete="given-name" {...f.campo("nombre")} />
          <Campo etiqueta="Apellidos" autoComplete="family-name" {...f.campo("apellidos")} />
        </div>
        <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="correo@ejemplo.com" {...f.campo("correo")} />
        <div>
          <Campo etiqueta="Contraseña" type="password" autoComplete="new-password" {...f.campo("contrasena")} />
          <ReglasContrasena valor={f.valores.contrasena} />
        </div>
        <Campo etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" {...f.campo("confirmar")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Teléfono" opcional type="tel" autoComplete="tel" placeholder="+5215512345678" ayuda="Para recuperar tu contraseña por SMS" {...f.campo("telefono")} />
          <Campo etiqueta="Carrera" opcional {...f.campo("carrera")} />
        </div>
        <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
          Continuar
        </Boton>
      </form>
      <p className="mt-6 text-center text-sm text-tinta">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold text-vino hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
