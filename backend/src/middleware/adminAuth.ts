import { createHash, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { HttpError } from "../errors.js";

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Exige el header `x-admin-key` igual a ADMIN_KEY. Si ADMIN_KEY no está definida, el panel queda cerrado. */
export function adminAuth(req: Request, _res: Response, next: NextFunction) {
  if (!config.adminKey) throw new HttpError(503, "El panel de administración no está configurado");
  const provided = req.header("x-admin-key") ?? "";
  // Se comparan hashes de igual longitud en tiempo constante para evitar ataques de temporización
  if (!timingSafeEqual(digest(provided), digest(config.adminKey))) throw new HttpError(401, "Clave de administrador incorrecta");
  next();
}
