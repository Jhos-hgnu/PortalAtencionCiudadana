import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Portal from "./pages/Portal";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Portal />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Portal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
