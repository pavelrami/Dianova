import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/** Si una pantalla falla al dibujarse, muestra un aviso en lugar de dejar la app en blanco. */
export default class LimiteError extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[dianova] error de interfaz", error, info?.componentStack);
  }

  componentDidUpdate(prev) {
    if (prev.clave !== this.props.clave && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto mt-10 max-w-md rounded-3xl border border-linea bg-white p-8 text-center" role="alert">
        <AlertTriangle className="mx-auto size-8 text-vino" aria-hidden />
        <h1 className="mt-3 text-xl font-bold text-tinta">Algo salió mal en esta pantalla</h1>
        <p className="mt-2 text-sm text-tenue">Recarga la página. Si sigue pasando, avísale al administrador.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-vino px-5 text-sm font-semibold text-white hover:bg-vino-press">
          <RefreshCw className="size-4" aria-hidden /> Recargar
        </button>
      </div>
    );
  }
}
