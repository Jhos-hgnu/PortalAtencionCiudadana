import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Tolera errores comunes al pegar variables en plataformas: comillas envolventes, coma final y espacios
const limpia = (v?: string) => v?.trim().replace(/^["']+/, "").replace(/["',\s]+$/, "") || undefined;
const FIREBASE_PROJECT_ID = limpia(process.env.FIREBASE_PROJECT_ID);
const FIREBASE_CLIENT_EMAIL = limpia(process.env.FIREBASE_CLIENT_EMAIL);
const FIREBASE_PRIVATE_KEY = limpia(process.env.FIREBASE_PRIVATE_KEY);

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
          // Las plataformas suelen guardar los saltos de línea de la clave como "\n" literales
          privateKey: FIREBASE_PRIVATE_KEY!.replace(/\n/g, "\n"),
        }),
      });
    }
    firestore = getFirestore();
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}
