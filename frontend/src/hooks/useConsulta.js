import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ejecuta una petición a la API y expone { datos, cargando, error, recargar }.
 * Se vuelve a ejecutar cuando cambian las dependencias (filtros, página...) y
 * cancela la petición anterior para no mezclar respuestas.
 */
export default function useConsulta(fn, deps = [], { activo = true } = {}) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(activo);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!activo) return undefined;
    const ctrl = new AbortController();
    setCargando(true);
    setError(null);
    fnRef
      .current(ctrl.signal)
      .then((d) => {
        if (!ctrl.signal.aborted) setDatos(d);
      })
      .catch((e) => {
        if (!ctrl.signal.aborted && !e?.cancelado) setError(e);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCargando(false);
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, activo]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { datos, cargando, error, recargar, setDatos };
}

/** Retrasa un valor (búsqueda mientras se escribe) para no saturar la API. */
export function useRetraso(valor, ms = 350) {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return v;
}
