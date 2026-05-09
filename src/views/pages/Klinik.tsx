import { useState } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
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
        let result = reader.result as string;
        // remove data:image/jpeg;base64,
        result = result.split(',')[1];
        resolve(result);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Klinik Bawang</h1>
        <p className="text-black font-medium mt-2 text-lg border-l-4 border-black pl-4">
          Upload foto daun bawang merah Anda, AI akan mendiagnosis penyakitnya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Column */}
        <div className="space-y-4">
          <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-yellow hover:bg-neo-blue transition-colors text-center cursor-pointer relative p-8 group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {preview ? (
              <div className="border-4 border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                <img src={preview} alt="Preview" className="mx-auto max-h-64 object-cover" />
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-black">
                <div className="w-16 h-16 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                    <UploadCloud className="w-8 h-8 text-black" strokeWidth={2.5} />
                </div>
                <p className="text-lg font-bold text-black uppercase tracking-tight">Pilih Foto Daun</p>
                <p className="text-xs font-bold bg-white border-2 border-black px-2 py-0.5 mt-2">JPEG, PNG up to 5MB</p>
              </div>
            )}
          </div>
          
          <button 
            className="w-full bg-neo-accent border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-black font-black uppercase tracking-tight py-4 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center" 
            disabled={!file || loading}
            onClick={handleAnalyze}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" strokeWidth={3} /> Menganalisis...
              </>
            ) : (
              "Diagnosis Sekarang"
            )}
          </button>

          {!user && (
            <div className="border-2 border-black bg-white p-3 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-black mt-0.5" strokeWidth={2.5}/>
              <p className="text-sm text-black font-bold">Riwayat diagnosis bisa tersimpan jika Anda <a href="/login" className="text-black bg-neo-accent px-1 border-b-2 border-black hover:bg-neo-yellow transition-colors font-black">Masuk</a>.</p>
            </div>
          )}

          {error && (
            <div className="border-4 border-black bg-neo-pink p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-black mt-0.5" strokeWidth={3} />
              <p className="text-black font-bold uppercase">{error}</p>
            </div>
          )}
        </div>

        {/* Result Column */}
        <div>
          {result ? (
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
              <div className={`p-6 border-b-4 border-black ${result.isHealthy ? 'bg-neo-accent' : 'bg-neo-pink'}`}>
                <div className="flex flex-col gap-2 relative">
                  <h3 className={`text-2xl font-black text-black uppercase tracking-tight bg-white border-2 border-black p-2 inline-block w-max shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-1`}>
                    {result.diseaseName}
                  </h3>
                  <span className="text-sm font-bold px-2 py-1 bg-white border-2 border-black w-max absolute right-0 top-0 rotate-2">
                    Akurasi: {result.confidence}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-6 flex-1">
                <div>
                  <h4 className="text-lg font-black text-black mb-2 uppercase border-b-2 border-black pb-1 inline-block">Detail Gejala</h4>
                  <p className="text-black font-medium leading-relaxed mt-2 border-l-4 border-neo-yellow pl-3">{result.details}</p>
                </div>
                
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-black text-black mb-4 uppercase border-b-2 border-black pb-1 inline-block">Rekomendasi Penanganan</h4>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-4 items-start text-black font-medium">
                          <span className="flex-shrink-0 w-8 h-8 border-2 border-black bg-neo-blue shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black">
                            {i + 1}
                          </span>
                          <span className="pt-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="h-full border-4 border-black border-dashed min-h-[300px] flex items-center justify-center text-black bg-neo-primary p-8 text-center text-lg font-bold shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)]">
                Hasil diagnosis AI akan muncul di sini setelah Anda mengupload foto.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
