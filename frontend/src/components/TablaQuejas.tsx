import { fechaCorta } from "../lib/format";
import { CATEGORIAS, type Listado, type Queja } from "../lib/types";
import { btnSecondary, EstadoBadge } from "./ui";

interface Props {
  data: Listado;
  cargando: boolean;
  onSelect: (q: Queja) => void;
  onPage: (p: number) => void;
}

export default function TablaQuejas({ data, cargando, onSelect, onPage }: Props) {
  const paginas = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className={`overflow-hidden rounded-xl border border-gris-medio bg-white shadow-sm transition ${cargando ? "opacity-60" : ""}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-guinda-oscuro text-xs uppercase tracking-wide text-white">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Asunto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Ciudadano</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-center">Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-medio">
            {data.items.map((q) => (
              <tr key={q.folio} onClick={() => onSelect(q)} className="cursor-pointer odd:bg-white even:bg-crema/60 hover:bg-gris-verdoso">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-guinda-oscuro">
                  <button className="hover:underline focus:outline-none focus-visible:underline" onClick={(e) => { e.stopPropagation(); onSelect(q); }}>
                    {q.folio}
                  </button>
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-medium">{q.asunto}</td>
                <td className="px-4 py-3">{CATEGORIAS[q.categoria]}</td>
                <td className="px-4 py-3">{q.nombre}</td>
                <td className="whitespace-nowrap px-4 py-3">{fechaCorta(q.createdAt)}</td>
                <td className="px-4 py-3"><EstadoBadge estado={q.estado} /></td>
                <td className="px-4 py-3 text-center">{q.tieneFoto ? "📷" : <span className="text-texto/30">—</span>}</td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-texto/60">
                  {cargando ? "Cargando…" : "No hay reportes que coincidan con los filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-gris-medio bg-white px-4 py-3 text-sm">
        <span className="text-texto/70">{data.total} reporte{data.total === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2">
          <button className={btnSecondary} disabled={data.page <= 1 || cargando} onClick={() => onPage(data.page - 1)}>Anterior</button>
          <span>Página {data.page} de {paginas}</span>
          <button className={btnSecondary} disabled={data.page >= paginas || cargando} onClick={() => onPage(data.page + 1)}>Siguiente</button>
        </div>
      </div>
    </div>
  );
}
