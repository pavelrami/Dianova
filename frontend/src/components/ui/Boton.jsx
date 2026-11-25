import { Loader2 } from "lucide-react";

const TONO_BOTON_CLARO = "#7a4924";
const TONO_CREMITA = "#faf6ee";
const TONO_CANELA = "#dcc6a3";

const variantes = {
  primario: "active:scale-[.98] hover:brightness-105",
  secundario: "bg-white text-tinta border border-linea hover:border-caramelo hover:bg-crema-2",
  suave: "hover:brightness-95",
  fantasma: "text-tinta hover:bg-caramelo-suave/60",
  peligro: "bg-error text-white hover:bg-[#8f1e18]",
  oscuro: "hover:brightness-105",
};

const estilosVariante = {
  primario: { backgroundColor: TONO_BOTON_CLARO, color: TONO_CREMITA },
  suave: { backgroundColor: TONO_CANELA, color: "#1f1916" },
  oscuro: { backgroundColor: TONO_BOTON_CLARO, color: TONO_CREMITA },
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
  style,
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
      style={{ ...estilosVariante[variante], ...style }}
      className={`inline-flex items-center justify-center rounded-sm font-semibold transition-[background,transform,border-color,color,filter] duration-200 disabled:opacity-60 disabled:cursor-not-allowed select-none ${variantes[variante]} ${tamanos[tamano]} ${className}`}
      {...props}
    >
      {cargando ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icono ? <Icono className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
}