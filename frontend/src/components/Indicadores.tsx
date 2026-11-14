import { CATEGORIAS, type Categoria, type Resumen } from "../lib/types";
import { Card } from "./ui";

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gris-medio bg-white p-4 shadow-sm" style={{ borderTop: `4px solid ${color}` }}>
      <p className="text-xs font-medium uppercase tracking-wide text-texto/60">{label}</p>
      <p className="mt-1 text-3xl font-bold text-texto">{value}</p>
    </div>
  );
}

export default function Indicadores({ resumen }: { resumen: Resumen }) {
  const max = Math.max(1, ...Object.values(resumen.porCategoria));
  const categorias = (Object.entries(resumen.porCategoria) as [Categoria, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Total de reportes" value={resumen.total} color="var(--guinda)" />
        <Stat label="Pendientes" value={resumen.porEstado.pendiente} color="var(--dorado)" />
        <Stat label="En proceso" value={resumen.porEstado.en_proceso} color="var(--verde)" />
        <Stat label="Resueltas" value={resumen.porEstado.resuelta} color="var(--verde)" />
        <Stat label="Últimos 7 días" value={resumen.ultimos7dias} color="var(--guinda-oscuro)" />
      </div>
      {categorias.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-guinda-oscuro">Reportes por categoría</h2>
          <ul className="space-y-2">
            {categorias.map(([cat, n]) => (
              <li key={cat} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 truncate">{CATEGORIAS[cat]}</span>
                <div className="h-3 flex-1 rounded-full bg-gris-claro">
                  <div className="h-3 rounded-full bg-guinda" style={{ width: `${(n / max) * 100}%` }} />
                </div>
                <span className="w-8 text-right font-semibold">{n}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
