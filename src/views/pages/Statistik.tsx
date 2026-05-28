import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Sparkles, TrendingUp, AlertCircle, Loader2, BarChart3 } from "lucide-react";
import Markdown from "react-markdown";
import { useStatistikController } from "../../controllers/useStatistikController";

const COLORS = ['#22c55e', '#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];

export default function Statistik() {
  const { insight, loading, pieData, trenHargaData } = useStatistikController();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Dashboard Statistik</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Pantau tren harga pasar terbaru dan analisa proporsi pengeluaran tani Anda dengan bantuan AI.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <BarChart3 className="w-64 h-64 text-gray-900" />
        </div>
      </div>

      {/* Insight AI Card */}
      <div className="border border-gray-100 rounded-2xl bg-white shadow-sm relative overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-agri-green">
          <h2 className="text-xl flex items-center gap-2 font-semibold text-gray-900 tracking-tight">
            <Sparkles className="w-6 h-6 text-gray-900" strokeWidth={2.5}/> Insight AI
          </h2>
        </div>
        <div className="p-6 bg-white">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-900 font-bold">
              <Loader2 className="w-6 h-6 animate-spin text-gray-900" strokeWidth={3} />
              <span>Memformulasikan saran finansial...</span>
            </div>
          ) : (
            <div className="prose prose-p:font-medium prose-p:text-gray-900 prose-headings:font-semibold prose-headings:prose-strong:font-semibold max-w-none text-gray-900 leading-relaxed">
              <Markdown>{insight}</Markdown>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Line Chart: Tren Harga */}
        <div className="border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-amber-50">
            <h2 className="text-xl flex items-center gap-2 font-semibold text-gray-900 tracking-tight">
              <TrendingUp className="w-6 h-6 text-gray-900" strokeWidth={2.5} /> Tren Harga Bawang Merah
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
                  formatter={(value: number, name: string) => [formatRupiah(value), name === 'harga' ? 'Harga Aktual' : 'Prediksi Harga']}
                  contentStyle={{ borderRadius: '0px', border: '4px solid #000', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', backgroundColor: '#fff', fontWeight: 900 }}
                  labelStyle={{ color: '#000', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Line 
                  type="monotone" 
                  dataKey="harga" 
                  name="Harga Aktual" 
                  stroke="#000" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#fff', stroke: '#000', strokeWidth: 3 }} 
                  activeDot={{ r: 8, fill: '#ff00ff', stroke: '#000', strokeWidth: 3 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="hargaPrediksi" 
                  name="Prediksi Harga" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  strokeDasharray="8 8"
                  dot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }} 
                  activeDot={{ r: 8, fill: '#ff00ff', stroke: '#3b82f6', strokeWidth: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Proporsi Pengeluaran */}
        <div className="border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-purple-50">
            <h2 className="text-xl flex items-center gap-2 font-semibold text-gray-900 tracking-tight">
              <AlertCircle className="w-6 h-6 text-gray-900" strokeWidth={2.5}/> Pengeluaran Buku Tani
            </h2>
          </div>
          <div className="p-6 pt-8 flex-1 min-h-[350px] bg-white">
             {pieData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-900 text-center px-4 bg-white border border-dashed border-gray-200 rounded-3xl">
                  <p className="mb-2 font-semibold text-xl">Belum ada data pengeluaran.</p>
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
