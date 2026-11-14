import { db } from "../firebase.js";
import type { Estado, Foto, NuevaQueja, Queja } from "../types.js";
import { generarFolio, type QuejasRepo } from "./types.js";

// Colecciones: "quejas" (datos) y "fotos" (binario aparte, para que los listados sean ligeros).
const QUEJAS = "quejas";
const FOTOS = "fotos";
const ALREADY_EXISTS = 6;

export const firestoreRepo: QuejasRepo = {
  async create(datos: NuevaQueja, foto?: Foto) {
    const ahora = new Date().toISOString();
    for (let intento = 0; intento < 5; intento++) {
      const folio = generarFolio();
      const queja: Queja = { ...datos, folio, estado: "pendiente", tieneFoto: Boolean(foto), createdAt: ahora, updatedAt: ahora };
      const batch = db().batch();
      batch.create(db().collection(QUEJAS).doc(folio), queja);
      if (foto) batch.create(db().collection(FOTOS).doc(folio), { mime: foto.mime, data: foto.data });
      try {
        await batch.commit();
        return queja;
      } catch (e) {
        if ((e as { code?: number }).code !== ALREADY_EXISTS) throw e; // colisión de folio: reintenta
      }
    }
    throw new Error("No fue posible generar un folio único");
  },

  async list(limit) {
    const snap = await db().collection(QUEJAS).orderBy("createdAt", "desc").limit(limit).get();
    return snap.docs.map((d) => d.data() as Queja);
  },

  async get(folio) {
    const doc = await db().collection(QUEJAS).doc(folio).get();
    return doc.exists ? (doc.data() as Queja) : null;
  },

  async getFoto(folio) {
    const doc = await db().collection(FOTOS).doc(folio).get();
    if (!doc.exists) return null;
    const { mime, data } = doc.data() as { mime: string; data: Buffer | Uint8Array };
    return { mime, data: Buffer.from(data) };
  },

  async updateEstado(folio, estado: Estado, nota) {
    const ref = db().collection(QUEJAS).doc(folio);
    const doc = await ref.get();
    if (!doc.exists) return null;
    await ref.update({ estado, notaInterna: nota ?? null, updatedAt: new Date().toISOString() });
    return (await ref.get()).data() as Queja;
  },
};
