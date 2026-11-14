import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "../api";
import { comprimirImagen } from "../lib/image";
import { CATEGORIAS, type Categoria, type Confirmacion } from "../lib/types";
import { Alert, btnPrimary, btnSecondary, Card, Field, inputClass, Spinner } from "./ui";

const VACIO = { nombre: "", email: "", telefono: "", categoria: "" as Categoria | "", asunto: "", descripcion: "", ubicacion: "" };
type Campos = typeof VACIO;
type Errores = Partial<Record<keyof Campos | "foto", string>>;

/** Mismas reglas que el backend, para dar respuesta inmediata (el servidor siempre vuelve a validar). */
function validar(f: Campos): Errores {
  const e: Errores = {};
  if (f.nombre.trim().length < 3) e.nombre = "Escribe tu nombre completo (mínimo 3 caracteres)";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Correo electrónico inválido";
  if (f.telefono.trim() && !/^[0-9+\-\s()]{8,20}$/.test(f.telefono.trim())) e.telefono = "Teléfono inválido (8 a 20 dígitos)";
  if (!f.categoria) e.categoria = "Selecciona una categoría";
  if (f.asunto.trim().length < 5) e.asunto = "El asunto debe tener al menos 5 caracteres";
  if (f.descripcion.trim().length < 20) e.descripcion = "Describe el problema con al menos 20 caracteres";
  if (f.ubicacion.trim().length < 5) e.ubicacion = "Indica la dirección o referencia del lugar";
  return e;
}

export default function ReporteForm({ onEnviado }: { onEnviado: (c: Confirmacion) => void }) {
  const [f, setF] = useState<Campos>(VACIO);
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [procesandoFoto, setProcesandoFoto] = useState(false);
  const inputFoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!foto) return setPreview("");
    const url = URL.createObjectURL(foto);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const set = (k: keyof Campos) => (e: { target: { value: string } }) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    if (errores[k]) setErrores((p) => ({ ...p, [k]: undefined }));
  };

  async function elegirFoto(file?: File) {
    setErrores((p) => ({ ...p, foto: undefined }));
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return setErrores((p) => ({ ...p, foto: "Formato no permitido (usa JPG, PNG o WebP)" }));
    }
    setProcesandoFoto(true);
    try {
      setFoto(await comprimirImagen(file));
    } catch (e) {
      setErrores((p) => ({ ...p, foto: (e as Error).message }));
    } finally {
      setProcesandoFoto(false);
      if (inputFoto.current) inputFoto.current.value = "";
    }
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral("");
    const errs = validar(f);
    setErrores(errs);
    if (Object.keys(errs).length) return;

    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => v.trim() && fd.append(k, v.trim()));
    if (foto) fd.append("foto", foto);

    setEnviando(true);
    try {
      onEnviado(await api<Confirmacion>("/quejas", { method: "POST", body: fd }));
    } catch (err) {
      const ae = err as ApiError;
      if (ae.detalles && Object.keys(ae.detalles).length) setErrores(ae.detalles as Errores);
      setErrorGeneral(ae.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-guinda-oscuro">Registrar un reporte</h2>
      <p className="mb-5 mt-1 text-sm text-texto/70">Cuéntanos qué ocurre y dónde. Los campos con * son obligatorios.</p>

      <form onSubmit={enviar} noValidate className="space-y-4">
        {errorGeneral && <Alert>{errorGeneral}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo *" error={errores.nombre}>
            <input className={inputClass(errores.nombre)} value={f.nombre} onChange={set("nombre")} maxLength={100} autoComplete="name" />
          </Field>
          <Field label="Categoría *" error={errores.categoria}>
            <select className={inputClass(errores.categoria)} value={f.categoria} onChange={set("categoria")}>
              <option value="">Selecciona…</option>
              {Object.entries(CATEGORIAS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Correo electrónico" error={errores.email} hint="Opcional">
            <input type="email" className={inputClass(errores.email)} value={f.email} onChange={set("email")} maxLength={120} autoComplete="email" />
          </Field>
          <Field label="Teléfono" error={errores.telefono} hint="Opcional">
            <input type="tel" className={inputClass(errores.telefono)} value={f.telefono} onChange={set("telefono")} maxLength={20} autoComplete="tel" />
          </Field>
        </div>

        <Field label="Asunto *" error={errores.asunto}>
          <input className={inputClass(errores.asunto)} value={f.asunto} onChange={set("asunto")} maxLength={120} placeholder="Ej. Bache en la avenida principal" />
        </Field>
        <Field label="Ubicación *" error={errores.ubicacion} hint="Dirección, colonia o punto de referencia">
          <input className={inputClass(errores.ubicacion)} value={f.ubicacion} onChange={set("ubicacion")} maxLength={200} />
        </Field>
        <Field label="Descripción *" error={errores.descripcion} hint={`${f.descripcion.trim().length}/2000 caracteres`}>
          <textarea className={inputClass(errores.descripcion)} rows={5} value={f.descripcion} onChange={set("descripcion")} maxLength={2000} />
        </Field>

        <div>
          <span className="mb-1 block text-sm font-medium">Fotografía</span>
          {preview ? (
            <div className="flex items-center gap-4 rounded-lg border border-gris-medio bg-crema p-3">
              <img src={preview} alt="Vista previa de la fotografía adjunta" className="h-24 w-24 rounded-md object-cover" />
              <div className="text-sm">
                <p className="font-medium">Fotografía adjunta</p>
                <p className="text-xs text-texto/60">{foto && `${Math.round(foto.size / 1024)} KB (optimizada)`}</p>
                <button type="button" className="mt-2 text-xs font-semibold text-guinda hover:underline" onClick={() => setFoto(null)}>
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputFoto.current?.click()}
              disabled={procesandoFoto}
              className="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed border-dorado/60 bg-crema px-4 py-6 text-sm text-texto/80 transition hover:border-dorado hover:bg-dorado/10"
            >
              {procesandoFoto ? (
                <>
                  <Spinner /> Procesando imagen…
                </>
              ) : (
                <>
                  <span className="font-semibold text-guinda">Adjuntar fotografía</span>
                  <span className="text-xs">JPG, PNG o WebP · se optimiza automáticamente</span>
                </>
              )}
            </button>
          )}
          <input ref={inputFoto} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => elegirFoto(e.target.files?.[0])} />
          {errores.foto && (
            <span role="alert" className="mt-1 block text-xs font-medium text-guinda">
              {errores.foto}
            </span>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              setF(VACIO);
              setFoto(null);
              setErrores({});
              setErrorGeneral("");
            }}
            disabled={enviando}
          >
            Limpiar
          </button>
          <button className={btnPrimary} disabled={enviando || procesandoFoto}>
            {enviando && <Spinner />} {enviando ? "Enviando…" : "Enviar reporte"}
          </button>
        </div>
      </form>
    </Card>
  );
}
