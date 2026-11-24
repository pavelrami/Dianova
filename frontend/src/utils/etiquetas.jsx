/** Textos y colores de los catálogos del backend (enums). */

export const ROLES = {
  ADMIN: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export const PRIORIDAD = {
  ALTA: { texto: "Alta", clase: "bg-vino text-white" },
  MEDIA: { texto: "Media", clase: "bg-caramelo text-white" },
  BAJA: { texto: "Baja", clase: "bg-[#efe7dc] text-tinta" },
};

export const ESTADO_SEGUIMIENTO = {
  PENDIENTE: { texto: "Por empezar", clase: "bg-[#efe7dc] text-tinta" },
  EN_PROCESO: { texto: "En progreso", clase: "bg-mantequilla text-espresso" },
  COMPLETADA: { texto: "Completado", clase: "bg-salvia text-salvia-tinta" },
};

export const PUBLICACION = {
  BORRADOR: { texto: "Borrador", clase: "bg-[#efe7dc] text-tenue" },
  PUBLICADA: { texto: "Publicada", clase: "bg-salvia text-salvia-tinta" },
};

export const TIPO_EVENTO = {
  CLASE: { texto: "Clase", clase: "bg-caramelo-suave text-espresso", barra: "#BD9457" },
  EXAMEN: { texto: "Examen", clase: "bg-canela text-white", barra: "#8D532B" },
  ENTREGA: { texto: "Entrega", clase: "bg-vino text-white", barra: "#711B1A" },
  TALLER: { texto: "Taller", clase: "bg-mantequilla text-espresso", barra: "#D9A441" },
  ESTUDIO: { texto: "Grupo de estudio", clase: "bg-salvia text-salvia-tinta", barra: "#8FAF8B" },
  ASESORIA: { texto: "Asesoría", clase: "bg-salvia text-salvia-tinta", barra: "#8FAF8B" },
  SOCIAL: { texto: "Universitario", clase: "bg-[#efe1d6] text-canela", barra: "#B5653B" },
  PERSONAL: { texto: "Personal", clase: "bg-[#efe7dc] text-tinta", barra: "#76604F" },
};

export const ESTADO_EVENTO = {
  PROGRAMADO: { texto: "Programado", clase: "bg-mantequilla-suave text-espresso" },
  CANCELADO: { texto: "Cancelado", clase: "bg-vino-suave text-vino" },
  FINALIZADO: { texto: "Finalizado", clase: "bg-[#efe7dc] text-tenue" },
};

export const RESPUESTA = {
  PENDIENTE: { texto: "Sin responder", clase: "bg-[#efe7dc] text-tenue" },
  CONFIRMADA: { texto: "Asistiré", clase: "bg-salvia text-salvia-tinta" },
  RECHAZADA: { texto: "No asistiré", clase: "bg-vino-suave text-vino" },
};

export const CANAL = {
  EMAIL: { texto: "Correo" },
  SMS: { texto: "SMS" },
  WHATSAPP: { texto: "WhatsApp" },
};

export const ESTADO_RECORDATORIO = {
  PENDIENTE: { texto: "Pendiente", clase: "bg-mantequilla text-espresso" },
  ENVIADO: { texto: "Enviado", clase: "bg-salvia text-salvia-tinta" },
  FALLIDO: { texto: "Fallido", clase: "bg-vino-suave text-vino" },
  CANCELADO: { texto: "Cancelado", clase: "bg-[#efe7dc] text-tenue" },
};

export const ESTADO_INSCRIPCION = {
  ACTIVA: { texto: "Activa", clase: "bg-salvia text-salvia-tinta" },
  BAJA: { texto: "Baja", clase: "bg-vino-suave text-vino" },
  FINALIZADA: { texto: "Finalizada", clase: "bg-[#efe7dc] text-tenue" },
};

export function Insignia({ mapa, valor, className = "" }) {
  const m = mapa?.[valor];
  if (!m) return null;
  return <span className={`chip ${m.clase} ${className}`}>{m.texto}</span>;
}
