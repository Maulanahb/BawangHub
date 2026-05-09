import { Loader2, BookOpen, Receipt, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import { useBukuTaniController } from "../../controllers/useBukuTaniController";

export default function BukuTani() {
  const {
    text,
    setText,
    loading,
    records,
    error,
    handleSubmit,
    clearRecords
  } = useBukuTaniController();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Buku Tani Cerdas</h1>
        <p className="text-black font-medium mt-2 text-lg border-l-4 border-black pl-4">
          Ketik aktivitas pengeluaran atau pemasukan dengan bahasa sehari-hari. AI akan mengekstrak otomatis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b-4 border-black bg-neo-pink">
              <h2 className="text-xl flex items-center gap-2 font-black uppercase text-black tracking-tight">
                <BookOpen className="w-6 h-6 text-black" strokeWidth={2.5}/> Catat Aktivitas Keuangan
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    rows={6}
                    required
                    placeholder="Contoh: Hari ini saya beli pupuk urea seharga 150 ribu, lalu bayar orang cabut rumput 50 ribu..."
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black placeholder:text-gray-500 bg-white resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neo-accent border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-black font-black uppercase tracking-tight py-4 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" strokeWidth={3} /> Sedang Mengekstrak...</>
                  ) : "Simpan Catatan ke Database"}
                </button>

                {error && (
                  <div className="border-4 border-black bg-neo-pink p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-black mt-0.5" strokeWidth={3} />
                    <p className="text-black font-bold uppercase">{error}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div>
           <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full overflow-hidden max-h-[600px]">
            <div className="p-5 border-b-4 border-black bg-neo-blue flex items-center justify-between shrink-0">
              <h2 className="text-xl flex items-center gap-2 font-black uppercase text-black tracking-tight">
                <Receipt className="w-6 h-6 text-black" strokeWidth={2.5}/> Riwayat Keuangan
              </h2>
              {records.length > 0 && (
                <button onClick={clearRecords} className="border-2 border-black bg-neo-pink hover:bg-white text-black font-bold text-xs uppercase px-3 py-2 flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  <Trash2 className="w-4 h-4 mr-1" strokeWidth={2.5}/> Bersihkan
                </button>
              )}
            </div>
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              {records.length > 0 ? (
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-neo-yellow text-black sticky top-0 border-b-4 border-black z-10">
                    <tr>
                      <th className="px-5 py-4 font-black uppercase text-xs border-r-2 border-black border-collapse">Tanggal</th>
                      <th className="px-5 py-4 font-black uppercase text-xs border-r-2 border-black border-collapse">Kategori</th>
                      <th className="px-5 py-4 font-black uppercase text-xs text-right border-collapse">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {records.map((r, i) => (
                      <tr key={i} className="hover:bg-neo-primary transition-colors">
                        <td className="px-5 py-4 text-black font-bold text-xs whitespace-nowrap border-r-2 border-black">{r.tanggal}</td>
                        <td className="px-5 py-4 text-black font-black uppercase">{r.kategori}</td>
                        <td className="px-5 py-4 text-right text-black font-black whitespace-nowrap bg-neo-accent/20">{formatRupiah(r.nominal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-black p-8 text-center bg-neo-primary">
                  <div className="w-16 h-16 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                    <TrendingUp className="w-8 h-8 text-black" strokeWidth={2.5} />
                  </div>
                  <p className="font-bold text-lg max-w-xs uppercase">Belum ada catatan keuangan yang tersimpan di "Database" Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
