import { Loader2, BookOpen, Receipt, TrendingUp, AlertCircle, Trash2, Download } from "lucide-react";
import { useBukuTaniController } from "../../controllers/useBukuTaniController";

export default function BukuTani() {
  const {
    text,
    setText,
    loading,
    records,
    filteredAndSortedRecords,
    error,
    handleSubmit,
    clearRecords,
    categories,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder
  } = useBukuTaniController();

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const exportToCSV = () => {
    if (filteredAndSortedRecords.length === 0) return;
    
    const headers = ['Tanggal', 'Kategori', 'Nominal'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedRecords.map(r => `"${r.tanggal}","${r.kategori}","${r.nominal}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "BukuTani_Riwayat_Keuangan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Buku Tani Cerdas</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Ketik aktivitas pengeluaran atau pemasukan dengan bahasa sehari-hari. AI akan mengekstraknya secara otomatis.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <BookOpen className="w-64 h-64 text-gray-900" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-purple-50">
              <h2 className="text-xl flex items-center gap-2 font-semibold text-purple-900">
                <BookOpen className="w-6 h-6 text-purple-600" /> Catat Aktivitas Keuangan
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <textarea
                    rows={6}
                    required
                    placeholder="Contoh: Hari ini saya beli pupuk urea seharga 150 ribu, lalu bayar orang cabut rumput 50 ribu..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium text-gray-800 placeholder:text-gray-400 bg-gray-50 resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 text-white rounded-xl hover:bg-purple-700 hover:shadow-md text-sm font-semibold py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Sedang Mengekstrak...</>
                  ) : "Simpan Catatan ke Database"}
                </button>

                {error && (
                  <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-start gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="font-semibold text-sm">{error}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div>
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden max-h-[600px]">
            <div className="p-5 border-b border-gray-100 bg-blue-50 flex justify-between items-center shrink-0">
              <h2 className="text-xl flex items-center gap-2 font-semibold text-blue-900">
                <Receipt className="w-6 h-6 text-blue-600" /> Riwayat Keuangan
              </h2>
              {records.length > 0 && (
                <div className="flex items-center gap-2">
                  <button onClick={exportToCSV} className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-xs rounded-lg px-3 py-2 flex items-center transition-colors">
                    <Download className="w-4 h-4 mr-1" /> Ekspor CSV
                  </button>
                  <button onClick={clearRecords} className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-xs rounded-lg px-3 py-2 flex items-center transition-colors">
                    <Trash2 className="w-4 h-4 mr-1" /> Bersihkan
                  </button>
                </div>
              )}
            </div>
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              {records.length > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 p-5 border-b border-gray-100 bg-gray-50">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Filter Kategori</label>
                      <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Urutkan Tanggal</label>
                      <select 
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="w-full border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="desc">Terbaru</option>
                        <option value="asc">Terlama</option>
                      </select>
                    </div>
                  </div>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b border-gray-200 z-10">
                      <tr>
                        <th className="px-5 py-3 font-semibold text-xs border-r border-gray-100">Tanggal</th>
                        <th className="px-5 py-3 font-semibold text-xs border-r border-gray-100">Kategori</th>
                        <th className="px-5 py-3 font-semibold text-xs text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAndSortedRecords.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 text-gray-600 font-medium text-xs whitespace-nowrap border-r border-gray-100">{r.tanggal}</td>
                          <td className="px-5 py-4 text-gray-800 font-semibold">{r.kategori}</td>
                          <td className="px-5 py-4 text-right text-gray-900 font-bold whitespace-nowrap bg-blue-50/20">{formatRupiah(r.nominal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50/50">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                     <TrendingUp className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="font-medium text-sm max-w-xs">Belum ada catatan keuangan yang tersimpan di "Database" Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
