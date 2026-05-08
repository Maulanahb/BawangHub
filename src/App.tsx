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
import Statistik from "./pages/Statistik";
import Forum from "./pages/Forum";
import ForumDetail from "./pages/ForumDetail";
import CuacaDetail from "./pages/CuacaDetail";
import Login from "./pages/Login";
import Profil from "./pages/Profil";
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="klinik" element={<Klinik />} />
            <Route path="kalkulator" element={<Kalkulator />} />
            <Route path="jadwal" element={<JadwalTanam />} />
            <Route path="bukutani" element={<BukuTani />} />
            <Route path="statistik" element={<Statistik />} />
            <Route path="cuaca" element={<CuacaDetail />} />
            <Route element={<ProtectedRoute />}>
              <Route path="forum" element={<Forum />} />
              <Route path="forum/:id" element={<ForumDetail />} />
              <Route path="profil" element={<Profil />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


