import { useState, useEffect } from "react";
import { Loader2, BookOpen, Receipt, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import { analyzeBukuTani, type BukuTaniRecord } from "../services/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BukuTani() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<BukuTaniRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("buku_tani_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecords = (newRecords: BukuTaniRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem("buku_tani_records", JSON.stringify(newRecords));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setLoading(true);
    setError(null);
    try {
      const extracted = await analyzeBukuTani(text);
      if (Array.isArray(extracted)) {
        saveRecords([...extracted, ...records]);
        setText("");
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses catatan.");
    } finally {
      setLoading(false);
    }
  };
  
  const clearRecords = () => {
    saveRecords([]);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Buku Tani Cerdas</h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Ketik aktivitas pengeluaran atau pemasukan dengan bahasa sehari-hari. AI akan mengekstrak otomatis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="shadow-none border-neutral-200 bg-white">
            <CardHeader className="p-5 border-b border-neutral-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Catat Aktivitas Keuangan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    rows={6}
                    required
                    placeholder="Contoh: Hari ini saya beli pupuk urea seharga 150 ribu, lalu bayar orang cabut rumput 50 ribu..."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 shadow-sm" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang Mengekstrak...</>
                  ) : "Simpan Catatan ke Database"}
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

        <div>
           <Card className="shadow-sm border-neutral-200 bg-white h-full flex flex-col overflow-hidden max-h-[600px]">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-neutral-500" /> Riwayat Keuangan
              </CardTitle>
              {records.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearRecords} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Bersihkan
                </Button>
              )}
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {records.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-50 text-neutral-500 sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-5 py-3 font-medium border-b border-neutral-200">Tanggal</th>
                      <th className="px-5 py-3 font-medium border-b border-neutral-200">Kategori</th>
                      <th className="px-5 py-3 font-medium border-b border-neutral-200 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {records.map((r, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50">
                        <td className="px-5 py-3 text-neutral-600 font-mono text-xs whitespace-nowrap">{r.tanggal}</td>
                        <td className="px-5 py-3 text-neutral-800 font-medium">{r.kategori}</td>
                        <td className="px-5 py-3 text-right text-neutral-900 font-bold whitespace-nowrap">{formatRupiah(r.nominal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-neutral-400 p-8 text-center text-sm">
                  <TrendingUp className="w-10 h-10 mb-3 text-neutral-200" />
                  <p>Belum ada catatan keuangan yang tersimpan di "Database" Anda.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
