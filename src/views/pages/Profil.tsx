import { useState, useEffect, useRef } from "react";
import { useAuth } from "../components/AuthProvider";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { doc, getDocFromServer, setDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { UserCircle, MapPin, Ruler, Loader2, Save, FileText, ArrowRight, Bot, Send, User, MessageSquare, AlertCircle, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { analyzeHistoryChat, type ChatMessage } from "../../models/services/gemini";
import ReactMarkdown from "react-markdown";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortOrder]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Feedback state
  const [feedbackInput, setFeedbackInput] = useState("");
  const [feedbackType, setFeedbackType] = useState("saran"); // or "kendala" 
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

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
        const queryWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 0);
        const matchesTitle = item.title?.toLowerCase() || '';
        const descText = item.type === 'kalkulator' 
          ? `Est. Panen: ${item.data?.estimasiBerat_kg || 0} kg | Pendapatan: Rp ${(item.data?.estimasiPendapatan || 0).toLocaleString('id-ID')}`
          : (item.data?.solusi || 'Analisis penyakit');
        const matchesDesc = descText.toLowerCase();
          
        const typeStr = item.type.toLowerCase();
        const fullTextSearch = (matchesTitle + " " + matchesDesc + " " + typeStr).toLowerCase();

        return queryWords.every(word => fullTextSearch.includes(word));
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
      const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
      
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        name: profile.name,
        landArea: Number(profile.landArea),
        landLocation: profile.landLocation,
        updatedAt: new Date()
      }, { merge: true });
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim() || !user) return;
    
    setFeedbackStatus("loading");
    try {
      await addDoc(collection(db, "feedbacks"), {
        userId: user.uid,
        email: profile.email || user.email || "",
        message: feedbackInput.trim(),
        type: feedbackType,
        createdAt: serverTimestamp()
      });
      setFeedbackStatus("success");
      setFeedbackInput("");
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setFeedbackStatus("error");
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const usermsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: usermsg } as ChatMessage]);
    setChatLoading(true);

    // Format user data
    const userDataStr = `
Nama: ${profile.name || 'Belum diatur'}
Email: ${profile.email}
Luas Lahan: ${profile.landArea ? profile.landArea + ' m²' : 'Belum diatur'}
Lokasi: ${profile.landLocation || 'Belum diatur'}

Data Riwayat (maksimal 50 histori terakhir):
${history.map((h, i) => {
  const t = h.createdAt?.toDate ? h.createdAt.toDate().toLocaleDateString('id-ID') : 'Tidak diketahui';
  let details = '';
  if (h.type === 'kalkulator') {
    details = `Panen: ${h.data?.estimatedYieldMin || 0}-${h.data?.estimatedYieldMax || 0} Ton. Modal: Rp${h.data?.inputCapital || 0}`;
  } else {
    details = h.data?.solusi || h.data?.details || 'Analisis penyakit';
  }
  return `${i+1}. [${t}] - ${h.title} (${h.type}) -> ${details}`;
}).join('\\n')}
`;

    try {
      const reply = await analyzeHistoryChat(chatMessages, usermsg, userDataStr);
      setChatMessages((prev) => [...prev, { role: "model", text: reply } as ChatMessage]);
    } catch (err: any) {
      console.error("Gagal mengirim pesan chat:", err);
      // Fallback message should have already been handled by handleGeminiError throwing it over, but let's be safe.
      setChatMessages((prev) => [...prev, { role: "model", text: err.message || "Maaf, Agri AI sedang mengalami gangguan." } as ChatMessage]);
    } finally {
      setChatLoading(false);
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
            <div className="w-16 h-16 shrink-0 bg-neo-yellow border-4 border-black text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <UserCircle className="w-10 h-10" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase leading-tight line-clamp-2" title={profile.name || "Petani Bawang"}>{profile.name || "Petani Bawang"}</h2>
              <div className="mt-1">
                <p className="text-black font-bold border-2 border-black bg-neo-primary px-2 py-0.5 inline-block text-xs sm:text-sm truncate max-w-full align-middle" title={profile.email}>{profile.email}</p>
              </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-black text-black uppercase mb-2">
                  <Ruler className="w-4 h-4 text-black shrink-0" strokeWidth={3} /> 
                  <span className="truncate">Luas Lahan <span className="lowercase normal-case">(m²)</span></span>
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
                <label className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-black text-black uppercase mb-2">
                  <MapPin className="w-4 h-4 text-black shrink-0" strokeWidth={3} /> 
                  <span className="truncate">Domisili / Lokasi</span>
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

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 overflow-hidden relative">
          <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mb-4 flex items-center gap-2 border-b-4 border-black pb-2 inline-block">
            <FileText className="w-6 h-6 text-black shrink-0" strokeWidth={3} /> Histori Saya
          </h3>
          
          {history.length > 0 && (
            <div className="flex flex-col 2xl:flex-row gap-3 mb-6 bg-neo-primary p-3 sm:p-4 border-4 border-black border-dashed">
              <input
                type="text"
                placeholder="Cari riwayat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full 2xl:flex-1 min-w-0 border-2 border-black px-3 py-2 text-sm font-medium focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
              />
              <div className="flex gap-2 w-full 2xl:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 min-w-0 border-2 border-black px-2 py-2 text-sm font-bold bg-white focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                >
                  <option value="all">Semua</option>
                  <option value="kalkulator">Kalkulator</option>
                  <option value="klinik">Klinik AI</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                  className="flex-1 min-w-0 border-2 border-black px-2 py-2 text-sm font-bold bg-white focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
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
                <>
                  <div className="space-y-4">
                    {paginatedHistory.map(item => (
                      <div key={item.id} className="p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-primary hover:bg-white transition-colors relative overflow-hidden">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <span className={`text-xs font-black uppercase border-2 border-black text-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap ${item.type === 'kalkulator' ? 'bg-neo-blue' : 'bg-neo-green'}`}>
                            {item.type === 'kalkulator' ? 'Kalkulator' : 'Klinik AI'}
                          </span>
                          <span className="text-xs text-black font-bold bg-white border border-black px-2 py-0.5 whitespace-nowrap">
                            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'}) : 'Baru saja'}
                          </span>
                        </div>
                        <h4 className="font-black text-black text-lg mb-1 uppercase tracking-tight break-words line-clamp-2">{item.title}</h4>
                        <p className="text-sm font-medium text-black line-clamp-2 leading-relaxed break-words">
                          {item.type === 'kalkulator' ? `Est. Panen: ${item.data.estimatedYieldMin || 0} - ${item.data.estimatedYieldMax || 0} Ton | Modal: Rp ${Number(item.data.inputCapital || 0).toLocaleString('id-ID')}` : item.data.solusi || item.data.details || 'Analisis penyakit'}
                        </p>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-6 text-sm sm:text-base">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:active:translate-y-0 disabled:active:translate-x-0"
                      >
                        Prev
                      </button>
                      <span className="font-bold text-black border-2 border-black px-3 py-1 bg-neo-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:active:translate-y-0 disabled:active:translate-x-0"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
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

      {/* AI Chat History Section */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mt-8 flex flex-col h-[70vh] min-h-[500px] max-h-[700px] animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="flex items-center gap-3 border-b-4 border-black pb-4 shrink-0">
          <div className="w-12 h-12 bg-neo-yellow border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Bot className="w-7 h-7 text-black" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">Tanya Agri AI</h2>
            <p className="text-sm text-black font-medium">Bahas dan tanyakan apa saja seputar data profil & histori Anda.</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto pt-6 pb-4 space-y-6 scrollbar-hide">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-4 border-black border-dashed bg-neo-primary">
              <Bot className="w-16 h-16 text-black opacity-50 mb-4" />
              <p className="text-black font-black uppercase text-lg">Belum ada obrolan.</p>
              <p className="text-black font-medium mt-2 max-w-sm">Tanyakan Agri AI tentang riwayat panen, gejala penyakit dari klinik, atau info terkait data profil Anda.</p>
            </div>
          ) : (
            chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex w-full gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <>
                    <div className="max-w-[75%] md:max-w-[80%] rounded-xl border-2 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-primary text-black">
                      <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </div>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-black rounded-lg flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                      <User className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-black rounded-lg flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-neo-yellow">
                      <Bot className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                    <div className="max-w-[75%] md:max-w-[80%] rounded-xl border-2 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black">
                      <div className="prose prose-sm md:prose-base prose-p:leading-relaxed max-w-none text-black">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          {chatLoading && (
            <div className="flex gap-4">
              <div className="w-12 h-12 border-2 border-black rounded-lg bg-neo-yellow flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="w-7 h-7 animate-spin text-black" />
              </div>
              <div className="bg-neo-primary border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-bold text-black animate-pulse">Agri AI sedang menganalisis histori Anda...</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="pt-4 border-t-4 border-black shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={chatLoading ? "Menunggu respon..." : "Tanya sesuatu ke Agri AI..."}
              disabled={chatLoading}
              className="flex-1 border-4 border-black px-4 py-3 md:py-4 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none font-medium text-black bg-white disabled:bg-gray-100 disabled:opacity-75 transition-all text-sm md:text-base placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="bg-neo-green border-4 border-black px-6 md:px-8 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all text-black"
            >
              <Send className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5}/>
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6 shrink-0">
          <div className="w-12 h-12 bg-neo-pink border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <MessageSquare className="w-7 h-7 text-black" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">Kritik & Saran</h2>
            <p className="text-sm text-black font-medium">Bantu kami meningkatkan aplikasi Agri AI untuk Anda.</p>
          </div>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
          {feedbackStatus === "success" && (
            <div className="p-4 bg-neo-green font-black uppercase text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
              ✅ Terima kasih! Pesan Anda telah kami terima.
            </div>
          )}
          {feedbackStatus === "error" && (
            <div className="p-4 bg-neo-pink font-black uppercase text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
              ⚠️ Terjadi kesalahan. Coba lagi nanti.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <label className={`flex-1 cursor-pointer p-4 border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${feedbackType === 'saran' ? 'bg-neo-blue translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-neo-blue'}`}>
              <input type="radio" name="feedbackType" value="saran" className="hidden" onChange={() => setFeedbackType('saran')} checked={feedbackType === 'saran'} />
              <div className="flex items-center gap-2 font-black uppercase text-black">
                <Lightbulb className="w-5 h-5"/> Saran Fitur
              </div>
            </label>
            <label className={`flex-1 cursor-pointer p-4 border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${feedbackType === 'kendala' ? 'bg-neo-yellow translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-neo-yellow'}`}>
              <input type="radio" name="feedbackType" value="kendala" className="hidden" onChange={() => setFeedbackType('kendala')} checked={feedbackType === 'kendala'} />
              <div className="flex items-center gap-2 font-black uppercase text-black">
                <AlertCircle className="w-5 h-5"/> Lapor Kendala
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-black text-black uppercase mb-2">Pesan Anda</label>
            <textarea
              value={feedbackInput}
              onChange={e => setFeedbackInput(e.target.value)}
              required
              rows={4}
              className="w-full border-4 border-black bg-white px-4 py-3 focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-gray-500 font-medium text-black resize-none"
              placeholder="Sampaikan kritik, saran, atau kendala yang Anda alami..."
            />
          </div>

          <button
            type="submit"
            disabled={feedbackStatus === "loading"}
            className="w-full sm:w-auto bg-neo-yellow border-4 border-black px-8 py-3 flex items-center justify-center font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 transition-all text-black gap-2"
          >
            {feedbackStatus === "loading" ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
            ) : (
              <><Send className="w-5 h-5" /> Kirim Pesan</>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
