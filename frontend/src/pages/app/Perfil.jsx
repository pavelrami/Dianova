import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Save, KeyRound, BellRing } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { perfilApi } from "../../api/servicios";
import useFormulario from "../../hooks/useFormulario";
import useConsulta from "../../hooks/useConsulta";
import Campo, { Interruptor } from "../../components/ui/Campo";
import Boton from "../../components/ui/Boton";
import Avatar from "../../components/ui/Avatar";
import ReglasContrasena from "../../components/ui/ReglasContrasena";
import { Spinner } from "../../components/ui/Cargando";
import { ErrorCarga } from "../../components/ui/Estados";
import { useToast } from "../../components/ui/Toast";
import { contrasenaSegura, iguales, longitud, requerido, telefono, url } from "../../utils/validaciones";
import { ROLES } from "../../utils/etiquetas";
import { fechaHora } from "../../utils/formato";

const TONO_CANELA = "#dcc6a3";

export default function Perfil() {
  const { usuario } = useAuth();
  const location = useLocation();
  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="space-y-4 bg-crema font-sans text-[15px] text-tinta">
      <h1 className="titulo-pagina leading-tight">Mi perfil</h1>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <DatosPerfil />
          <CambiarContrasena />
        </div>
        <div className="space-y-5">
          <section className="tarjeta flex items-center gap-4 rounded-sm bg-white p-5">
            <Avatar nombre={usuario.nombreCompleto} url={usuario.avatarUrl} tamano="size-16" />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-tinta">{usuario.nombreCompleto}</p>
              <p className="truncate text-sm text-tenue">{usuario.correo}</p>
              <p className="mt-1 text-sm text-tenue">
                {ROLES[usuario.rol]}
                {usuario.ultimoAcceso ? ` · último acceso ${fechaHora(usuario.ultimoAcceso)}` : ""}
              </p>
            </div>
          </section>
          <Preferencias />
        </div>
      </div>
    </div>
  );
}

