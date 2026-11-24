import { Loader2 } from "lucide-react";

const variantes = {
  primario: "bg-vino text-white hover:bg-vino-press active:scale-[.98] shadow-[0_6px_16px_-8px_rgb(113_27_26/.7)]",
  secundario: "bg-white text-tinta border border-linea hover:border-caramelo hover:bg-crema-2",
  suave: "bg-mantequilla text-tinta hover:bg-[#ffdb8a]",
  fantasma: "text-tinta hover:bg-caramelo-suave/60",
  peligro: "bg-error text-white hover:bg-[#8f1e18]",
  oscuro: "bg-espresso text-mantequilla hover:bg-[#341e10]",
};

const tamanos = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icono: "size-10 justify-center",
};

/** Botón de la marca. Con cargando=true se deshabilita y muestra un indicador (loading state). */
export default function Boton({
  variante = "primario",
  tamano = "md",
  cargando = false,
  icono: Icono,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-[background,transform,border-color,color] duration-200 disabled:opacity-60 disabled:cursor-not-allowed select-none ${variantes[variante]} ${tamanos[tamano]} ${className}`}
      {...props}
    >
      {cargando ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icono ? <Icono className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
}
