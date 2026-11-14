import type { Foto, Queja } from "../types.js";
import { generarFolio, type QuejasRepo } from "./types.js";

/**
 * Persistencia en memoria. SOLO para desarrollo local sin credenciales de Firebase y para pruebas
 * automáticas; en producción la aplicación se niega a arrancar sin Firebase (ver repositories/index.ts).
 */
export function createMemoryRepo(): QuejasRepo {
  const quejas = new Map<string, Queja>();
  const fotos = new Map<string, Foto>();
  return {
    async create(datos, foto) {
      const ahora = new Date().toISOString();
      let folio = generarFolio();
      while (quejas.has(folio)) folio = generarFolio();
      const queja: Queja = { ...datos, folio, estado: "pendiente", tieneFoto: Boolean(foto), createdAt: ahora, updatedAt: ahora };
      quejas.set(folio, queja);
      if (foto) fotos.set(folio, foto);
      return queja;
    },
    async list(limit) {
      return [...quejas.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
    },
    async get(folio) {
      return quejas.get(folio) ?? null;
    },
    async getFoto(folio) {
      return fotos.get(folio) ?? null;
    },
    async updateEstado(folio, estado, nota) {
      const q = quejas.get(folio);
      if (!q) return null;
      const actualizada = { ...q, estado, notaInterna: nota, updatedAt: new Date().toISOString() };
      quejas.set(folio, actualizada);
      return actualizada;
    },
  };
}
