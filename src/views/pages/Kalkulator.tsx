import { useState } from "react";
import { Loader2, TrendingUp, AlertCircle, Calculator } from "lucide-react";
import { predictHarvest, type PredictionResult } from "../../models/services/gemini";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Kalkulator() {
  const [form, setForm] = useState({ area: "", weather: "", capital: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input angka
    if (isNaN(Number(form.area)) || isNaN(Number(form.capital))) {
      setError("Luas lahan dan modal tanam harus berupa angka.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await predictHarvest(form.area, form.weather, form.capital);
      setResult(res);
      
      if (user) {
        try {
          const historyRef = collection(db, "users", user.uid, "history");
          await addDoc(historyRef, {
            userId: user.uid,
            type: "kalkulator",
            title: `Estimasi Panen Lahan ${form.area}`,
            data: {
              ...res,
              inputArea: form.area,
              inputWeather: form.weather,
              inputCapital: form.capital,
            },
            createdAt: serverTimestamp()
          });
        } catch (fbError) {
          try {
             handleFirestoreError(fbError, OperationType.CREATE, `users/${user.uid}/history/{historyId}`);
          } catch(e) {}
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses prediksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-7xl mx-auto">
       <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex items-center justify-between">
         <div className="relative z-10 max-w-2xl">
           <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Kalkulator Panen</h1>
           <p className="text-gray-600 mt-4 text-lg">
             Prediksi hasil panen dan atur strategi harga modal Anda berbasis data AI terkini.
           </p>
         </div>
         <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
           <Calculator className="w-64 h-64 text-gray-900" />
         </div>
       </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Luas Lahan (m² / Hektar) - Angka Saja</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 1.5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-500 bg-white"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Kondisi Cuaca Saat Ini</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Musim hujan, kelembapan tinggi"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-500 bg-white"
                    value={form.weather}
                    onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Modal Tanam (Rp) - Angka Saja</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 50000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-500 bg-white"
                    value={form.capital}
                    onChange={(e) => setForm({ ...form, capital: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-sm hover:-translate-y-1 hover:shadow-md active:scale-95 active:shadow-sm text-gray-900 font-semibold tracking-tight py-4 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" strokeWidth={3} /> Memproses AI...</>
                  ) : "Hitung Estimasi"}
                </button>

                {!user && (
                  <div className="border border-gray-200 rounded-xl bg-white p-3 flex items-start gap-3 shadow-sm mt-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-gray-900 mt-0.5" strokeWidth={2.5}/>
                    <p className="text-sm text-gray-900 font-bold">Data bisa tersimpan otomatis jika Anda <a href="/login" className="text-gray-900 bg-agri-green-light px-1 border-b-2 border-gray-200 hover:bg-amber-50 transition-colors font-semibold">Masuk</a>.</p>
                  </div>
                )}

                 {error && (
                  <div className="border border-gray-100 rounded-2xl bg-purple-50 p-4 flex items-start gap-3 shadow-sm mt-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-gray-900 mt-0.5" strokeWidth={3} />
                    <p className="text-gray-900 font-bold">{error}</p>
                  </div>
                )}
              </form>
          </div>
        </div>

        <div className="md:col-span-3">
          {result ? (
             <div className="space-y-6">
               <div className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center bg-amber-50">
                    <div className="w-12 h-12 border border-gray-200 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 text-gray-900 font-semibold">
                      <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Estimasi Hasil Panen</h4>
                      <p className="text-3xl font-semibold text-gray-900 tracking-tight" style={{ letterSpacing: "-0.05em" }}>
                        {result.estimatedYieldMin} - {result.estimatedYieldMax} Ton
                      </p>
                    </div>
                  </div>
                  <div className="p-6 text-base text-gray-900 font-medium leading-relaxed bg-white">
                    <strong className="text-gray-900 font-semibold bg-agri-green-light border border-gray-200 rounded-xl px-2 py-0.5 mr-2">Ringkasan:</strong> {result.summary}
                  </div>
               </div>

               <div className="grid sm:grid-cols-2 gap-6">
                  <div className="border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1 inline-block text-lg">
                        Strategi Pasar
                      </h4>
                      <ul className="space-y-3">
                         {result.marketingStrategy.map((strat, i) => (
                           <li key={i} className="flex gap-3 text-sm text-gray-900 font-medium items-start">
                              <span className="flex-shrink-0 w-6 h-6 border border-gray-200 rounded-xl bg-purple-50 flex items-center justify-center font-semibold text-xs">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{strat}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1 inline-block text-lg">
                        Tips Teknis
                      </h4>
                      <ul className="space-y-3">
                         {result.tips.map((tip, i) => (
                           <li key={i} className="flex gap-3 text-sm text-gray-900 font-medium items-start">
                              <span className="flex-shrink-0 w-6 h-6 border border-gray-200 rounded-xl bg-blue-50 flex items-center justify-center font-semibold text-xs">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{tip}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>
               </div>
             </div>
          ) : (
             <div className="h-full border border-dashed border-gray-200 rounded-3xl min-h-[300px] flex flex-col items-center justify-center text-gray-900 bg-white p-8 text-center text-lg font-bold shadow-inner">
                <div className="w-16 h-16 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                  <Calculator className="w-8 h-8 text-gray-900" strokeWidth={2.5}/>
                </div>
                <p className="max-w-md">Isi formulir di sebelah kiri untuk melihat estimasi perhitungan panen dan saran strategi penjualan.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
