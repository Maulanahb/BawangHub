/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./views/components/Layout";
import Dashboard from "./views/pages/Dashboard";
import Klinik from "./views/pages/Klinik";
import Kalkulator from "./views/pages/Kalkulator";
import JadwalTanam from "./views/pages/JadwalTanam";
import BukuTani from "./views/pages/BukuTani";
import Statistik from "./views/pages/Statistik";
import Forum from "./views/pages/Forum";
import ForumDetail from "./views/pages/ForumDetail";
import CuacaDetail from "./views/pages/CuacaDetail";
import Login from "./views/pages/Login";
import Profil from "./views/pages/Profil";
import TanyaAI from "./views/pages/TanyaAI";
import AdminDashboard from "./views/pages/AdminDashboard";
import { AuthProvider } from "./views/components/AuthProvider";
import { ProtectedRoute } from "./views/components/ProtectedRoute";
import { AdminRoute } from "./views/components/AdminRoute";

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
            <Route path="tanya-ai" element={<TanyaAI />} />
            <Route element={<ProtectedRoute />}>
              <Route path="forum" element={<Forum />} />
              <Route path="forum/:id" element={<ForumDetail />} />
              <Route path="profil" element={<Profil />} />
              <Route element={<AdminRoute />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


