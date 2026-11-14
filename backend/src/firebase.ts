import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

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
