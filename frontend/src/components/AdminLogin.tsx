import { useState, type FormEvent } from "react";
import { adminApi, adminKey, ApiError } from "../api";
import { Alert, btnPrimary, Card, Field, inputClass, Spinner } from "./ui";

export default function AdminLogin({ onOk }: { onOk: () => void }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (!clave.trim()) return setError("Ingresa la clave de acceso");
    setError("");
    setCargando(true);
    adminKey.set(clave.trim());
    try {
      await adminApi("/verificar");
      onOk();
    } catch (err) {
      adminKey.clear();
      setError((err as ApiError).status === 401 ? "Clave incorrecta" : (err as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm pt-8">
      <Card>
        <h1 className="text-xl font-semibold text-guinda-oscuro">Panel de Administración</h1>
        <p className="mb-5 mt-1 text-sm text-texto/70">Acceso exclusivo para personal municipal.</p>
        <form onSubmit={entrar} className="space-y-4" noValidate>
          {error && <Alert>{error}</Alert>}
          <Field label="Clave de acceso">
            <input type="password" className={inputClass()} value={clave} onChange={(e) => setClave(e.target.value)} autoFocus autoComplete="current-password" />
          </Field>
          <button className={`${btnPrimary} w-full`} disabled={cargando}>
            {cargando && <Spinner />} Ingresar
          </button>
        </form>
      </Card>
    </div>
  );
}
