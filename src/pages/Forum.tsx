import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Thread } from "../types/forum";
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-green-600" />
            Forum Tani
          </h1>
          <p className="text-slate-500 mt-1">Diskusikan masalah pertanian, bagi pengalaman, dan dapatkan solusi.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Diskusi Baru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Belum ada diskusi</h3>
          <p className="text-slate-500 mt-1">Jadilah yang pertama memulai diskusi di Forum Tani.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              to={`/forum/${thread.id}`}
              className="block bg-white p-6 rounded-2xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group"
            >
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                {thread.judul}
              </h2>
              <p className="text-slate-600 mt-2 line-clamp-2 text-sm">
                {thread.isi_pesan}
              </p>
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-500">
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                  {thread.userName}
                </span>
                <span>•</span>
                <span>{thread.createdAt?.toDate ? thread.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Create Thread */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Buat Diskusi Baru</h2>
            </div>
            <form onSubmit={handleCreateThread} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Judul Diskusi</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Cara mengatasi hama ulat pada bawang merah"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Isi Pesan</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Jelaskan pertanyaan atau topik diskusi Anda secara detail..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900 resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newMessage.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-2 font-semibold text-white shadow-sm hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
