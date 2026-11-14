import rateLimit from "express-rate-limit";

const limitMsg = (error: string) => ({ error });

/** Envío de quejas: evita spam desde una misma IP. */
export const crearQuejaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limitMsg("Demasiados envíos desde tu conexión. Intenta de nuevo en unos minutos."),
});

/** Consulta pública por folio: evita enumeración de folios. */
export const consultaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limitMsg("Demasiadas consultas. Intenta de nuevo en unos minutos."),
});

/** Admin: solo cuenta los intentos fallidos (frena fuerza bruta sin molestar al uso normal). */
export const adminFailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: limitMsg("Demasiados intentos fallidos. Intenta de nuevo en unos minutos."),
});
