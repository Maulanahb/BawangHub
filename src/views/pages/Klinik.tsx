import { useState } from "react";
import { UploadCloud, Loader2, AlertCircle, Stethoscope } from "lucide-react";
import { analyzeShallotHealth, type AnalysisResult } from "../../models/services/gemini";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Klinik() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const base64Data = await getBase64(file);
      const res = await analyzeShallotHealth(base64Data, file.type);
      setResult(res);
      
      if (user) {
        try {
          const historyRef = collection(db, "users", user.uid, "history");
          await addDoc(historyRef, {
            userId: user.uid,
            type: "klinik",
            title: `Diagnosis: ${res.diseaseName}`,
            data: {
              ...res,
              solusi: res.recommendations?.[0] || res.details
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
      setError(err.message || "Gagal menganalisis gambar.");
    } finally {
      setLoading(false);
    }
  };

  const getBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => {
        const result = reader.result as string;
        // Return full data URL — stripping is handled in gemini.ts
        resolve(result);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Klinik Bawang</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Diagnosa kesehatan dan cek penyakit daun bawang merah Anda dengan cepat hanya menggunakan foto.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Stethoscope className="w-64 h-64 text-gray-900" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Upload Column */}
        <div className="space-y-4">
          <div className="border border-dashed border-gray-300 rounded-3xl bg-gray-50 hover:bg-agri-green-light/50 transition-colors text-center cursor-pointer relative p-8 md:p-12 group flex flex-col items-center justify-center min-h-[300px]">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {preview ? (
              <div className="bg-white rounded-2xl p-2 shadow-sm relative z-20 w-full max-w-sm mx-auto">
                <img src={preview} alt="Preview" className="mx-auto rounded-xl w-full max-h-64 object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-600 space-y-4">
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                    <UploadCloud className="w-10 h-10 text-agri-green" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                   <p className="text-xl font-semibold text-gray-900">Tap / Klik Di Sini</p>
                   <p className="font-medium text-sm text-gray-500">Ambil Foto Daun</p>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="w-full bg-agri-green text-white rounded-xl hover:bg-agri-green-dark shadow-sm text-sm font-semibold py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
            disabled={!file || loading}
            onClick={handleAnalyze}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memeriksa...
              </>
            ) : (
              "Diagnosis Sekarang"
            )}
          </button>

          {!user && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 mt-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
              <p className="text-sm text-blue-800 font-medium">Riwayat diagnosis bisa tersimpan jika Anda <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline">Masuk/Daftar</a>.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 mt-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm text-red-800 font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Result Column */}
        <div>
          {result ? (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col h-full overflow-hidden relative">
              <div className={`p-6 border-b border-gray-100 ${result.severity === 'Aman' ? 'bg-agri-green-light' : 'bg-red-50'}`}>
                <div className="flex flex-col gap-2 relative">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    {result.diseaseName}
                  </h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full w-max mt-2 border ${result.severity === 'Aman' ? 'bg-agri-green text-white border-agri-green' : 'bg-white text-red-600 border-red-200'}`}>
                    Akurasi: {result.confidence}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-8 flex-1">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Detail Gejala</h4>
                  <p className="text-gray-600 font-medium leading-relaxed mt-2 p-4 bg-gray-50 rounded-xl">{result.details}</p>
                </div>
                
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-4">Rekomendasi Penanganan</h4>
                    <ul className="space-y-4">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-4 items-start text-gray-700 font-medium bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-agri-green-light text-agri-green-dark flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </span>
                          <span className="pt-1 text-sm leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="h-full border border-dashed border-gray-200 rounded-3xl min-h-[300px] flex items-center justify-center text-gray-400 bg-gray-50 p-8 text-center font-medium">
                Hasil diagnosis AI akan muncul di sini setelah Anda mengupload foto.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
