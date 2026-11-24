import ListaRecordatorios from "../recordatorios/ListaRecordatorios";

/** Caso de uso del administrador: supervisar los recordatorios de todo el sistema. */
export default function Supervision() {
  return (
    <div className="space-y-5">
      <div>
        <p className="migas">Administración / Recordatorios</p>
        <h1 className="titulo-pagina mt-1">Supervisión de recordatorios</h1>
        <p className="mt-1 text-tenue">Historial de envíos por correo, SMS y WhatsApp de todos los usuarios. Revisa los fallidos y reintenta.</p>
      </div>
      <ListaRecordatorios admin />
    </div>
  );
}
