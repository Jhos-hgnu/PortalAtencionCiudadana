import type { ReactNode } from "react";
import { ESTADOS, type Estado } from "../lib/types";

const ESTILOS: Record<Estado, string> = {
  pendiente: "bg-dorado/20 text-[#7a5a24] ring-dorado/40",
  en_proceso: "bg-gris-verdoso text-verde ring-verde/30",
  resuelta: "bg-verde text-white ring-verde",
  rechazada: "bg-guinda/10 text-guinda-oscuro ring-guinda/30",
};

export function EstadoBadge({ estado }: { estado: Estado }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${ESTILOS[estado]}`}>{ESTADOS[estado]}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-gris-medio bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-texto">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1 block text-xs font-medium text-guinda">{error}</span> : hint && <span className="mt-1 block text-xs text-texto/60">{hint}</span>}
    </label>
  );
}

export const inputClass = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm text-texto outline-none transition focus:ring-2 ${
    error ? "border-guinda focus:ring-guinda/30" : "border-gris-medio focus:border-verde focus:ring-verde/25"
  }`;

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-guinda px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-guinda-oscuro disabled:cursor-not-allowed disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gris-medio bg-white px-4 py-2 text-sm font-medium text-texto transition hover:bg-gris-claro disabled:opacity-60";

export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-label="Cargando" />;
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "ok" }) {
  const c = tone === "error" ? "border-guinda/30 bg-guinda/5 text-guinda-oscuro" : "border-verde/30 bg-gris-verdoso text-verde";
  return <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${c}`}>{children}</div>;
}
