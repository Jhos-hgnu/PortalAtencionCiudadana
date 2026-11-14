// Misma ruta relativa en dev (proxy de Vite) y en producción (mismo origen)
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detalles: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const isForm = options.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...options,
      headers: { ...(isForm || !options.body ? {} : { "Content-Type": "application/json" }), ...options.headers },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.", 0);
  }
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    throw new ApiError(j?.error ?? res.statusText, res.status, j?.detalles);
  }
  return res;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await request(path, options);
  return res.status === 204 ? (undefined as T) : res.json();
}

// --- Sesión del panel: la clave vive solo en sessionStorage (se borra al cerrar la pestaña)
const KEY = "admin-key";
export const adminKey = {
  get: () => {
    try { return sessionStorage.getItem(KEY) ?? ""; } catch { return ""; }
  },
  set: (v: string) => { try { sessionStorage.setItem(KEY, v); } catch { /* sin almacenamiento */ } },
  clear: () => { try { sessionStorage.removeItem(KEY); } catch { /* sin almacenamiento */ } },
};

const adminHeaders = (): Record<string, string> => ({ "x-admin-key": adminKey.get() });

export const adminApi = <T>(path: string, options: RequestInit = {}) =>
  api<T>(`/admin${path}`, { ...options, headers: { ...adminHeaders(), ...options.headers } });

/** La foto requiere el header de admin, por eso se descarga como blob y se muestra con una URL local. */
export async function adminFoto(folio: string): Promise<string> {
  const res = await request(`/admin/quejas/${folio}/foto`, { headers: adminHeaders() });
  return URL.createObjectURL(await res.blob());
}
