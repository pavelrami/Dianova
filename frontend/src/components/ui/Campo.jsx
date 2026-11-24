import { useId, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const base =
  "w-full rounded-xl border bg-white px-3.5 text-[15px] text-tinta placeholder:text-tenue/70 transition-colors outline-none focus:ring-2 focus:ring-mantequilla";

/**
 * Campo de formulario con etiqueta y mensaje de error DEBAJO del input (nunca alert()).
 * como="input" | "select" | "textarea"
 */
export default function Campo({
  etiqueta,
  nombre,
  error,
  ayuda,
  como = "input",
  type = "text",
  className = "",
  children,
  icono: Icono,
  opcional,
  ...props
}) {
  const id = useId();
  const [ver, setVer] = useState(false);
  const esPassword = type === "password";
  const borde = error ? "border-error focus:border-error" : "border-linea focus:border-caramelo";
  const descr = error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined;
  const comunes = {
    id,
    name: nombre,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": descr,
    ...props,
  };

  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-tinta">
          {etiqueta} {opcional && <span className="font-normal text-tenue">(opcional)</span>}
        </label>
      )}
      <div className="relative">
        {Icono && <Icono className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tenue" aria-hidden />}
        {como === "select" ? (
          <select className={`${base} ${borde} h-11 ${Icono ? "pl-9" : ""} pr-8`} {...comunes}>
            {children}
          </select>
        ) : como === "textarea" ? (
          <textarea className={`${base} ${borde} py-2.5 min-h-24 resize-y`} {...comunes} />
        ) : (
          <input
            type={esPassword && ver ? "text" : type}
            className={`${base} ${borde} h-11 ${Icono ? "pl-9" : ""} ${esPassword ? "pr-11" : ""}`}
            {...comunes}
          />
        )}
        {esPassword && (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-tenue hover:text-tinta"
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[13px] text-error" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="mt-1.5 text-[13px] text-tenue">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

/** Interruptor accesible (para preferencias de notificación). */
export function Interruptor({ etiqueta, descripcion, checked, onChange, error, disabled }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
        <span>
          <span className="block text-sm font-medium text-tinta">{etiqueta}</span>
          {descripcion && <span className="block text-[13px] text-tenue">{descripcion}</span>}
        </span>
        <span className="relative mt-0.5 inline-flex">
          <input
            id={id}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="h-6 w-11 rounded-full bg-linea transition-colors peer-checked:bg-vino peer-disabled:opacity-50" />
          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
      {error && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-error" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}
