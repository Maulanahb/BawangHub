import { useState, useEffect } from "react";
import { getStatistikInsight } from "../models/services/gemini";
import type { BukuTaniRecord } from "../models/services/gemini";

// Mock data: Tren Harga Bawang Merah 12 Bulan Terakhir & Prediksi
export const trenHargaData = [
  { bulan: "Mei", harga: 15000 },
  { bulan: "Jun", harga: 16500 },
  { bulan: "Jul", harga: 14000 },
  { bulan: "Ags", harga: 14500 },
  { bulan: "Sep", harga: 16000 },
  { bulan: "Okt", harga: 17500 },
  { bulan: "Nov", harga: 18000 },
  { bulan: "Des", harga: 20000 },
  { bulan: "Jan", harga: 23000 },
  { bulan: "Feb", harga: 25000 },
  { bulan: "Mar", harga: 24000 },
  { bulan: "Apr", harga: 26000 },
  { bulan: "Mei (Prediksi)", harga: 28000, isPrediction: true },
];

export function useStatistikController() {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function loadData() {
      // 1. Ambil data pengeluaran dari lokal storage (Buku Tani)
      const saved = localStorage.getItem("buku_tani_records");
      let records: BukuTaniRecord[] = [];
      if (saved) {
        try {
          records = JSON.parse(saved);
        } catch (e) {}
      }

      // Group nominal by kategori
      const categoryMap: Record<string, number> = {};
      records.forEach(r => {
        categoryMap[r.kategori] = (categoryMap[r.kategori] || 0) + r.nominal;
      });

      const pieChartData = Object.keys(categoryMap).map(kategori => ({
        name: kategori,
        value: categoryMap[kategori]
      }));
      setPieData(pieChartData);

      // Siapkan string rangkuman pengeluaran untuk prompt Gemini
      const expensesDataStr = pieChartData.length > 0 
        ? pieChartData.map(d => `- ${d.name}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(d.value)}`).join("\n")
        : "Belum ada catatan pengeluaran.";

      const trenHargaStr = trenHargaData.map(d => `- ${d.bulan}: Rp${d.harga.toLocaleString('id-ID')}/kg`).join("\n");

      // 2. Fetch AI Insight
      try {
        const result = await getStatistikInsight(expensesDataStr, trenHargaStr);
        setInsight(result);
      } catch (err) {
        console.error(err);
        setInsight("Gagal memuat insight dari AI.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return {
    insight,
    loading,
    pieData,
    trenHargaData,
  };
}
