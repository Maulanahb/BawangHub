import { useState } from "react";
import { Loader2, TrendingUp, AlertCircle, Calculator } from "lucide-react";
import { predictHarvest, type PredictionResult } from "../services/gemini";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Kalkulator() {
  const [form, setForm] = useState({ area: "", weather: "", capital: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Kalkulator Panen</h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Prediksi hasil panen dan atur strategi harga modal Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <Card className="shadow-none border-neutral-200 bg-white">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Luas Lahan (m² / Hektar)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1.5 Hektar"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Kondisi Cuaca Saat Ini</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Musim hujan, kelembapan tinggi"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={form.weather}
                    onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Modal Tanam (Rp)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rp 50.000.000"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={form.capital}
                    onChange={(e) => setForm({ ...form, capital: e.target.value })}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses AI...</>
                  ) : "Hitung Estimasi"}
                </Button>

                 {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2 mt-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          {result ? (
             <div className="space-y-6">
               <Card className="border-0 shadow-lg ring-1 ring-neutral-200 overflow-hidden bg-white">
                  <div className="p-6 border-b border-neutral-100 flex items-center bg-blue-50/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 text-blue-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500">Estimasi Hasil Panen</h4>
                      <p className="text-2xl font-bold text-neutral-900">
                        {result.estimatedYieldMin} - {result.estimatedYieldMax} Ton
                      </p>
                    </div>
                  </div>
                  <div className="p-6 text-sm text-neutral-600 leading-relaxed">
                    <strong className="text-neutral-900">Ringkasan:</strong> {result.summary}
                  </div>
               </Card>

               <div className="grid sm:grid-cols-2 gap-6">
                  <Card className="shadow-none border-neutral-200 bg-white">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        Strategi Pasar
                      </h4>
                      <ul className="space-y-3">
                         {result.marketingStrategy.map((strat, i) => (
                           <li key={i} className="flex gap-2 text-sm text-neutral-600">
                              <span className="text-blue-500 font-bold">•</span>
                              <span>{strat}</span>
                           </li>
                         ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-neutral-200 bg-white">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        Tips Teknis
                      </h4>
                      <ul className="space-y-3">
                         {result.tips.map((tip, i) => (
                           <li key={i} className="flex gap-2 text-sm text-neutral-600">
                              <span className="text-green-500 font-bold">•</span>
                              <span>{tip}</span>
                           </li>
                         ))}
                      </ul>
                    </CardContent>
                  </Card>
               </div>
             </div>
          ) : (
             <div className="h-full border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/50 p-8 text-center text-sm min-h-[300px]">
                <Calculator className="w-12 h-12 mb-4 text-neutral-300" />
                <p>Isi formulir di sebelah kiri untuk melihat estimasi perhitungan panen dan saran strategi penjualan.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
