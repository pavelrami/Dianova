import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import Boton from "./Boton";

/** Ventana modal accesible: se cierra con Escape o el botón X y bloquea el scroll de fondo. */
export default function Modal({ abierto, onCerrar, titulo, descripcion, children, pie, ancho = "max-w-lg" }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.activeElement;
    const esc = (e) => e.key === "Escape" && onCerrar?.();
    document.addEventListener("keydown", esc);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const foco = panel.current?.querySelector("input, select, textarea, button:not([data-cerrar])");
      (foco || panel.current)?.focus();
    });
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" data-lenis-prevent>
      <div className="absolute inset-0 bg-espresso/45 backdrop-blur-[2px]" onClick={onCerrar} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`animar-entrada relative w-full ${ancho} max-h-[92svh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl outline-none`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-linea bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-tinta">{titulo}</h2>
            {descripcion && <p className="mt-0.5 text-sm text-tenue">{descripcion}</p>}
          </div>
          <button
            type="button"
            data-cerrar
            onClick={onCerrar}
            className="-mr-2 rounded-lg p-2 text-tenue hover:bg-crema hover:text-tinta"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
        {pie && <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-linea bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{pie}</div>}
      </div>
    </div>,
    document.body
  );
}

/** Confirmación para acciones destructivas o importantes (reemplaza a window.confirm). */
export function ConfirmarModal({ abierto, onCerrar, onConfirmar, titulo, mensaje, textoConfirmar = "Confirmar", peligro = false, cargando = false }) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={cargando ? undefined : onCerrar}
      titulo={titulo}
      ancho="max-w-md"
      pie={
        <>
          <Boton variante="secundario" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Boton>
          <Boton variante={peligro ? "peligro" : "primario"} onClick={onConfirmar} cargando={cargando}>
            {textoConfirmar}
          </Boton>
        </>
      }
    >
      <div className="flex gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full ${peligro ? "bg-vino-suave text-vino" : "bg-mantequilla-suave text-canela"}`}>
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <div className="text-sm leading-relaxed text-tinta">{mensaje}</div>
      </div>
    </Modal>
  );
}
