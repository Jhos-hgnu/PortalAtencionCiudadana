export type Categoria = "alumbrado" | "bacheo" | "agua" | "basura" | "seguridad" | "drenaje" | "otro";
export type Estado = "pendiente" | "en_proceso" | "resuelta" | "rechazada";

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
  notaInterna?: string | null;
  tieneFoto: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Listado {
  items: Queja[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Resumen {
  total: number;
  porEstado: Record<Estado, number>;
  porCategoria: Record<Categoria, number>;
  ultimos7dias: number;
  conFoto: number;
}

export interface Confirmacion {
  folio: string;
  estado: Estado;
  createdAt: string;
  mensaje: string;
}

export interface SeguimientoPublico {
  folio: string;
  estado: Estado;
  categoria: Categoria;
  asunto: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIAS: Record<Categoria, string> = {
  alumbrado: "Alumbrado público",
  bacheo: "Baches y vialidad",
  agua: "Agua potable",
  basura: "Limpieza y basura",
  seguridad: "Seguridad",
  drenaje: "Drenaje y alcantarillado",
  otro: "Otro",
};

export const ESTADOS: Record<Estado, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
};
