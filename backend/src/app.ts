import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { errorHandler } from "./errors.js";
import type { QuejasRepo } from "./repositories/types.js";
import { quejasRouter } from "./routes/quejas.js";

export function createApp(repo: QuejasRepo, opts: { firebase: boolean }) {
  const app = express();
  app.set("trust proxy", 1); // Render termina TLS en un proxy; necesario para los límites por IP
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "20kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, firebase: opts.firebase }));
  app.use("/api/quejas", quejasRouter(repo));

  app.use("/api", (_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

  // En producción el backend sirve el frontend compilado (un solo servicio en Render)
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  app.use(errorHandler);
  return app;
}
