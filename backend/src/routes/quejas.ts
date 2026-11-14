import { Router } from "express";
import { HttpError, parse } from "../errors.js";
import { consultaLimiter, crearQuejaLimiter } from "../middleware/limiters.js";
import { upload } from "../middleware/upload.js";
import type { QuejasRepo } from "../repositories/types.js";
import { CATEGORIAS, ESTADOS, type Foto } from "../types.js";
import { detectImageMime, folioSchema, nuevaQuejaSchema } from "../validation.js";

/** Rutas públicas del portal ciudadano. Nunca exponen datos personales de otras quejas. */
export function quejasRouter(repo: QuejasRepo) {
  const router = Router();

  // Catálogos para que el frontend no duplique constantes
  router.get("/meta", (_req, res) => res.json({ categorias: CATEGORIAS, estados: ESTADOS }));

  router.post("/", crearQuejaLimiter, upload.single("foto"), async (req, res) => {
    const datos = parse(nuevaQuejaSchema, req.body);

    let foto: Foto | undefined;
    if (req.file) {
      const mime = detectImageMime(req.file.buffer);
      if (!mime) throw new HttpError(400, "La fotografía no es una imagen válida", { foto: "El archivo no es una imagen JPG, PNG o WebP válida" });
      foto = { mime, data: req.file.buffer };
    }

    const queja = await repo.create(datos, foto);
    res.status(201).json({
      folio: queja.folio,
      estado: queja.estado,
      createdAt: queja.createdAt,
      mensaje: "Tu reporte fue registrado correctamente. Conserva tu folio para consultar su estado.",
    });
  });

  // Seguimiento por folio: solo información no sensible
  router.get("/:folio/estado", consultaLimiter, async (req, res) => {
    const folio = parse(folioSchema, req.params.folio);
    const q = await repo.get(folio);
    if (!q) throw new HttpError(404, "No se encontró un reporte con ese folio");
    res.json({ folio: q.folio, estado: q.estado, categoria: q.categoria, asunto: q.asunto, createdAt: q.createdAt, updatedAt: q.updatedAt });
  });

  return router;
}
