import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createPrivateKey, generateKeyPairSync } from "node:crypto";
import { normalizaClave } from "./firebase.js";

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

describe("normalizaClave", () => {
  const variantes: Record<string, string> = {
    "saltos reales": privateKey,
    "\\n literales": privateKey.replace(/\n/g, "\\n"),
    "saltos convertidos en espacios": privateKey.replace(/\n/g, " "),
    "todo en una línea sin separadores": privateKey.replace(/\n/g, ""),
    "con comillas y \\n literales": `"${privateKey.replace(/\n/g, "\\n")}"`,
  };

  for (const [nombre, valor] of Object.entries(variantes)) {
    it(`produce una clave válida con ${nombre}`, () => {
      const k = normalizaClave(valor);
      assert.doesNotThrow(() => createPrivateKey(k));
      assert.equal(k, privateKey);
    });
  }
});
