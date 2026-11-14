import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Tolera errores comunes al pegar variables en plataformas: comillas envolventes, coma final y espacios
const limpia = (v?: string) => v?.trim().replace(/^["']+/, "").replace(/["',\s]+$/, "") || undefined;
const FIREBASE_PROJECT_ID = limpia(process.env.FIREBASE_PROJECT_ID);
const FIREBASE_CLIENT_EMAIL = limpia(process.env.FIREBASE_CLIENT_EMAIL);
const FIREBASE_PRIVATE_KEY = limpia(process.env.FIREBASE_PRIVATE_KEY);

/**
 * Reconstruye el PEM a partir de su contenido base64. Tolera que la plataforma haya guardado los
 * saltos de línea como "\n" literales, como espacios, o que se hayan perdido por completo.
 */
export function normalizaClave(raw: string): string {
  const m = raw.match(/-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/);
  if (!m) return raw.replace(/\\n/g, "\n"); // formato inesperado: deja que firebase-admin informe el error
  const cuerpo = m[2].replace(/\\n/g, "").replace(/\s+/g, "");
  const lineas = cuerpo.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${m[1]}-----\n${lineas.join("\n")}\n-----END ${m[1]}-----\n`;
}

export const firebaseConfigured = Boolean(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);

let firestore: Firestore | undefined;

/** Devuelve Firestore inicializado (solo válido si firebaseConfigured es true). */
export function db(): Firestore {
  if (!firestore) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: normalizaClave(FIREBASE_PRIVATE_KEY!),
        }),
      });
    }
    firestore = getFirestore();
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}
