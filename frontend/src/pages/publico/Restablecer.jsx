import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import ReglasContrasena from "../../components/ui/ReglasContrasena";
import useFormulario from "../../hooks/useFormulario";
import { contrasenaSegura, iguales, requerido } from "../../utils/validaciones";
import { authApi } from "../../api/servicios";
import { useToast } from "../../components/ui/Toast";

const reglas = {
  contrasena: [contrasenaSegura()],
  confirmar: [requerido("Confirma tu contraseña"), iguales("contrasena")],
};

export default function Restablecer() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const toast = useToast();
  const f = useFormulario({ contrasena: "", confirmar: "" }, reglas);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(token ? null : "El enlace no es válido. Solicita uno nuevo.");

  const enviar = async (e) => {
    e.preventDefault();
    if (!f.validarTodo()) return;
    setEnviando(true);
    setErrorGeneral(null);
    try {
      const r = await authApi.restablecer(token, f.valores.contrasena);
      toast.exito(r.mensaje);
      navigate("/login", { replace: true });
    } catch (err) {
      if (err.errores?.token) setErrorGeneral(err.errores.token);
      else if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout titulo="Un nuevo comienzo" subtitulo="Elige una contraseña segura para tu cuenta.">
      <h2 className="text-center text-2xl font-bold text-espresso">Crea tu nueva contraseña</h2>
      <form onSubmit={enviar} noValidate className="mt-6 space-y-4">
        {errorGeneral && (
          <p className="flex items-start gap-2 rounded-xl border border-vino/25 bg-white/70 px-3 py-2.5 text-sm text-vino" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              {errorGeneral}{" "}
              <Link to="/recuperar" className="font-semibold underline">Pedir otro enlace</Link>
            </span>
          </p>
        )}
        <div>
          <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" {...f.campo("contrasena")} />
          <ReglasContrasena valor={f.valores.contrasena} />
        </div>
        <Campo etiqueta="Confirmar contraseña" type="password" autoComplete="new-password" {...f.campo("confirmar")} />
        <Boton type="submit" tamano="lg" className="w-full" cargando={enviando} disabled={!token}>
          Guardar contraseña
        </Boton>
      </form>
      <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-canela hover:text-vino">
        <ArrowLeft className="size-4" /> Volver a iniciar sesión
      </Link>
    </AuthLayout>
  );
}
