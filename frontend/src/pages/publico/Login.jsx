import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import useFormulario from "../../hooks/useFormulario";
import { correo, requerido } from "../../utils/validaciones";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/ui/Toast";

const reglas = {
  correo: [requerido("El correo es obligatorio"), correo()],
  contrasena: [requerido("La contraseña es obligatoria")],
};

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const f = useFormulario({ correo: "", contrasena: "" }, reglas);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    try {
      const u = await iniciarSesion(f.valores.correo.trim(), f.valores.contrasena);
      toast.exito(`¡Hola, ${u.nombre}!`);
      navigate(location.state?.desde || "/app", { replace: true });
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout titulo="Cada gran logro empieza con orden" subtitulo="Organiza tus clases, tareas y recordatorios.">
      <h2 className="text-center text-2xl font-bold text-espresso">Inicia sesión en tu cuenta</h2>
      <p className="mt-1.5 text-center text-sm text-tenue">Ingresa tus datos para acceder a tu planificador</p>

      <form onSubmit={enviar} noValidate className="mt-7 space-y-4">
        {errorGeneral && (
          <p className="flex items-start gap-2 rounded-xl border border-vino/25 bg-white/70 px-3 py-2.5 text-sm text-vino" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {errorGeneral}
          </p>
        )}
        <Campo etiqueta="Correo electrónico" type="email" autoComplete="email" placeholder="correo@ejemplo.com" icono={Mail} {...f.campo("correo")} />
        <div>
          <Campo etiqueta="Contraseña" type="password" autoComplete="current-password" placeholder="••••••••" {...f.campo("contrasena")} />
          <div className="mt-2 text-right">
            <Link to="/recuperar" className="text-sm font-medium text-canela hover:text-vino hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
        <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
          {enviando ? "Entrando…" : "Iniciar sesión"}
        </Boton>
      </form>

      <p className="mt-7 text-center text-sm text-tinta">
        ¿No tienes cuenta?{" "}
        <Link to="/registro" className="font-semibold text-vino hover:underline">
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  );
}
