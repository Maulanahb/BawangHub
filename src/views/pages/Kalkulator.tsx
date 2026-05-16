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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
       <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Kalkulator Panen</h1>
        <p className="text-black font-medium mt-2 text-lg border-l-4 border-black pl-4">
          Prediksi hasil panen dan atur strategi harga modal Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase">Luas Lahan (m² / Hektar) - Angka Saja</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 1.5"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black placeholder:text-gray-500 bg-white"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase">Kondisi Cuaca Saat Ini</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Musim hujan, kelembapan tinggi"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black placeholder:text-gray-500 bg-white"
                    value={form.weather}
                    onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase">Modal Tanam (Rp) - Angka Saja</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 50000000"
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black placeholder:text-gray-500 bg-white"
                    value={form.capital}
                    onChange={(e) => setForm({ ...form, capital: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neo-blue border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-black font-black uppercase tracking-tight py-4 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" strokeWidth={3} /> Memproses AI...</>
                  ) : "Hitung Estimasi"}
                </button>

                {!user && (
                  <div className="border-2 border-black bg-neo-primary p-3 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-black mt-0.5" strokeWidth={2.5}/>
                    <p className="text-sm text-black font-bold">Data bisa tersimpan otomatis jika Anda <a href="/login" className="text-black bg-neo-accent px-1 border-b-2 border-black hover:bg-neo-yellow transition-colors font-black">Masuk</a>.</p>
                  </div>
                )}

                 {error && (
                  <div className="border-4 border-black bg-neo-pink p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-black mt-0.5" strokeWidth={3} />
                    <p className="text-black font-bold uppercase">{error}</p>
                  </div>
                )}
              </form>
          </div>
        </div>

        <div className="md:col-span-3">
          {result ? (
             <div className="space-y-6">
               <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="p-6 border-b-4 border-black flex items-center bg-neo-yellow">
                    <div className="w-12 h-12 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mr-4 text-black font-black">
                      <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-black uppercase">Estimasi Hasil Panen</h4>
                      <p className="text-3xl font-black text-black tracking-tight" style={{ letterSpacing: "-0.05em" }}>
                        {result.estimatedYieldMin} - {result.estimatedYieldMax} Ton
                      </p>
                    </div>
                  </div>
                  <div className="p-6 text-base text-black font-medium leading-relaxed bg-white">
                    <strong className="text-black font-black uppercase bg-neo-accent border-2 border-black px-2 py-0.5 mr-2">Ringkasan:</strong> {result.summary}
                  </div>
               </div>

               <div className="grid sm:grid-cols-2 gap-6">
                  <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-5">
                      <h4 className="font-black text-black mb-4 uppercase border-b-2 border-black pb-1 inline-block text-lg">
                        Strategi Pasar
                      </h4>
                      <ul className="space-y-3">
                         {result.marketingStrategy.map((strat, i) => (
                           <li key={i} className="flex gap-3 text-sm text-black font-medium items-start">
                              <span className="flex-shrink-0 w-6 h-6 border-2 border-black bg-neo-pink flex items-center justify-center font-black text-xs">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{strat}</span>
                           </li>
                         ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="p-5">
                      <h4 className="font-black text-black mb-4 uppercase border-b-2 border-black pb-1 inline-block text-lg">
                        Tips Teknis
                      </h4>
                      <ul className="space-y-3">
                         {result.tips.map((tip, i) => (
                           <li key={i} className="flex gap-3 text-sm text-black font-medium items-start">
                              <span className="flex-shrink-0 w-6 h-6 border-2 border-black bg-neo-blue flex items-center justify-center font-black text-xs">
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
             <div className="h-full border-4 border-black border-dashed min-h-[300px] flex flex-col items-center justify-center text-black bg-neo-primary p-8 text-center text-lg font-bold shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
                <div className="w-16 h-16 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                  <Calculator className="w-8 h-8 text-black" strokeWidth={2.5}/>
                </div>
                <p className="max-w-md">Isi formulir di sebelah kiri untuk melihat estimasi perhitungan panen dan saran strategi penjualan.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
