import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { usuariosApi } from "../../../api/servicios";
import useConsulta, { useRetraso } from "../../../hooks/useConsulta";
import useFormulario from "../../../hooks/useFormulario";
import Boton from "../../../components/ui/Boton";
import Campo from "../../../components/ui/Campo";
import Avatar from "../../../components/ui/Avatar";
import Paginacion from "../../../components/ui/Paginacion";
import Modal, { ConfirmarModal } from "../../../components/ui/Modal";
import ReglasContrasena from "../../../components/ui/ReglasContrasena";
import { FilasEsqueleto } from "../../../components/ui/Cargando";
import { ErrorCarga, Vacio } from "../../../components/ui/Estados";
import { useToast } from "../../../components/ui/Toast";
import { contrasenaSegura, correo, longitud, requerido, telefono } from "../../../utils/validaciones";
import { ROLES } from "../../../utils/etiquetas";
import { fechaHora } from "../../../utils/formato";

/** Gestión de usuarios (Frame "Tabla" del prototipo): búsqueda, filtros y paginación en el servidor. */
export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("");
  const [activo, setActivo] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [formulario, setFormulario] = useState({ abierto: false, usuario: null });
  const [accion, setAccion] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const qr = useRetraso(q);

  useEffect(() => setPage(0), [qr, rol, activo, orden, size]);
  const params = { q: qr, rol, activo, page, size, orden, dir: orden === "creado" || orden === "acceso" ? "desc" : "asc" };
  const { datos, cargando, error, recargar } = useConsulta((s) => usuariosApi.listar(params, s), [JSON.stringify(params)]);

  const ejecutar = async () => {
    setProcesando(true);
    try {
      if (accion.tipo === "eliminar") {
        await usuariosApi.eliminar(accion.u.id);
        toast.exito("Usuario eliminado");
      } else {
        await usuariosApi.estado(accion.u.id, accion.tipo === "activar");
        toast.exito(accion.tipo === "activar" ? "Cuenta activada" : "Cuenta desactivada y sesiones cerradas");
      }
      setAccion(null);
      recargar();
    } catch (e) {
      toast.error(e.mensaje);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="migas">Panel principal / Usuarios</p>
          <h1 className="titulo-pagina mt-1">Gestión de usuarios</h1>
          <p className="mt-1 text-tenue">Administra los usuarios y roles del sistema</p>
        </div>
        <Boton icono={Plus} onClick={() => setFormulario({ abierto: true, usuario: null })}>Nuevo usuario</Boton>
      </div>

      <section className="tarjeta overflow-hidden">
        <div className="grid gap-2 border-b border-linea p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_190px]">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Buscar usuario</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar usuario…" className="h-11 w-full rounded-xl border border-linea bg-white pl-9 pr-3 text-sm outline-none focus:border-caramelo" />
          </label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Rol">
            <option value="">Todos los roles</option>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={activo} onChange={(e) => setActivo(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Estado">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className="h-11 rounded-xl border border-linea bg-white px-3 text-sm" aria-label="Ordenar">
            <option value="nombre">Nombre (A-Z)</option>
            <option value="correo">Correo (A-Z)</option>
            <option value="creado">Más recientes</option>
            <option value="acceso">Último acceso</option>
          </select>
        </div>

        {error ? (
          <div className="p-4"><ErrorCarga error={error} onReintentar={recargar} /></div>
        ) : cargando && !datos ? (
          <FilasEsqueleto filas={6} columnas={4} />
        ) : datos.contenido.length === 0 ? (
          <Vacio titulo="Sin usuarios" mensaje="Nadie coincide con estos filtros." />
        ) : (
          <div className={`overflow-x-auto ${cargando ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[720px] text-left">
              <thead className="text-sm text-tinta">
                <tr className="border-b border-linea">
                  <th className="px-5 py-3 font-semibold">Nombre</th>
                  <th className="px-3 py-3 font-semibold">Rol</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Último acceso</th>
                  <th className="px-3 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea">
                {datos.contenido.map((u) => (
                  <tr key={u.id} className="hover:bg-crema-2/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nombre={u.nombreCompleto} url={u.avatarUrl} tamano="size-9" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-tinta">{u.nombreCompleto}{u.id === yo.id && <span className="ml-1 text-xs text-tenue">(tú)</span>}</p>
                          <p className="truncate text-sm text-tenue">{u.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-tinta">{ROLES[u.rol]}</td>
                    <td className="px-3 py-3"><span className={`chip ${u.activo ? "bg-salvia text-salvia-tinta" : "bg-vino-suave text-vino"}`}>{u.activo ? "Activo" : "Inactivo"}</span></td>
                    <td className="px-3 py-3 text-sm text-tenue">{u.ultimoAcceso ? fechaHora(u.ultimoAcceso) : "Nunca"}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => setFormulario({ abierto: true, usuario: u })} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label={`Editar a ${u.nombreCompleto}`}><Pencil className="size-4" /></button>
                        {u.id !== yo.id && (
                          <>
                            <button type="button" onClick={() => setAccion({ tipo: u.activo ? "desactivar" : "activar", u })} className="grid size-9 place-items-center rounded-lg text-tenue hover:bg-caramelo-suave hover:text-tinta" aria-label={u.activo ? `Desactivar a ${u.nombreCompleto}` : `Activar a ${u.nombreCompleto}`}>
                              {u.activo ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
                            </button>
                            <button type="button" onClick={() => setAccion({ tipo: "eliminar", u })} className="grid size-9 place-items-center rounded-lg text-vino hover:bg-vino-suave" aria-label={`Eliminar a ${u.nombreCompleto}`}><Trash2 className="size-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Paginacion pagina={datos} onPagina={setPage} tamano={size} onTamano={setSize} cargando={cargando} />
      </section>

      <UsuarioFormulario abierto={formulario.abierto} usuario={formulario.usuario} esYo={formulario.usuario?.id === yo.id} onCerrar={() => setFormulario({ abierto: false, usuario: null })} onGuardado={() => { setFormulario({ abierto: false, usuario: null }); recargar(); }} />
      <ConfirmarModal
        abierto={Boolean(accion)}
        onCerrar={() => setAccion(null)}
        onConfirmar={ejecutar}
        cargando={procesando}
        peligro={accion?.tipo !== "activar"}
        titulo={accion?.tipo === "eliminar" ? "¿Eliminar usuario?" : accion?.tipo === "desactivar" ? "¿Desactivar cuenta?" : "¿Activar cuenta?"}
        textoConfirmar={accion?.tipo === "eliminar" ? "Eliminar" : accion?.tipo === "desactivar" ? "Desactivar" : "Activar"}
        mensaje={
          accion?.tipo === "eliminar"
            ? <>Se eliminará a <b>{accion?.u.nombreCompleto}</b> con sus inscripciones, tareas, eventos y recordatorios. Esta acción no se puede deshacer. Si solo quieres impedir el acceso, desactiva la cuenta.</>
            : accion?.tipo === "desactivar"
              ? <><b>{accion?.u.nombreCompleto}</b> no podrá iniciar sesión y sus sesiones abiertas se cerrarán.</>
              : <><b>{accion?.u.nombreCompleto}</b> podrá volver a iniciar sesión.</>
        }
      />
    </div>
  );
}

function UsuarioFormulario({ abierto, usuario, esYo, onCerrar, onGuardado }) {
  const toast = useToast();
  const editando = Boolean(usuario);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const vacio = { nombre: "", apellidos: "", correo: "", contrasena: "", rol: "ESTUDIANTE", telefono: "", carrera: "", activo: true };
  const f = useFormulario(vacio, {
    nombre: [requerido("El nombre es obligatorio"), longitud(2, 80, "El nombre")],
    apellidos: [requerido("Los apellidos son obligatorios"), longitud(2, 120, "Los apellidos")],
    correo: [requerido("El correo es obligatorio"), correo(), longitud(0, 160, "El correo")],
    contrasena: [contrasenaSegura({ opcional: editando })],
    rol: [requerido("Elige un rol")],
    telefono: [telefono()],
    carrera: [longitud(0, 120, "La carrera")],
  });

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral(null);
    f.reiniciar(usuario ? { nombre: usuario.nombre, apellidos: usuario.apellidos, correo: usuario.correo, contrasena: "", rol: usuario.rol, telefono: usuario.telefono || "", carrera: usuario.carrera || "", activo: usuario.activo } : vacio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, usuario]);

  const guardar = async (e) => {
    e.preventDefault();
    setErrorGeneral(null);
    if (!f.validarTodo()) return;
    setEnviando(true);
    const v = f.valores;
    const body = { ...v, correo: v.correo.trim(), telefono: v.telefono.trim() || null, carrera: v.carrera.trim() || null, contrasena: v.contrasena || null };
    try {
      if (editando) await usuariosApi.actualizar(usuario.id, body);
      else await usuariosApi.crear(body);
      toast.exito(editando ? "Usuario actualizado" : "Usuario creado");
      onGuardado?.();
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
      titulo={editando ? "Editar usuario" : "Nuevo usuario"}
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={enviando}>Cancelar</Boton>
          <Boton type="submit" form="form-usuario" cargando={enviando}>{editando ? "Guardar cambios" : "Crear usuario"}</Boton>
        </>
      }
    >
      <form id="form-usuario" onSubmit={guardar} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded-xl bg-vino-suave px-3 py-2.5 text-sm text-vino" role="alert">{errorGeneral}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" {...f.campo("nombre")} />
          <Campo etiqueta="Apellidos" {...f.campo("apellidos")} />
        </div>
        <Campo etiqueta="Correo electrónico" type="email" {...f.campo("correo")} />
        <div>
          <Campo etiqueta={editando ? "Nueva contraseña" : "Contraseña"} opcional={editando} type="password" autoComplete="new-password" ayuda={editando ? "Déjala vacía para no cambiarla" : undefined} {...f.campo("contrasena")} />
          {(!editando || f.valores.contrasena) && <ReglasContrasena valor={f.valores.contrasena} />}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Rol" como="select" disabled={esYo} ayuda={esYo ? "No puedes cambiar tu propio rol" : undefined} {...f.campo("rol")}>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Campo>
          <Campo etiqueta="Teléfono" opcional type="tel" placeholder="+5215512345678" {...f.campo("telefono")} />
        </div>
        <Campo etiqueta="Carrera" opcional {...f.campo("carrera")} />
        {!esYo && (
          <label className="flex items-center gap-3 text-sm text-tinta">
            <input type="checkbox" className="size-5 accent-vino" checked={Boolean(f.valores.activo)} onChange={(e) => f.establecer("activo", e.target.checked)} />
            Cuenta activa
          </label>
        )}
      </form>
    </Modal>
  );
}
