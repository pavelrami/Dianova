import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, MailCheck, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import { Destello } from "../../components/ui/Logo";
import useFormulario from "../../hooks/useFormulario";
import { correo, requerido } from "../../utils/validaciones";
import { authApi } from "../../api/servicios";

export default function Recuperar() {
  const f = useFormulario({ correo: "" }, { correo: [requerido("El correo es obligatorio"), correo()] });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(null);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    try {
      const r = await authApi.recuperar(f.valores.correo.trim());
      setEnviado(r.mensaje);
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout titulo="No te preocupes, suele pasar" subtitulo="Te ayudamos a recuperar el acceso a tu planificación en un momento.">
      <div className="mx-auto grid size-24 place-items-center rounded-full bg-[#f6d48d] text-espresso">
        <span className="relative">
          {enviado ? <MailCheck className="size-10" /> : <KeyRound className="size-10" />}
          <Destello className="absolute -right-5 -top-4 size-4 text-vino" />
        </span>
      </div>
      <h2 className="mt-5 text-center text-2xl font-bold text-espresso">{enviado ? "Revisa tu correo" : "¿Olvidaste tu contraseña?"}</h2>
      {enviado ? (
        <p className="mt-2 text-center text-sm text-tinta">{enviado}. El enlace vence en 30 minutos.</p>
      ) : (
        <>
          <p className="mt-2 text-center text-sm text-tenue">
            Ingresa el correo electrónico asociado a tu cuenta para enviarte las instrucciones de restablecimiento.
          </p>
          <form onSubmit={enviar} noValidate className="mt-6 space-y-4">
            {errorGeneral && (
              <p className="flex items-start gap-2 rounded-xl border border-vino/25 bg-white/70 px-3 py-2.5 text-sm text-vino" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" /> {errorGeneral}
              </p>
            )}
            <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="correo@ejemplo.com" icono={Mail} {...f.campo("correo")} />
            <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
              Enviar instrucciones
            </Boton>
          </form>
        </>
      )}
      <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-canela hover:text-vino">
        <ArrowLeft className="size-4" /> Volver a iniciar sesión
      </Link>
    </AuthLayout>
  );
}
