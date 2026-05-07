import { useState } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { analyzeShallotHealth, type AnalysisResult } from "../services/gemini";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Klinik Bawang</h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Upload foto daun bawang merah Anda, AI akan mendiagnosis penyakitnya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Column */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 bg-white hover:bg-neutral-50 transition-colors text-center cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg shadow-sm" />
            ) : (
              <div className="flex flex-col items-center py-6 text-neutral-500">
                <UploadCloud className="w-12 h-12 mb-4 text-green-500" />
                <p className="text-sm font-medium text-neutral-800">Klik atau drag foto ke sini</p>
                <p className="text-xs text-neutral-400 mt-1">JPEG, PNG up to 5MB</p>
              </div>
            )}
          </div>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white" 
            size="lg"
            disabled={!file || loading}
            onClick={handleAnalyze}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisis...
              </>
            ) : (
              "Diagnosis Sekarang"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Result Column */}
        <div>
          {result ? (
            <Card className="overflow-hidden border-0 shadow-xl shadow-green-900/5 ring-1 ring-neutral-200">
              <div className={`px-6 py-4 border-b ${result.isHealthy ? 'bg-green-50/80 border-green-100' : 'bg-red-50/80 border-red-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${result.isHealthy ? 'text-green-800' : 'text-red-800'}`}>
                    {result.diseaseName}
                  </h3>
                  <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-white ring-1 ring-black/5">
                    {result.confidence}
                  </span>
                </div>
              </div>
              <CardContent className="p-6 space-y-6 bg-white">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-2">Detail Gejala</h4>
                  <p className="text-neutral-600 text-sm leading-relaxed">{result.details}</p>
                </div>
                
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Rekomendasi Penanganan</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm text-neutral-600">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-medium text-xs">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
             <div className="h-full border border-neutral-200 border-dashed rounded-2xl flex items-center justify-center text-neutral-400 bg-neutral-50/50 p-8 text-center text-sm">
                Hasil diagnosis AI akan muncul di sini setelah Anda mengupload foto.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
