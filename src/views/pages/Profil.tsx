import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { doc, getDocFromServer, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { UserCircle, MapPin, Ruler, Loader2, Save, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profil() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    landArea: 0,
    landLocation: ""
  });
  
  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDocFromServer(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            name: data.name || user.displayName || "",
            email: data.email || user.email || "",
            landArea: data.landArea || 0,
            landLocation: data.landLocation || ""
          });
        }

        // Fetch History
        const historyRef = collection(db, "users", user.uid, "history");
        const historyQuery = query(historyRef, orderBy("createdAt", "desc"), limit(50));
        const historySnap = await getDocs(historyQuery);
        setHistory(historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const filteredHistory = history
    .filter((item) => {
      // Filter by type
      if (filterType !== "all" && item.type !== filterType) return false;
      
      // Filter by search
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(queryLower);
        const descText = item.type === 'kalkulator' 
          ? `Est. Panen: ${item.data?.estimasiBerat_kg || 0} kg | Pendapatan: Rp ${(item.data?.estimasiPendapatan || 0).toLocaleString('id-ID')}`
          : (item.data?.solusi || 'Analisis penyakit');
        const matchesDesc = descText.toLowerCase().includes(queryLower);
          
        return matchesTitle || matchesDesc;
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
      
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name: profile.name,
        landArea: Number(profile.landArea),
        landLocation: profile.landLocation,
        updatedAt: new Date()
      });
      setMessage("Profil berhasil diperbarui.");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage(error?.message ? `Gagal memperbarui profil: ${error.message}` : "Gagal memperbarui profil.");
      try {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      } catch(e) {}
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Profil Pengguna</h1>
        <p className="text-black font-medium mt-2 text-lg border-l-4 border-black pl-4">
          Atur informasi lahan dan lihat riwayat aktivitas Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-neo-yellow border-4 border-black text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <UserCircle className="w-10 h-10" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black uppercase">{profile.name || "Petani Bawang"}</h2>
              <p className="text-black font-bold border-2 border-black bg-neo-primary px-2 py-0.5 inline-block text-sm">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-black uppercase mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full border-2 border-black bg-white px-4 py-3 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-gray-500 font-medium text-black"
                placeholder="Masukkan nama"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-1">
                  <Ruler className="w-4 h-4 text-black" strokeWidth={3} /> Luas Lahan <span className="lowercase normal-case">(m²)</span>
                </label>
                <input
                  type="number"
                  value={profile.landArea || ''}
                  onChange={e => setProfile({...profile, landArea: e.target.value ? Number(e.target.value) : 0})}
                  className="w-full border-2 border-black bg-white px-4 py-3 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-gray-500 font-medium text-black"
                  placeholder="Contoh: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-black text-black uppercase mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-black" strokeWidth={3} /> Domisili/Lokasi
                </label>
                <input
                  type="text"
                  value={profile.landLocation}
                  onChange={e => setProfile({...profile, landLocation: e.target.value})}
                  className="w-full border-2 border-black bg-white px-4 py-3 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-gray-500 font-medium text-black"
                  placeholder="Brebes, Jawa Tengah"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 font-black uppercase text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${message.includes('Gagal') ? 'bg-neo-pink' : 'bg-neo-green'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-neo-blue border-4 border-black text-black font-black uppercase tracking-tight py-4 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} /> : <Save className="w-6 h-6" strokeWidth={2.5}/>}
              Simpan Perubahan
            </button>
          </form>
        </div>

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-2 border-b-4 border-black pb-2 inline-block">
            <FileText className="w-6 h-6 text-black" strokeWidth={3} /> Histori Saya
          </h3>
          
          {history.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-neo-primary p-4 border-4 border-black border-dashed">
              <input
                type="text"
                placeholder="Cari riwayat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 w-full border-2 border-black px-3 py-2 text-sm font-medium focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-1/2 sm:w-auto border-2 border-black px-3 py-2 text-sm font-bold bg-white focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                >
                  <option value="all">Semua</option>
                  <option value="kalkulator">Kalkulator</option>
                  <option value="klinik">Klinik AI</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                  className="w-1/2 sm:w-auto border-2 border-black px-3 py-2 text-sm font-bold bg-white focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                >
                  <option value="desc">Terbaru</option>
                  <option value="asc">Terlama</option>
                </select>
              </div>
            </div>
          )}

          {history.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.length > 0 ? (
                filteredHistory.map(item => (
                  <div key={item.id} className="p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-primary hover:bg-white transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-black uppercase border-2 border-black text-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.type === 'kalkulator' ? 'bg-neo-blue' : 'bg-neo-green'}`}>
                        {item.type === 'kalkulator' ? 'Kalkulator' : 'Klinik AI'}
                      </span>
                      <span className="text-xs text-black font-bold bg-white border border-black px-2 py-0.5">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'}) : 'Baru saja'}
                      </span>
                    </div>
                    <h4 className="font-black text-black text-lg mb-1 uppercase tracking-tight">{item.title}</h4>
                    <p className="text-sm font-medium text-black line-clamp-2 leading-relaxed">
                      {item.type === 'kalkulator' ? `Est. Panen: ${item.data.estimasiBerat_kg || 0} kg | Pendapatan: Rp ${(item.data.estimasiPendapatan || 0).toLocaleString('id-ID')}` : item.data.solusi || 'Analisis penyakit'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-black font-medium border-4 border-black border-dashed">
                  Pencarian tidak menemukan hasil.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-neo-primary border-4 border-black border-dashed">
              <p className="text-black font-black uppercase text-lg mb-4">Belum ada riwayat aktivitas.</p>
              <div className="flex justify-center gap-4">
                <Link to="/kalkulator" className="text-sm font-black uppercase bg-neo-yellow border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">Coba Kalkulator &rarr;</Link>
                <Link to="/klinik" className="text-sm font-black uppercase bg-neo-green border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">Coba Klinik &rarr;</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
