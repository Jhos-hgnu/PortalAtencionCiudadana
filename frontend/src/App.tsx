import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Portal from "./pages/Portal";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-4 bg-guinda px-6 py-3 text-white">
        <Link to="/">Portal ciudadano</Link>
        <Link to="/admin">Administración</Link>
      </nav>
      <main className="mx-auto max-w-5xl p-6">
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
