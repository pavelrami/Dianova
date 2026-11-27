import { useEffect, useId, useState } from "react";
import { AlertCircle, RotateCw } from "lucide-react";

/**
 * Campo para el código de 6 dígitos que llega por correo o SMS.
 * Solo acepta números y permite pegar el código completo. autoComplete="one-time-code"
 * hace que los teléfonos ofrezcan el código del SMS automáticamente.
 */
export default function CampoCodigo({ valor, onCambio, error, disabled, autoFocus = true }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-tinta">
        Código de verificación
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onCambio(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        placeholder="••••••"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-14 w-full rounded-xl border bg-white text-center font-mono text-2xl font-bold tracking-[0.5em] text-espresso outline-none transition-colors placeholder:text-tenue/40 focus:ring-2 focus:ring-mantequilla ${
          error ? "border-error" : "border-linea focus:border-caramelo"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[13px] text-error" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

/** Botón "Reenviar código" con cuenta regresiva. `segundos` se reinicia cada vez que cambia `reinicio`. */
export function ReenviarCodigo({ segundos = 60, reinicio, onReenviar }) {
  const [restantes, setRestantes] = useState(segundos);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => setRestantes(segundos), [segundos, reinicio]);
  useEffect(() => {
    if (restantes <= 0) return undefined;
    const t = setTimeout(() => setRestantes((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restantes]);

  const reenviar = async () => {
    setEnviando(true);
    try {
      await onReenviar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <p className="text-center text-sm text-tenue">
      ¿No te llegó?{" "}
      {restantes > 0 ? (
        <span>Puedes pedir otro en {restantes} s</span>
      ) : (
        <button type="button" onClick={reenviar} disabled={enviando} className="inline-flex items-center gap-1 font-semibold text-vino hover:underline disabled:opacity-60">
          <RotateCw className={`size-3.5 ${enviando ? "animate-spin" : ""}`} aria-hidden /> Reenviar código
        </button>
      )}
    </p>
  );
}
