import { useCallback, useEffect, useState } from "react";
import { adminApi, adminKey, ApiError } from "../api";
import DetalleQueja from "../components/DetalleQueja";
import AdminLogin from "../components/AdminLogin";
import Indicadores from "../components/Indicadores";
import TablaQuejas from "../components/TablaQuejas";
import { Alert, btnSecondary, inputClass } from "../components/ui";
import { CATEGORIAS, ESTADOS, type Listado, type Queja, type Resumen } from "../lib/types";

const LISTADO_VACIO: Listado = { items: [], total: 0, page: 1, pageSize: 10 };

export default function Admin() {
  const [autenticado, setAutenticado] = useState(Boolean(adminKey.get()));
  if (!autenticado) return <AdminLogin onOk={() => setAutenticado(true)} />;
  return <Panel onSalir={() => { adminKey.clear(); setAutenticado(false); }} />;
}

function Panel({ onSalir }: { onSalir: () => void }) {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [data, setData] = useState<Listado>(LISTADO_VACIO);
  const [filtros, setFiltros] = useState({ q: "", estado: "", categoria: "" });
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seleccionada, setSeleccionada] = useState<Queja | null>(null);

  // Si el servidor rechaza la clave (401), se cierra la sesión
  const manejar = useCallback((e: unknown) => {
    if ((e as ApiError).status === 401) return onSalir();
    setError((e as Error).message);
  }, [onSalir]);

  // Búsqueda con retardo para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => { setFiltros((f) => ({ ...f, q: busqueda })); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  const cargarResumen = useCallback(() => adminApi<Resumen>("/resumen").then(setResumen).catch(manejar), [manejar]);
  const cargarListado = useCallback(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: "10" });
    Object.entries(filtros).forEach(([k, v]) => v && p.set(k, v));
    setCargando(true);
    return adminApi<Listado>(`/quejas?${p}`).then((d) => { setData(d); setError(""); }).catch(manejar).finally(() => setCargando(false));
  }, [filtros, page, manejar]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);
  useEffect(() => { cargarListado(); }, [cargarListado]);

  const refrescar = () => { cargarResumen(); cargarListado(); };
  const hayFiltros = Boolean(filtros.q || filtros.estado || filtros.categoria);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-guinda-oscuro">Panel de Administración Municipal</h1>
          <p className="mt-1 text-texto/80">Revisión y seguimiento de los reportes ciudadanos.</p>
        </div>
        <div className="flex gap-2">
          <button className={btnSecondary} onClick={refrescar}>Actualizar</button>
          <button className={btnSecondary} onClick={onSalir}>Cerrar sesión</button>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}
      {resumen && <Indicadores resumen={resumen} />}

      <div className="grid gap-3 sm:grid-cols-[1fr_12rem_14rem_auto]">
        <input className={inputClass()} placeholder="Buscar por folio, nombre, asunto o ubicación…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar" />
        <select className={inputClass()} value={filtros.estado} onChange={(e) => { setFiltros({ ...filtros, estado: e.target.value }); setPage(1); }} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={inputClass()} value={filtros.categoria} onChange={(e) => { setFiltros({ ...filtros, categoria: e.target.value }); setPage(1); }} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className={btnSecondary} disabled={!hayFiltros} onClick={() => { setBusqueda(""); setFiltros({ q: "", estado: "", categoria: "" }); setPage(1); }}>Limpiar</button>
      </div>

      <TablaQuejas data={data} cargando={cargando} onSelect={setSeleccionada} onPage={setPage} />

      {seleccionada && (
        <DetalleQueja
          queja={seleccionada}
          onClose={() => setSeleccionada(null)}
          onNoAutorizado={onSalir}
          onActualizada={(q) => { setSeleccionada(q); refrescar(); }}
        />
      )}
    </div>
  );
}
