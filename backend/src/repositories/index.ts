import { config } from "../config.js";
import { firebaseConfigured } from "../firebase.js";
import { firestoreRepo } from "./firestore.js";
import { createMemoryRepo } from "./memory.js";
import type { QuejasRepo } from "./types.js";

export function selectRepo(): QuejasRepo {
  if (firebaseConfigured) {
    console.log("Persistencia: Firebase Firestore");
    return firestoreRepo;
  }
  if (config.isProd) {
    throw new Error("Faltan credenciales de Firebase (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
  }
  console.warn("⚠ Firebase no configurado: usando memoria VOLÁTIL (solo desarrollo). Los datos se pierden al reiniciar.");
  return createMemoryRepo();
}
