export const CATEGORIAS = ["alumbrado", "bacheo", "agua", "basura", "seguridad", "drenaje", "otro"] as const;
export const ESTADOS = ["pendiente", "en_proceso", "resuelta", "rechazada"] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface Queja {
  folio: string;
  nombre: string;
  email?: string;
  telefono?: string;
  categoria: Categoria;
  asunto: string;
  descripcion: string;
  ubicacion: string;
  estado: Estado;
  notaInterna?: string;
  tieneFoto: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export type NuevaQueja = Pick<Queja, "nombre" | "email" | "telefono" | "categoria" | "asunto" | "descripcion" | "ubicacion">;

export interface Foto {
  mime: string;
  data: Buffer;
}
