import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

process.env.ADMIN_KEY = "clave-de-prueba";
process.env.NODE_ENV = "test";

const { createApp } = await import("./app.js");
const { createMemoryRepo } = await import("./repositories/memory.js");

// PNG válido de 1x1 píxel
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const ADMIN = { "x-admin-key": "clave-de-prueba" };

const base = {
  nombre: "María López",
  categoria: "bacheo",
  asunto: "Bache grande en la avenida",
  descripcion: "Hay un bache de gran tamaño que daña los vehículos desde hace semanas.",
  ubicacion: "Av. Reforma y 5a calle, zona 1",
};

function formData(campos: Record<string, string>, foto?: { data: Buffer; type: string; name?: string }) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) fd.append(k, v);
  if (foto) fd.append("foto", new Blob([new Uint8Array(foto.data)], { type: foto.type }), foto.name ?? "foto.png");
  return fd;
}

describe("API de quejas", () => {
  let server: Server;
  let url: string;
  before(async () => {
    server = createApp(createMemoryRepo(), { firebase: false }).listen(0);
    url = `http://localhost:${(server.address() as AddressInfo).port}`;
  });
  after(() => server.close());

  const post = (fd: FormData) => fetch(`${url}/api/quejas`, { method: "POST", body: fd });

  it("health responde ok", async () => {
    const r = await fetch(`${url}/api/health`);
    assert.equal(r.status, 200);
  });

  it("rechaza una queja inválida con detalle por campo", async () => {
    const r = await post(formData({ ...base, nombre: "A", categoria: "xx", descripcion: "corta", email: "no-es-correo" }));
    assert.equal(r.status, 400);
    const j = await r.json();
    for (const campo of ["nombre", "categoria", "descripcion", "email"]) assert.ok(j.detalles[campo], `falta error en ${campo}`);
  });

  it("rechaza archivos que no son imágenes aunque declaren image/png", async () => {
    const r = await post(formData(base, { data: Buffer.from("<script>alert(1)</script>"), type: "image/png" }));
    assert.equal(r.status, 400);
  });

  it("rechaza tipos de archivo no permitidos", async () => {
    const r = await post(formData(base, { data: PNG, type: "application/pdf", name: "a.pdf" }));
    assert.equal(r.status, 400);
  });

  it("rechaza fotos mayores al límite", async () => {
    const grande = Buffer.concat([PNG, Buffer.alloc(900 * 1024)]);
    const r = await post(formData(base, { data: grande, type: "image/png" }));
    assert.equal(r.status, 413);
  });

  let folio = "";
  it("registra una queja con foto y devuelve folio", async () => {
    const r = await post(formData({ ...base, email: "maria@correo.com", telefono: "5555-1234" }, { data: PNG, type: "image/png" }));
    assert.equal(r.status, 201);
    const j = await r.json();
    assert.match(j.folio, /^QC-[A-Z0-9]{8}$/);
    assert.equal(j.estado, "pendiente");
    folio = j.folio;
  });

  it("registra una queja sin foto", async () => {
    const r = await post(formData({ ...base, asunto: "Otra queja sin foto" }));
    assert.equal(r.status, 201);
  });

  it("seguimiento público por folio no expone datos personales", async () => {
    const r = await fetch(`${url}/api/quejas/${folio.toLowerCase()}/estado`);
    assert.equal(r.status, 200);
    const j = await r.json();
    assert.equal(j.estado, "pendiente");
    assert.equal(j.nombre, undefined);
    assert.equal(j.descripcion, undefined);
  });

  it("folio inexistente o con formato inválido", async () => {
    assert.equal((await fetch(`${url}/api/quejas/QC-ZZZZZZZZ/estado`)).status, 404);
    assert.equal((await fetch(`${url}/api/quejas/abc/estado`)).status, 400);
  });

  it("las rutas de admin exigen clave", async () => {
    assert.equal((await fetch(`${url}/api/admin/quejas`)).status, 401);
    assert.equal((await fetch(`${url}/api/admin/quejas`, { headers: { "x-admin-key": "mala" } })).status, 401);
    assert.equal((await fetch(`${url}/api/admin/verificar`, { headers: ADMIN })).status, 200);
  });

  it("admin lista, filtra y busca", async () => {
    const todas = await (await fetch(`${url}/api/admin/quejas`, { headers: ADMIN })).json();
    assert.equal(todas.total, 2);
    const filtro = await (await fetch(`${url}/api/admin/quejas?estado=resuelta`, { headers: ADMIN })).json();
    assert.equal(filtro.total, 0);
    const busca = await (await fetch(`${url}/api/admin/quejas?q=maria`, { headers: ADMIN })).json();
    assert.equal(busca.total, 2); // búsqueda sin distinguir acentos
    const malo = await fetch(`${url}/api/admin/quejas?estado=inventado`, { headers: ADMIN });
    assert.equal(malo.status, 400);
  });

  it("admin consulta detalle y descarga la foto", async () => {
    const d = await (await fetch(`${url}/api/admin/quejas/${folio}`, { headers: ADMIN })).json();
    assert.equal(d.descripcion, base.descripcion);
    assert.equal(d.tieneFoto, true);
    const f = await fetch(`${url}/api/admin/quejas/${folio}/foto`, { headers: ADMIN });
    assert.equal(f.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await f.arrayBuffer()), PNG);
  });

  it("admin cambia el estado y se refleja en el seguimiento público", async () => {
    const r = await fetch(`${url}/api/admin/quejas/${folio}/estado`, {
      method: "PATCH",
      headers: { ...ADMIN, "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en_proceso", nota: "Cuadrilla asignada" }),
    });
    assert.equal(r.status, 200);
    const pub = await (await fetch(`${url}/api/quejas/${folio}/estado`)).json();
    assert.equal(pub.estado, "en_proceso");
    const malo = await fetch(`${url}/api/admin/quejas/${folio}/estado`, {
      method: "PATCH",
      headers: { ...ADMIN, "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "borrada" }),
    });
    assert.equal(malo.status, 400);
  });

  it("resumen calcula indicadores", async () => {
    const r = await (await fetch(`${url}/api/admin/resumen`, { headers: ADMIN })).json();
    assert.equal(r.total, 2);
    assert.equal(r.porEstado.en_proceso, 1);
    assert.equal(r.conFoto, 1);
  });

  it("rutas /api desconocidas devuelven 404 JSON", async () => {
    const r = await fetch(`${url}/api/nada`);
    assert.equal(r.status, 404);
    assert.ok((await r.json()).error);
  });
});
