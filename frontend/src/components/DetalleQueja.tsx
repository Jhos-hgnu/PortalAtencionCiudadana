import { useEffect, useState } from "react";
import { adminApi, adminFoto, ApiError } from "../api";
import { fechaHora } from "../lib/format";
import { CATEGORIAS, ESTADOS, type Estado, type Queja } from "../lib/types";
import { Alert, btnPrimary, btnSecondary, EstadoBadge, inputClass, Spinner } from "./ui";

interface Props {
  queja: Queja;
  onClose: () => void;
  onActualizada: (q: Queja) => void;
  onNoAutorizado: () => void;
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-texto/55">{label}</dt>
      <dd className="mt-0.5 break-words text-sm">{children || <span className="text-texto/40">—</span>}</dd>
    </div>
  );
}

export default function DetalleQueja({ queja, onClose, onActualizada, onNoAutorizado }: Props) {
  const [foto, setFoto] = useState("");
  const [fotoError, setFotoError] = useState("");
  const [estado, setEstado] = useState<Estado>(queja.estado);
  const [nota, setNota] = useState(queja.notaInterna ?? "");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ tono: "ok" | "error"; texto: string } | null>(null);

  // Cierra con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Descarga la fotografía (requiere el header de admin) y libera la URL al cerrar
  useEffect(() => {
    if (!queja.tieneFoto) return;
    let url = "";
    let activo = true;
    adminFoto(queja.folio)
      .then((u) => { url = u; if (activo) setFoto(u); })
      .catch((e) => activo && setFotoError((e as Error).message));
    return () => { activo = false; if (url) URL.revokeObjectURL(url); };
  }, [queja.folio, queja.tieneFoto]);

  async function guardar() {
    setGuardando(true);
    setMsg(null);
    try {
      const actualizada = await adminApi<Queja>(`/quejas/${queja.folio}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado, nota }),
      });
      onActualizada(actualizada);
      setMsg({ tono: "ok", texto: "Cambios guardados correctamente" });
    } catch (e) {
      if ((e as ApiError).status === 401) return onNoAutorizado();
      setMsg({ tono: "error", texto: (e as Error).message });
    } finally {
      setGuardando(false);
    }
  }

  const sinCambios = estado === queja.estado && nota.trim() === (queja.notaInterna ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detalle del reporte ${queja.folio}`}>
      <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b-4 border-dorado bg-guinda px-5 py-4 text-white">
          <div>
            <p className="font-mono text-xs text-white/80">{queja.folio}</p>
            <h2 className="text-lg font-semibold leading-snug">{queja.asunto}</h2>
          </div>
          <button onClick={onClose} className="rounded-md px-2 text-2xl leading-none text-white/80 hover:bg-white/10 hover:text-white" aria-label="Cerrar">×</button>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <EstadoBadge estado={queja.estado} />
              <span className="text-sm text-texto/70">{CATEGORIAS[queja.categoria]}</span>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-texto/55">Descripción original</p>
              <p className="whitespace-pre-wrap rounded-lg bg-crema p-3 text-sm leading-relaxed">{queja.descripcion}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <Dato label="Ubicación">{queja.ubicacion}</Dato>
              <Dato label="Ciudadano">{queja.nombre}</Dato>
              <Dato label="Correo">{queja.email}</Dato>
              <Dato label="Teléfono">{queja.telefono}</Dato>
              <Dato label="Registrado">{fechaHora(queja.createdAt)}</Dato>
              <Dato label="Actualizado">{fechaHora(queja.updatedAt)}</Dato>
            </dl>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-texto/55">Fotografía</p>
              {!queja.tieneFoto ? (
                <div className="grid h-40 place-items-center rounded-lg border border-dashed border-gris-medio bg-gris-claro text-sm text-texto/50">Sin fotografía adjunta</div>
              ) : fotoError ? (
                <Alert>{fotoError}</Alert>
              ) : foto ? (
                <a href={foto} target="_blank" rel="noreferrer" title="Abrir en tamaño completo">
                  <img src={foto} alt={`Fotografía del reporte ${queja.folio}`} className="max-h-72 w-full rounded-lg border border-gris-medio bg-gris-claro object-contain" />
                </a>
              ) : (
                <div className="grid h-40 place-items-center rounded-lg bg-gris-claro text-texto/60"><Spinner /></div>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-gris-medio bg-gris-verdoso p-3">
              <p className="text-sm font-semibold text-verde">Gestión del reporte</p>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Estado</span>
                <select className={inputClass()} value={estado} onChange={(e) => setEstado(e.target.value as Estado)}>
                  {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Nota interna</span>
                <textarea className={inputClass()} rows={3} maxLength={500} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Observaciones del personal (no visibles al ciudadano)" />
              </label>
              {msg && <Alert tone={msg.tono}>{msg.texto}</Alert>}
              <div className="flex justify-end gap-2">
                <button className={btnSecondary} onClick={onClose}>Cerrar</button>
                <button className={btnPrimary} onClick={guardar} disabled={guardando || sinCambios}>
                  {guardando && <Spinner />} Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
