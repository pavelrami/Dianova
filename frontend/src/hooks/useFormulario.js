import { useCallback, useState } from "react";

/**
 * Manejo de formularios con validación EN TIEMPO REAL y AL ENVIAR.
 * - Al escribir: se valida el campo que cambia (y los que ya mostraban error, por si dependen de él).
 * - Al salir del campo (blur): se valida aunque no se haya escrito nada.
 * - Al enviar: se validan todos y cada error aparece bajo su input.
 * - Los errores 400/422 del backend se pintan bajo el campo correspondiente con ponerErroresServidor().
 */
export default function useFormulario(inicial, reglas = {}) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});

  const validarCampo = useCallback(
    (nombre, todos) => {
      for (const regla of reglas[nombre] || []) {
        const msg = regla(todos[nombre], todos);
        if (msg) return msg;
      }
      return null;
    },
    [reglas]
  );

  const establecer = useCallback(
    (nombre, valor) => {
      const nuevos = { ...valores, [nombre]: valor };
      setValores(nuevos);
      setErrores((errs) => {
        const sig = { ...errs, [nombre]: validarCampo(nombre, nuevos) };
        for (const campo of Object.keys(errs)) {
          if (campo !== nombre && errs[campo] && reglas[campo]) sig[campo] = validarCampo(campo, nuevos);
        }
        return sig;
      });
    },
    [valores, reglas, validarCampo]
  );

  const campo = useCallback(
    (nombre) => ({
      nombre,
      value: valores[nombre] ?? "",
      error: errores[nombre] || undefined,
      onChange: (e) => establecer(nombre, e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e),
      onBlur: () => setErrores((errs) => ({ ...errs, [nombre]: validarCampo(nombre, valores) })),
    }),
    [valores, errores, establecer, validarCampo]
  );

  const validarTodo = useCallback(() => {
    const nuevos = {};
    for (const nombre of Object.keys(reglas)) {
      const msg = validarCampo(nombre, valores);
      if (msg) nuevos[nombre] = msg;
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length) {
      // lleva el foco al primer campo con error
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return false;
    }
    return true;
  }, [reglas, valores, validarCampo]);

  const ponerErroresServidor = useCallback((err) => {
    if (err?.errores && Object.keys(err.errores).length) {
      setErrores((e) => ({ ...e, ...err.errores }));
      return true;
    }
    return false;
  }, []);

  const reiniciar = useCallback((nuevo) => {
    setValores(nuevo ?? inicial);
    setErrores({});
  }, [inicial]);

  return { valores, errores, campo, establecer, validarTodo, ponerErroresServidor, reiniciar, setValores };
}
