import { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatistikInsight } from "../../models/services/gemini";
import type { BukuTaniRecord } from "../../models/services/gemini";

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Dashboard Statistik</h1>
        <p className="text-black font-medium mt-2 text-lg border-l-4 border-black pl-4">
          Pantau tren harga pasar dan proporsi pengeluaran tani Anda.
        </p>
      </div>

      {/* Insight AI Card */}
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="p-5 border-b-4 border-black bg-neo-green">
          <h2 className="text-xl flex items-center gap-2 font-black uppercase text-black tracking-tight">
            <Sparkles className="w-6 h-6 text-black" strokeWidth={2.5}/> Insight AI
          </h2>
        </div>
        <div className="p-6 bg-white">
          {loading ? (
            <div className="flex items-center gap-3 text-black font-bold uppercase">
              <Loader2 className="w-6 h-6 animate-spin text-black" strokeWidth={3} />
              <span>Memformulasikan saran finansial...</span>
            </div>
          ) : (
            <p className="text-black font-medium leading-relaxed text-base md:text-lg">
              {insight}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Line Chart: Tren Harga */}
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="p-5 border-b-4 border-black bg-neo-yellow">
            <h2 className="text-xl flex items-center gap-2 font-black uppercase text-black tracking-tight">
              <TrendingUp className="w-6 h-6 text-black" strokeWidth={2.5} /> Tren Harga Bawang Merah
            </h2>
          </div>
          <div className="p-6 pt-8 flex-1 min-h-[350px] bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trenHargaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#000" strokeWidth={2} />
                <XAxis 
                  dataKey="bulan" 
                  axisLine={{ stroke: '#000', strokeWidth: 4 }} 
                  tickLine={{ stroke: '#000', strokeWidth: 2 }} 
                  tick={{ fill: '#000', fontSize: 13, fontWeight: 800 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={{ stroke: '#000', strokeWidth: 4 }} 
                  tickLine={{ stroke: '#000', strokeWidth: 2 }} 
                  tick={{ fill: '#000', fontSize: 13, fontWeight: 800 }}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [formatRupiah(value), "Harga"]}
                  contentStyle={{ borderRadius: '0px', border: '4px solid #000', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', backgroundColor: '#fff', fontWeight: 900 }}
                  labelStyle={{ color: '#000', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Line 
                  type="monotone" 
                  dataKey="harga" 
                  name="Harga Pasar" 
                  stroke="#000" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#fff', stroke: '#000', strokeWidth: 3 }} 
                  activeDot={{ r: 8, fill: '#ff00ff', stroke: '#000', strokeWidth: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Proporsi Pengeluaran */}
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="p-5 border-b-4 border-black bg-neo-pink">
            <h2 className="text-xl flex items-center gap-2 font-black uppercase text-black tracking-tight">
              <AlertCircle className="w-6 h-6 text-black" strokeWidth={2.5}/> Pengeluaran Buku Tani
            </h2>
          </div>
          <div className="p-6 pt-8 flex-1 min-h-[350px] bg-white">
             {pieData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-black text-center px-4 bg-neo-primary border-4 border-black border-dashed">
                  <p className="mb-2 font-black uppercase text-xl">Belum ada data pengeluaran.</p>
                  <p className="text-base font-bold">Catat aktivitas Anda di Buku Tani untuk melihat statistik pengeluaran di sini.</p>
                </div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '0px', border: '4px solid #000', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', backgroundColor: '#fff', fontWeight: 900 }}
                  />
                  <Legend iconType="square" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
