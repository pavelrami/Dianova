import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function NoAutorizado() {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl border border-linea bg-white p-8 text-center shadow-[var(--shadow-tarjeta)]">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-vino-suave text-vino">
        <ShieldAlert className="size-7" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-canela">Error 403</p>
      <h1 className="mt-1 text-2xl font-bold text-tinta">Esta sección no es para tu rol</h1>
      <p className="mt-2 text-sm text-tenue">Tu cuenta no tiene permiso para ver esta página. Si crees que es un error, contacta al administrador.</p>
      <Link to="/app" className="mt-6 inline-flex h-11 items-center rounded-xl bg-vino px-5 text-sm font-semibold text-white hover:bg-vino-press">
        Volver al resumen
      </Link>
    </div>
  );
}
