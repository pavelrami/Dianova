import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

/** Avisos en pantalla (reemplazan a alert()). Se cierran solos o con la X. */
const ToastContext = createContext(null);

const estilos = {
  exito: { icono: CheckCircle2, clase: "border-salvia bg-white", color: "text-salvia-tinta" },
  error: { icono: XCircle, clase: "border-vino/30 bg-white", color: "text-vino" },
  aviso: { icono: AlertTriangle, clase: "border-mantequilla bg-white", color: "text-canela" },
};

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const id = useRef(0);

  const cerrar = useCallback((clave) => setAvisos((a) => a.filter((x) => x.clave !== clave)), []);

  const mostrar = useCallback(
    (tipo, mensaje) => {
      const clave = ++id.current;
      setAvisos((a) => [...a.slice(-3), { clave, tipo, mensaje }]);
      setTimeout(() => cerrar(clave), tipo === "error" ? 6500 : 4200);
    },
    [cerrar]
  );

  const api = useMemo(
    () => ({
      exito: (m) => mostrar("exito", m),
      error: (m) => mostrar("error", m),
      aviso: (m) => mostrar("aviso", m),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed z-[80] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {avisos.map(({ clave, tipo, mensaje }) => {
          const { icono: Icono, clase, color } = estilos[tipo];
          return (
            <div
              key={clave}
              className={`pointer-events-auto animar-entrada flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-suave)] ${clase}`}
            >
              <Icono className={`mt-0.5 size-5 shrink-0 ${color}`} aria-hidden />
              <p className="flex-1 text-sm text-tinta">{mensaje}</p>
              <button
                type="button"
                onClick={() => cerrar(clave)}
                className="rounded-md p-1 text-tenue hover:bg-crema"
                aria-label="Cerrar aviso"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
