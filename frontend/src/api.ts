// Misma ruta relativa en dev (proxy de Vite) y en producción (mismo origen)
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...(isForm ? {} : { "Content-Type": "application/json" }), ...options.headers },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? res.statusText);
  return res.status === 204 ? (undefined as T) : res.json();
}
