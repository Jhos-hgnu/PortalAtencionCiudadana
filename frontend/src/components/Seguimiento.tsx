import { useState, type FormEvent } from "react";
import { api } from "../api";
import { CATEGORIAS, type SeguimientoPublico } from "../lib/types";
import { fechaHora } from "../lib/format";
import { Alert, btnPrimary, Card, EstadoBadge, inputClass, Spinner } from "./ui";

/** Consulta pública del estado de un reporte a partir de su folio. */
export default function Seguimiento() {
  const [folio, setFolio] = useState("");
  const [resultado, setResultado] = useState<SeguimientoPublico | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function consultar(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResultado(null);
    const f = folio.trim().toUpperCase();
    if (!/^QC-[A-Z0-9]{8}$/.test(f)) return setError("El folio tiene el formato QC-XXXXXXXX");
    setCargando(true);
    try {
      setResultado(await api<SeguimientoPublico>(`/quejas/${f}/estado`));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-guinda-oscuro">Consulta tu folio</h2>
      <p className="mb-4 mt-1 text-sm text-texto/70">Revisa en qué estado se encuentra tu reporte.</p>
      <form onSubmit={consultar} className="flex gap-2" noValidate>
        <input
          className={`${inputClass(error)} font-mono uppercase`}
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          placeholder="QC-XXXXXXXX"
          maxLength={11}
          aria-label="Folio del reporte"
        />
        <button className={btnPrimary} disabled={cargando}>
          {cargando ? <Spinner /> : "Buscar"}
        </button>
      </form>

      {error && (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      )}
      {resultado && (
        <dl className="mt-4 space-y-2 rounded-lg bg-gris-verdoso p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="font-medium">Estado</dt>
            <dd><EstadoBadge estado={resultado.estado} /></dd>
          </div>
          <div className="flex justify-between gap-2"><dt className="font-medium">Asunto</dt><dd className="text-right">{resultado.asunto}</dd></div>
          <div className="flex justify-between gap-2"><dt className="font-medium">Categoría</dt><dd>{CATEGORIAS[resultado.categoria]}</dd></div>
          <div className="flex justify-between gap-2"><dt className="font-medium">Registrado</dt><dd>{fechaHora(resultado.createdAt)}</dd></div>
          <div className="flex justify-between gap-2"><dt className="font-medium">Última actualización</dt><dd>{fechaHora(resultado.updatedAt)}</dd></div>
        </dl>
      )}
    </Card>
  );
}
