import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public detalles?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Valida `data` con un esquema zod; ante error responde 400 con el detalle por campo. */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  const detalles: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const campo = issue.path.join(".") || "_";
    detalles[campo] ??= issue.message;
  }
  throw new HttpError(400, Object.values(detalles)[0] ?? "Datos inválidos", detalles);
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, detalles: err.detalles });
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    const msg = tooBig ? "La fotografía excede el tamaño máximo permitido (800 KB)" : "Archivo adjunto inválido";
    return res.status(tooBig ? 413 : 400).json({ error: msg, detalles: { foto: msg } });
  }
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ error: "JSON mal formado" });
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}
