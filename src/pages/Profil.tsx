import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
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
        const historyQuery = query(historyRef, orderBy("createdAt", "desc"), limit(10));
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
    } catch (error) {
      setMessage("Gagal memperbarui profil.");
      try {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      } catch(e) {}
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profil Pengguna</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Atur informasi lahan dan lihat riwayat aktivitas Anda.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-2xl border-none shadow-md ring-1 ring-black/5 p-6 overflow-hidden relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name || "Petani Bawang"}</h2>
              <p className="text-gray-500">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Masukkan nama"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Ruler className="w-4 h-4 text-green-600" /> Luas Lahan (m²)
                </label>
                <input
                  type="number"
                  value={profile.landArea || ''}
                  onChange={e => setProfile({...profile, landArea: e.target.value ? Number(e.target.value) : 0})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Contoh: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-sky-500" /> Domisili/Lokasi
                </label>
                <input
                  type="text"
                  value={profile.landLocation}
                  onChange={e => setProfile({...profile, landLocation: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Brebes, Jawa Tengah"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Gagal') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Simpan Perubahan
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border-none shadow-md ring-1 ring-black/5 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Histori Saya
          </h3>
          
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="p-4 border-none shadow-sm ring-1 ring-black/5 bg-gray-50 rounded-xl hover:bg-white transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.type === 'kalkulator' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {item.type === 'kalkulator' ? 'Kalkulator' : 'Klinik AI'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'}) : 'Baru saja'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {item.type === 'kalkulator' ? `Est. Panen: ${item.data.estimasiBerat_kg || 0} kg | Pendapatan: Rp ${(item.data.estimasiPendapatan || 0).toLocaleString('id-ID')}` : item.data.solusi || 'Analisis penyakit'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 text-sm mb-4">Belum ada riwayat aktivitas.</p>
              <div className="flex justify-center gap-4">
                <Link to="/kalkulator" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Coba Kalkulator &rarr;</Link>
                <Link to="/klinik" className="text-sm font-semibold text-green-600 hover:text-green-700">Coba Klinik &rarr;</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
