import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { firebaseConfigured } from "./firebase.js";

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, firebase: firebaseConfigured }));

// TODO (siguiente fase): rutas /api/quejas (público) y /api/admin/quejas (panel)

// En producción el backend sirve el frontend compilado (un solo servicio en Render)
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => (req.path.startsWith("/api") ? next() : res.sendFile(path.join(dist, "index.html"))));
}

app.use("/api", (_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API en http://localhost:${port}`));
