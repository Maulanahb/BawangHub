import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Thread } from "../../models/types/forum";
import { MessageSquare, Plus, Loader2 } from "lucide-react";

export default function Forum() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "threads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const threadsData = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Thread, 'id'>),
          id: doc.id,
        })) as Thread[];
        setThreads(threadsData);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "threads");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "threads"), {
        userId: user.uid,
        userName: user.displayName || "Petani Anonim",
        judul: newTitle.trim(),
        isi_pesan: newMessage.trim(),
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewTitle("");
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "threads");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black flex items-center gap-2 uppercase" style={{ letterSpacing: "-0.05em" }}>
            <MessageSquare className="w-10 h-10 text-black" strokeWidth={2.5} />
            Forum Tani
          </h1>
          <p className="text-black font-medium mt-2 border-l-4 border-black pl-4">Diskusikan masalah pertanian, bagi pengalaman, dan dapatkan solusi.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center border-2 border-black bg-neo-yellow px-4 py-2.5 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <Plus className="w-5 h-5 mr-1 text-black" strokeWidth={2.5}/>
          Diskusi Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="flex items-center text-sm font-bold text-black border-2 border-black bg-white px-4 py-2 w-max shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memuat Forum...
           </div>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <MessageSquare className="w-12 h-12 text-black mx-auto mb-4" strokeWidth={2} />
          <h3 className="text-lg font-bold text-black uppercase">Belum ada diskusi</h3>
          <p className="text-black font-medium mt-1">Jadilah yang pertama memulai diskusi di Forum Tani.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/forum/${thread.id}`}
              className="block bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all group"
            >
              <h2 className="text-2xl font-black text-black group-hover:underline uppercase tracking-tight">
                {thread.judul}
              </h2>
              <p className="text-black font-medium mt-2 line-clamp-2 text-sm border-l-2 border-black pl-3">
                {thread.isi_pesan}
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs font-bold text-black">
                <span className="bg-neo-accent text-black border-2 border-black px-2 py-1">
                  {thread.userName}
                </span>
                <span>•</span>
                <span className="bg-white text-black border-2 border-black px-2 py-1">{thread.createdAt?.toDate ? thread.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Create Thread */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b-4 border-black bg-neo-pink">
              <h2 className="text-2xl font-black text-black uppercase tracking-tight">Buat Diskusi Baru</h2>
            </div>
            <form onSubmit={handleCreateThread} className="p-6 space-y-4 bg-white">
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-black mb-1 uppercase">Judul Diskusi</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Cara mengatasi hama ulat pada bawang merah"
                  className="w-full px-4 py-2.5 border-2 border-black bg-white focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black placeholder:text-gray-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-black mb-1 uppercase">Isi Pesan</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Jelaskan pertanyaan atau topik diskusi Anda secara detail..."
                  className="w-full px-4 py-2.5 border-2 border-black bg-white focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black resize-none placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-black border-2 border-transparent hover:border-black hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newMessage.trim()}
                  className="inline-flex items-center justify-center border-2 border-black bg-neo-accent px-6 py-2 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Diskusi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
