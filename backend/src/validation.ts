import { z } from "zod";
import { CATEGORIAS, ESTADOS } from "./types.js";

/** Quita caracteres de control (conserva tabulador y saltos de línea) y espacios de los extremos. */
export const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} es obligatorio` })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(min, `${label} debe tener al menos ${min} caracteres`)
        .max(max, `${label} no puede exceder ${max} caracteres`),
    );

/** Campo opcional: cadena vacía equivale a no enviado (así llegan los campos de multipart). */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" ? clean(v) || undefined : v), schema.optional());

export const nuevaQuejaSchema = z.object({
  nombre: text(3, 100, "El nombre"),
  email: optional(z.email("Correo electrónico inválido").max(120)),
  telefono: optional(z.string().regex(/^[0-9+\-\s()]{8,20}$/, "Teléfono inválido (8 a 20 dígitos)")),
  categoria: z.enum(CATEGORIAS, { error: "Selecciona una categoría válida" }),
  asunto: text(5, 120, "El asunto"),
  descripcion: text(20, 2000, "La descripción"),
  ubicacion: text(5, 200, "La ubicación"),
});

export const folioSchema = z
  .string()
  .regex(/^QC-[A-Za-z0-9]{8}$/, "Folio inválido")
  .transform((s) => s.toUpperCase());

export const cambioEstadoSchema = z.object({
  estado: z.enum(ESTADOS, { error: "Estado inválido" }),
  nota: optional(z.string().max(500, "La nota no puede exceder 500 caracteres")),
});

export const listadoQuerySchema = z.object({
  estado: optional(z.enum(ESTADOS)),
  categoria: optional(z.enum(CATEGORIAS)),
  q: optional(z.string().max(100)),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/** Identifica el tipo real de imagen por sus primeros bytes (no confía en el Content-Type del cliente). */
export function detectImageMime(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}
