import type { Estado, Foto, NuevaQueja, Queja } from "../types.js";

/** Contrato de persistencia de quejas. La implementación real usa Firestore. */
export interface QuejasRepo {
  create(datos: NuevaQueja, foto?: Foto): Promise<Queja>;
  /** Las quejas más recientes primero, hasta `limit`. */
  list(limit: number): Promise<Queja[]>;
  get(folio: string): Promise<Queja | null>;
  getFoto(folio: string): Promise<Foto | null>;
  updateEstado(folio: string, estado: Estado, nota?: string): Promise<Queja | null>;
}

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos (0/O, 1/I)

export function generarFolio(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(8));
  return "QC-" + Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}
