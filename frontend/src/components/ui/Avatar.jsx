import { useState } from "react";

/** Imagen de perfil o, si no hay (o falla), un avatar por defecto con las iniciales. */
export default function Avatar({ nombre = "", url, tamano = "size-10", className = "" }) {
  const [fallo, setFallo] = useState(false);
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  if (url && !fallo) {
    return <img src={url} alt="" onError={() => setFallo(true)} className={`${tamano} shrink-0 rounded-full object-cover ring-2 ring-white ${className}`} />;
  }
  return (
    <span
      aria-hidden
      className={`${tamano} grid shrink-0 place-items-center rounded-full bg-mantequilla font-semibold text-espresso ring-2 ring-white text-sm ${className}`}
    >
      {iniciales || "?"}
    </span>
  );
}
