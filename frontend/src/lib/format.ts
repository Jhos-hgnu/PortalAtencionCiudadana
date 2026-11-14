export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-GT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" });
