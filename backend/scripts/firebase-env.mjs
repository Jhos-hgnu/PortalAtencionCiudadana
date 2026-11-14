// Uso: node scripts/firebase-env.mjs <ruta-al-json-de-la-cuenta-de-servicio> [--env ruta/.env]
// Lee el .json descargado de Firebase y escribe FIREBASE_* en backend/.env con el formato correcto.
// No imprime ningún valor secreto.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const envFlag = args.indexOf("--env");
const envPath = envFlag >= 0 ? path.resolve(args[envFlag + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env");
const jsonPath = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--env");

if (!jsonPath) {
  console.error("Uso: node scripts/firebase-env.mjs <archivo.json> [--env ruta/.env]");
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(path.resolve(jsonPath), "utf8"));
if (sa.type !== "service_account" || !sa.project_id || !sa.client_email || !sa.private_key) {
  console.error("El archivo no parece una clave de cuenta de servicio de Firebase.");
  process.exit(1);
}
crypto.createPrivateKey(sa.private_key); // lanza error si la clave no es válida

const previo = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split(/\r?\n/) : [];
// Conserva comentarios y variables ajenas; descarta FIREBASE_* y restos de valores multilínea mal pegados
const conservadas = previo.filter((l) => /^\s*#/.test(l) || /^[A-Z][A-Z0-9_]*\s*=/.test(l)).filter((l) => !/^\s*FIREBASE_/.test(l));

const nuevas = [
  `FIREBASE_PROJECT_ID="${sa.project_id}"`,
  `FIREBASE_CLIENT_EMAIL="${sa.client_email}"`,
  `FIREBASE_PRIVATE_KEY="${sa.private_key.replace(/\r?\n/g, "\\n")}"`,
];

fs.writeFileSync(envPath, [...conservadas, ...nuevas].join("\n") + "\n");
console.log(`Listo: se escribieron FIREBASE_PROJECT_ID (${sa.project_id}), FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en ${envPath}`);
