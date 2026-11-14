import { useState } from "react";
import { fechaHora } from "../lib/format";
import type { Confirmacion } from "../lib/types";
import { btnPrimary, btnSecondary, Card } from "./ui";

export default function ConfirmacionCard({ data, onNuevo }: { data: Confirmacion; onNuevo: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(data.folio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sin permiso de portapapeles */
    }
  };
  return (
    <Card className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verde text-3xl text-white" aria-hidden>
        ✓
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-verde">¡Reporte registrado!</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-texto/80">{data.mensaje}</p>
      <div className="mx-auto mt-5 max-w-xs rounded-xl border-2 border-dashed border-dorado bg-crema px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-texto/60">Tu folio</p>
        <p className="font-mono text-3xl font-bold tracking-wider text-guinda-oscuro">{data.folio}</p>
        <p className="mt-1 text-xs text-texto/60">Registrado el {fechaHora(data.createdAt)}</p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button className={btnSecondary} onClick={copiar}>
          {copiado ? "¡Copiado!" : "Copiar folio"}
        </button>
        <button className={btnPrimary} onClick={onNuevo}>
          Registrar otro reporte
        </button>
      </div>
    </Card>
  );
}
