/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Klinik from "./pages/Klinik";
import Kalkulator from "./pages/Kalkulator";
import JadwalTanam from "./pages/JadwalTanam";
import BukuTani from "./pages/BukuTani";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="klinik" element={<Klinik />} />
          <Route path="kalkulator" element={<Kalkulator />} />
          <Route path="jadwal" element={<JadwalTanam />} />
          <Route path="bukutani" element={<BukuTani />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


