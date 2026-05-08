import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatistikInsight } from "../services/gemini";
import type { BukuTaniRecord } from "../services/gemini";

// Mock data: Tren Harga Bawang Merah 6 Bulan Terakhir & Prediksi (Bulan ke-7)
const trenHargaData = [
  { bulan: "Nov", harga: 18000 },
  { bulan: "Des", harga: 20000 },
  { bulan: "Jan", harga: 23000 },
  { bulan: "Feb", harga: 25000 },
  { bulan: "Mar", harga: 24000 },
  { bulan: "Apr", harga: 26000 },
  { bulan: "Mei (Prediksi)", harga: 28000, isPrediction: true },
];

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];

export default function Statistik() {
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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Statistik</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Pantau tren harga pasar dan proporsi pengeluaran tani Anda.
        </p>
      </div>

      {/* Insight AI Card */}
      <Card className="border-green-200 bg-green-50/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
        <CardHeader className="pb-3 border-b border-green-100/50">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
            <Sparkles className="w-5 h-5 text-green-600" />
            Insight AI
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
              <span>Memformulasikan saran finansial...</span>
            </div>
          ) : (
            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
              {insight}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Line Chart: Tren Harga */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              Tren Harga Bawang Merah
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trenHargaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="bulan" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatRupiah(value), "Harga"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="harga" 
                  name="Harga Pasar" 
                  stroke="#16a34a" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6, stroke: '#15803d', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Proporsi Pengeluaran */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              Pengeluaran Buku Tani
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1 min-h-[300px]">
             {pieData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                  <p className="mb-2">Belum ada data pengeluaran.</p>
                  <p className="text-sm">Catat aktivitas Anda di Buku Tani untuk melihat statistik pengeluaran di sini.</p>
                </div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
