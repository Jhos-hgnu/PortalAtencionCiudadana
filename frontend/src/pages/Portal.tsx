import { useState } from "react";
import ConfirmacionCard from "../components/ConfirmacionCard";
import ReporteForm from "../components/ReporteForm";
import Seguimiento from "../components/Seguimiento";
import type { Confirmacion } from "../lib/types";

export default function Portal() {
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-guinda-oscuro">Portal de Atención Ciudadana</h1>
        <p className="mt-1 text-texto/80">Reporta problemas de tu comunidad y da seguimiento a su atención.</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        {confirmacion ? (
          <ConfirmacionCard data={confirmacion} onNuevo={() => setConfirmacion(null)} />
        ) : (
          <ReporteForm
            onEnviado={(c) => {
              setConfirmacion(c);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
        <Seguimiento />
      </div>
    </div>
  );
}
