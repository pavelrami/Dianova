import { Check, Circle } from "lucide-react";
import { REGLAS_CONTRASENA } from "../../utils/validaciones";

/** Lista de requisitos bajo el input de contraseña, marcada en tiempo real. */
export default function ReglasContrasena({ valor = "" }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1" aria-label="Requisitos de la contraseña">
      {REGLAS_CONTRASENA.map((r) => {
        const ok = r.ok(valor);
        return (
          <li key={r.id} className={`flex items-center gap-1.5 text-xs ${ok ? "text-salvia-tinta" : "text-tenue"}`}>
            {ok ? <Check className="size-3.5" aria-hidden /> : <Circle className="size-3" aria-hidden />}
            <span>{r.texto}</span>
            <span className="sr-only">{ok ? "cumplido" : "pendiente"}</span>
          </li>
        );
      })}
    </ul>
  );
}
