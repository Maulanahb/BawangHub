import { useState, useEffect } from "react";
import { getStatistikInsight } from "../models/services/gemini";
import type { BukuTaniRecord } from "../models/services/gemini";

// Linear Regression helper
function simpleLinearRegression(dataPoints: number[]): { m: number; c: number } {
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  let count = dataPoints.length;
  for (let i = 0; i < count; i++) {
    let x = i;
    let y = dataPoints[i];
    sumX += x;
    sumY += y;
    sumXX += x * x;
    sumXY += x * y;
  }
  let m = (count * sumXY - sumX * sumY) / (count * sumXX - sumX * sumX);
  let c = (sumY - m * sumX) / count;
  return { m, c };
}

export const getHistoricalPriceData = () => [
  { bulan: "Mei 23", harga: 15000 },
  { bulan: "Jun 23", harga: 16500 },
  { bulan: "Jul 23", harga: 14000 },
  { bulan: "Ags 23", harga: 14500 },
  { bulan: "Sep 23", harga: 16000 },
  { bulan: "Okt 23", harga: 17500 },
  { bulan: "Nov 23", harga: 18000 },
  { bulan: "Des 23", harga: 20000 },
  { bulan: "Jan 24", harga: 23000 },
  { bulan: "Feb 24", harga: 25000 },
  { bulan: "Mar 24", harga: 24000 },
  { bulan: "Apr 24", harga: 26000 },
];

export function generatePredictiveData() {
  const historical = getHistoricalPriceData();
  const prices = historical.map(d => d.harga);
  const { m, c } = simpleLinearRegression(prices);
  
  const predictNextN = 3;
  const futureMonths = ["Mei 24", "Jun 24", "Jul 24"];
  const lastHistorical = historical[historical.length - 1];
  
  const data: Array<{ bulan: string; harga?: number; hargaPrediksi?: number }> = historical.map(d => ({
    bulan: d.bulan,
    harga: d.harga,
    hargaPrediksi: d === lastHistorical ? d.harga : undefined,
  }));
  
  for(let i = 0; i < predictNextN; i++) {
    const nextX = historical.length + i;
    const predictedY = Math.round(m * nextX + c);
    data.push({
      bulan: futureMonths[i],
      harga: undefined,
      hargaPrediksi: predictedY,
    });
  }
  
  return data;
}

export const trenHargaData = generatePredictiveData();

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
