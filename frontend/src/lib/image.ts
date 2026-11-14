/** Límite que acepta el servidor es 800 KB; se apunta a 700 KB para dejar margen. */
const MAX_BYTES = 700 * 1024;
const MAX_SIDE = 1280;

/**
 * Reduce y recomprime la imagen en el navegador para que quepa en el límite del servidor
 * (la capa gratuita de Firestore limita cada documento a 1 MiB). Devuelve un JPEG.
 */
export async function comprimirImagen(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("No se pudo leer la imagen. Usa un archivo JPG, PNG o WebP válido.");
  });
  const escala = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // PNG con transparencia -> fondo blanco en JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (let calidad = 0.85; calidad >= 0.4; calidad -= 0.1) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", calidad));
    if (blob && blob.size <= MAX_BYTES) return new File([blob], "foto.jpg", { type: "image/jpeg" });
  }
  throw new Error("La imagen es demasiado grande incluso al comprimirla. Prueba con otra fotografía.");
}
