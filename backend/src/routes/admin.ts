import { Router } from "express";
import { HttpError, parse } from "../errors.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { adminFailLimiter } from "../middleware/limiters.js";
import type { QuejasRepo } from "../repositories/types.js";
import { CATEGORIAS, ESTADOS, type Queja } from "../types.js";
import { cambioEstadoSchema, folioSchema, listadoQuerySchema } from "../validation.js";

/** Cuántas quejas recientes se consideran para listados e indicadores (evita índices compuestos en Firestore). */
const VENTANA = 500;

const normaliza = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Rutas del Panel de Administración Municipal. Todas requieren x-admin-key. */
export function adminRouter(repo: QuejasRepo) {
  const router = Router();
  router.use(adminFailLimiter, adminAuth);

  // Sirve para validar la clave desde la pantalla de acceso
  router.get("/verificar", (_req, res) => res.json({ ok: true }));

  router.get("/resumen", async (_req, res) => {
    const todas = await repo.list(VENTANA);
    const porEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0])) as Record<string, number>;
    const porCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c, 0])) as Record<string, number>;
    const hace7dias = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let ultimos7dias = 0;
    let conFoto = 0;
    for (const q of todas) {
      porEstado[q.estado]++;
      porCategoria[q.categoria]++;
      if (Date.parse(q.createdAt) >= hace7dias) ultimos7dias++;
      if (q.tieneFoto) conFoto++;
    }
    res.json({ total: todas.length, porEstado, porCategoria, ultimos7dias, conFoto });
  });

  router.get("/quejas", async (req, res) => {
    const { estado, categoria, q, page, pageSize } = parse(listadoQuerySchema, req.query);
    const termino = q ? normaliza(q) : "";
    const filtradas = (await repo.list(VENTANA)).filter(
      (x: Queja) =>
        (!estado || x.estado === estado) &&
        (!categoria || x.categoria === categoria) &&
        (!termino || normaliza(`${x.folio} ${x.nombre} ${x.asunto} ${x.descripcion} ${x.ubicacion}`).includes(termino)),
    );
    const inicio = (page - 1) * pageSize;
    res.json({ items: filtradas.slice(inicio, inicio + pageSize), total: filtradas.length, page, pageSize });
  });

  router.get("/quejas/:folio", async (req, res) => {
    const q = await repo.get(parse(folioSchema, req.params.folio));
    if (!q) throw new HttpError(404, "Reporte no encontrado");
    res.json(q);
  });

  router.get("/quejas/:folio/foto", async (req, res) => {
    const foto = await repo.getFoto(parse(folioSchema, req.params.folio));
    if (!foto) throw new HttpError(404, "Este reporte no tiene fotografía");
    res.set({ "Content-Type": foto.mime, "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" });
    res.send(foto.data);
  });

  router.patch("/quejas/:folio/estado", async (req, res) => {
    const folio = parse(folioSchema, req.params.folio);
    const { estado, nota } = parse(cambioEstadoSchema, req.body);
    const q = await repo.updateEstado(folio, estado, nota);
    if (!q) throw new HttpError(404, "Reporte no encontrado");
    res.json(q);
  });

  return router;
}
