import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AuthLayout from "./AuthLayout";
import Campo from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import ReglasContrasena from "../../components/ui/ReglasContrasena";
import useFormulario from "../../hooks/useFormulario";
import { contrasenaSegura, correo, iguales, longitud, requerido, telefono } from "../../utils/validaciones";
import { useAuth } from "../../auth/AuthContext";
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

export default function Registro() {
  const { registrarse } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const f = useFormulario({ nombre: "", apellidos: "", correo: "", contrasena: "", confirmar: "", telefono: "", carrera: "" }, reglas);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    try {
      const { confirmar, ...datos } = f.valores;
      await registrarse({ ...datos, correo: datos.correo.trim(), telefono: datos.telefono.trim() || null });
      toast.exito("¡Tu cuenta está lista! Te enviamos un correo de bienvenida.");
      navigate("/app", { replace: true });
    } catch (err) {
      if (!f.ponerErroresServidor(err)) setErrorGeneral(err.mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout titulo="Tu semestre, en un solo lugar" subtitulo="Crea tu cuenta de estudiante en menos de un minuto.">
      <h2 className="text-center text-2xl font-bold text-espresso">Crea tu cuenta</h2>
      <p className="mt-1.5 text-center text-sm text-tenue">Usarás tu correo para iniciar sesión</p>
      <form onSubmit={enviar} noValidate className="mt-6 space-y-4">
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
          <Campo etiqueta="Teléfono" opcional type="tel" autoComplete="tel" placeholder="+5215512345678" ayuda="Para SMS y WhatsApp" {...f.campo("telefono")} />
          <Campo etiqueta="Carrera" opcional {...f.campo("carrera")} />
        </div>
        <Boton type="submit" tamano="lg" className="w-full" cargando={enviando}>
          Crear mi cuenta
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