function DatosPerfil() {
  const { usuario, actualizarUsuario } = useAuth();
  const toast = useToast();
  const [guardando, setGuardando] = useState(false);
  const f = useFormulario(
    {
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono || "",
      carrera: usuario.carrera || "",
      avatarUrl: usuario.avatarUrl || "",
    },
    {
      nombre: [requerido("El nombre es obligatorio"), longitud(2, 80, "El nombre")],
      apellidos: [requerido("Los apellidos son obligatorios"), longitud(2, 120, "Los apellidos")],
      telefono: [telefono()],
      carrera: [longitud(0, 120, "La carrera")],
      avatarUrl: [url(), longitud(0, 500, "La URL")],
    }
  );

  const guardar = async (e) => {
    e.preventDefault();
    if (!f.validarTodo()) return;
    setGuardando(true);
    try {
      const u = await perfilApi.actualizar({
        ...f.valores,
        telefono: f.valores.telefono.trim() || null,
        avatarUrl: f.valores.avatarUrl.trim() || null,
      });
      actualizarUsuario(u);
      toast.exito("Perfil actualizado");
    } catch (err) {
      if (!f.ponerErroresServidor(err)) toast.error(err.mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="tarjeta rounded-sm bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-tinta">Datos personales</h2>
      <form onSubmit={guardar} noValidate className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" {...f.campo("nombre")} />
          <Campo etiqueta="Apellidos" {...f.campo("apellidos")} />
        </div>
        <Campo
          etiqueta="Correo electrónico"
          value={usuario.correo}
          disabled
          ayuda="Es tu identificador de acceso; solo el administrador puede cambiarlo."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Teléfono"
            opcional
            type="tel"
            placeholder="+5215512345678"
            ayuda="Formato internacional, necesario para SMS y WhatsApp"
            {...f.campo("telefono")}
          />
          <Campo etiqueta="Carrera" opcional {...f.campo("carrera")} />
        </div>
        <Campo
          etiqueta="Imagen de perfil (URL)"
          opcional
          placeholder="https://…"
          ayuda="Si lo dejas vacío, usamos tus iniciales como avatar"
          {...f.campo("avatarUrl")}
        />
        <Boton type="submit" icono={Save} cargando={guardando}>
          Guardar cambios
        </Boton>
      </form>
    </section>
  );
}

function CambiarContrasena() {
  const toast = useToast();
  const [guardando, setGuardando] = useState(false);
  const f = useFormulario(
    { actual: "", nueva: "", confirmar: "" },
    {
      actual: [requerido("Escribe tu contraseña actual")],
      nueva: [contrasenaSegura()],
      confirmar: [requerido("Confirma la nueva contraseña"), iguales("nueva")],
    }
  );

  const guardar = async (e) => {
    e.preventDefault();
    if (!f.validarTodo()) return;
    setGuardando(true);
    try {
      const r = await perfilApi.cambiarContrasena({ actual: f.valores.actual, nueva: f.valores.nueva });
      toast.exito(r.mensaje);
      f.reiniciar({ actual: "", nueva: "", confirmar: "" });
    } catch (err) {
      if (!f.ponerErroresServidor(err)) toast.error(err.mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="tarjeta rounded-sm bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-tinta">Contraseña</h2>
      <form onSubmit={guardar} noValidate className="mt-4 space-y-4">
        <Campo etiqueta="Contraseña actual" type="password" autoComplete="current-password" {...f.campo("actual")} />
        <div>
          <Campo etiqueta="Nueva contraseña" type="password" autoComplete="new-password" {...f.campo("nueva")} />
          <ReglasContrasena valor={f.valores.nueva} />
        </div>
        <Campo etiqueta="Confirmar nueva contraseña" type="password" autoComplete="new-password" {...f.campo("confirmar")} />
        <Boton type="submit" variante="oscuro" icono={KeyRound} cargando={guardando}>
          Cambiar contraseña
        </Boton>
      </form>
    </section>
  );
}

function Preferencias() {
  const { usuario } = useAuth();
  const toast = useToast();
  const { datos, cargando, error, recargar, setDatos } = useConsulta(() => perfilApi.preferencias(), []);
  const [errores, setErrores] = useState({});
  const [errorAnticipacion, setErrorAnticipacion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const sinTelefono = !usuario.telefono;

  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores((e) => ({
      ...e,
      [campo]: valor && sinTelefono && campo !== "emailHabilitado" ? "Agrega tu teléfono en el perfil para activar este canal" : null,
    }));
  };

  const guardar = async () => {
    const min = Number(datos.minutosAnticipacion);
    const errAnt = !Number.isInteger(min) || min < 5 ? "La anticipación mínima es de 5 minutos" : min > 10080 ? "La anticipación máxima es de 7 días" : null;
    setErrorAnticipacion(errAnt);
    if (errAnt || Object.values(errores).some(Boolean)) return;
    setGuardando(true);
    try {
      const r = await perfilApi.guardarPreferencias({
        emailHabilitado: datos.emailHabilitado,
        smsHabilitado: datos.smsHabilitado,
        whatsappHabilitado: datos.whatsappHabilitado,
        minutosAnticipacion: min,
      });
      setDatos(r);
      toast.exito("Preferencias guardadas");
    } catch (err) {
      if (err.errores) setErrores(err.errores);
      toast.error(err.mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section id="notificaciones" className="tarjeta scroll-mt-24 rounded-sm bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-tinta">
        <span className="grid size-7 place-items-center rounded-sm text-[#1f1916]" style={{ backgroundColor: TONO_CANELA }}>
          <BellRing className="size-4" aria-hidden />
        </span>
        Notificaciones
      </h2>
      <p className="mt-1 text-sm text-tenue">
        Elige por dónde quieres recibir avisos de tareas, eventos y recordatorios. Solo usamos los canales que actives.
      </p>
      {error ? (
        <div className="mt-4">
          <ErrorCarga error={error} onReintentar={recargar} />
        </div>
      ) : cargando || !datos ? (
        <Spinner />
      ) : (
        <div className="mt-5 space-y-5">
          <Interruptor
            etiqueta="Correo electrónico"
            descripcion={usuario.correo}
            checked={datos.emailHabilitado}
            onChange={(v) => cambiar("emailHabilitado", v)}
            error={errores.emailHabilitado}
          />
          <Interruptor
            etiqueta="SMS"
            descripcion={usuario.telefono || "Sin teléfono registrado"}
            checked={datos.smsHabilitado}
            onChange={(v) => cambiar("smsHabilitado", v)}
            error={errores.smsHabilitado}
          />
          <Interruptor
            etiqueta="WhatsApp"
            descripcion={usuario.telefono ? `${usuario.telefono} · debe unirse al sandbox de Twilio` : "Sin teléfono registrado"}
            checked={datos.whatsappHabilitado}
            onChange={(v) => cambiar("whatsappHabilitado", v)}
            error={errores.whatsappHabilitado}
          />
          <Campo
            etiqueta="Anticipación de los recordatorios (minutos)"
            type="number"
            min="5"
            max="10080"
            value={datos.minutosAnticipacion}
            onChange={(e) => {
              setDatos((d) => ({ ...d, minutosAnticipacion: e.target.value }));
              setErrorAnticipacion(null);
            }}
            error={errorAnticipacion}
            ayuda="Se usa para sugerir la hora de tus recordatorios. 60 = una hora antes"
          />
          {datos.consentimientoEn && <p className="text-xs text-tenue">Consentimiento actualizado {fechaHora(datos.consentimientoEn)}</p>}
          <Boton icono={Save} onClick={guardar} cargando={guardando}>
            Guardar preferencias
          </Boton>
        </div>
      )}
    </section>
  );
}