import { NavLink, Outlet } from "react-router-dom";

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`;

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-guinda text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-dorado text-lg font-bold text-guinda-oscuro" aria-hidden>
              PC
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold">Atención Ciudadana</p>
              <p className="text-xs text-white/75">Gobierno Municipal</p>
            </div>
          </div>
          <nav className="flex gap-1" aria-label="Principal">
            <NavLink to="/" end className={link}>Portal ciudadano</NavLink>
            <NavLink to="/admin" className={link}>Administración</NavLink>
          </nav>
        </div>
        <div className="h-1 bg-dorado" />
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-guinda-oscuro py-4 text-center text-xs text-white/75">
        Portal de Atención Ciudadana · Tu reporte ayuda a mejorar el municipio
      </footer>
    </div>
  );
}
