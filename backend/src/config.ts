import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  isProd: process.env.NODE_ENV === "production",
  corsOrigin: process.env.CORS_ORIGIN ?? true,
  adminKey: process.env.ADMIN_KEY ?? "",
  /** Tamaño máximo de la fotografía en bytes (Firestore limita cada documento a 1 MiB). */
  maxPhotoBytes: 800 * 1024,
} as const;
