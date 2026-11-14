import multer from "multer";
import { config } from "../config.js";
import { HttpError } from "../errors.js";

/** Recibe un solo archivo "foto" en memoria, con tope de tamaño; solo tipos de imagen permitidos. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxPhotoBytes, files: 1, fields: 12, fieldSize: 8 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    if (ok) cb(null, true);
    else cb(new HttpError(400, "La fotografía debe ser JPG, PNG o WebP", { foto: "Formato no permitido (usa JPG, PNG o WebP)" }));
  },
});
