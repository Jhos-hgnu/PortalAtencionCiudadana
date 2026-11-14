import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Carga backend/.env sin depender del directorio desde el que se lance el proceso
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"), quiet: true });

export const config = {
  port: Number(process.env.PORT ?? 3000),
  isProd: process.env.NODE_ENV === "production",
  corsOrigin: process.env.CORS_ORIGIN ?? true,
  adminKey: process.env.ADMIN_KEY ?? "",
  /** Tamaño máximo de la fotografía en bytes (Firestore limita cada documento a 1 MiB). */
  maxPhotoBytes: 800 * 1024,
} as const;
