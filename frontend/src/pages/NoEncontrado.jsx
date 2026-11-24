import { Link } from "react-router-dom";
import { Simbolo } from "../components/ui/Logo";

export default function NoEncontrado({ interno = false }) {
  return (
    <div className={`grid place-items-center px-4 ${interno ? "py-16" : "min-h-svh bg-crema"}`}>
      <div className="max-w-md text-center">
        <Simbolo className="mx-auto size-16" fondo />
        <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-canela">Error 404</p>
        <h1 className="mt-1 text-2xl font-bold text-tinta">Esta página no existe</h1>
        <p className="mt-2 text-sm text-tenue">Puede que el enlace esté incompleto o que la página se haya movido.</p>
        <Link to={interno ? "/app" : "/"} className="mt-6 inline-flex h-11 items-center rounded-xl bg-vino px-5 text-sm font-semibold text-white hover:bg-vino-press">
          {interno ? "Volver al resumen" : "Ir al inicio"}
        </Link>
      </div>
    </div>
  );
}
