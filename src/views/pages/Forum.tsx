import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
  doc,
  limit,
  startAfter,
} from "firebase/firestore";
import {
  db,
  handleFirestoreError,
  OperationType,
} from "../../models/lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Thread } from "../../types/forum";
import { MessageSquare, Plus, Loader2, Trash2 } from "lucide-react";
import { Badge } from "../../components/Badge";

// Helper for gamification points
const getUserPoints = (userId: string) => {
  if (userId === "bawang-bot") return 0;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 900) + 100; // 100 to 1000 points
};

const isExpert = (points: number) => points >= 500;

export default function Forum() {
  const { user, isAdmin } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pageMarkers, setPageMarkers] = useState<any[]>([null]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const handleDeleteThread = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the detail page
    e.stopPropagation();
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus diskusi ini? Semua balasan juga akan ikut terhapus.",
      )
    )
      return;

    try {
      const batch = writeBatch(db);

      const repliesRef = collection(db, "threads", id, "replies");
      const repliesSnap = await getDocs(repliesRef);
      repliesSnap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      batch.delete(doc(db, "threads", id));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `threads/${id}`);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    let q = query(
      collection(db, "threads"),
      orderBy("createdAt", "desc"),
      limit(itemsPerPage + 1),
    );

    const currentMarker = pageMarkers[currentPage - 1];
    if (currentMarker) {
      q = query(
        collection(db, "threads"),
        orderBy("createdAt", "desc"),
        startAfter(currentMarker),
        limit(itemsPerPage + 1),
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let threadsData = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Thread, "id">),
          id: doc.id,
        })) as Thread[];

        if (threadsData.length > itemsPerPage) {
          setHasMore(true);
          threadsData.pop(); // Remove the extra item
        } else {
          setHasMore(false);
        }

        setThreads(threadsData);

        if (snapshot.docs.length > itemsPerPage) {
          const nextMarker = snapshot.docs[itemsPerPage - 1]; // The last item of the current page
          setPageMarkers((prev) => {
            const newMarkers = [...prev];
            newMarkers[currentPage] = nextMarker;
            return newMarkers;
          });
        }

        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "threads");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentPage]);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-10">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Forum Tani</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Diskusikan masalah pertanian, bagikan pengalaman memanen Anda, dan dapatkan solusi dari komunitas maupun pakar.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center border border-gray-200 rounded-xl bg-white px-6 py-3 text-base font-bold text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 mr-2 text-gray-900" strokeWidth={2.5} />
            Diskusi Baru
          </button>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <MessageSquare className="w-64 h-64 text-gray-900" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="flex items-center text-sm font-bold text-gray-900 border border-gray-200 rounded-xl bg-white px-4 py-2 w-max shadow-sm">
            <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memuat Forum...
          </div>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
          <MessageSquare
            className="w-12 h-12 text-gray-900 mx-auto mb-4"
            strokeWidth={2}
          />
          <h3 className="text-lg font-bold text-gray-900">
            Belum ada diskusi
          </h3>
          <p className="text-gray-900 font-medium mt-1">
            Jadilah yang pertama memulai diskusi di Forum Tani.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                to={`/forum/${thread.id}`}
                className="block bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-sm hover:-translate-y-1 hover:shadow-md transition-all group relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-2xl font-semibold text-gray-900 group-hover:underline tracking-tight">
                    {thread.judul}
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      className="flex-shrink-0 text-white bg-red-600 border border-gray-200 rounded-xl p-2 hover:bg-red-700 shadow-sm active:scale-95 active:shadow-sm transition-all"
                      title="Hapus Diskusi"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-900 font-medium mt-2 line-clamp-2 text-sm border-l-2 border-gray-200 pl-3">
                  {thread.isi_pesan}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-bold text-gray-900">
                  <span className="bg-agri-green-light text-gray-900 border border-gray-200 rounded-xl px-2 py-1 tracking-tight">
                    {thread.userName}
                  </span>
                  
                  {isExpert(getUserPoints(thread.userId)) && (
                    <Badge variant="expert" title={`${getUserPoints(thread.userId)} Poin Jawaban`}>
                      ★ PETANI PAKAR
                    </Badge>
                  )}
                  {!isExpert(getUserPoints(thread.userId)) && (
                    <Badge variant="outline" title={`${getUserPoints(thread.userId)} Poin Jawaban`}>
                      {getUserPoints(thread.userId)} Pts
                    </Badge>
                  )}

                  <span className="hidden sm:inline">•</span>
                  <span className="bg-white text-gray-900 border border-gray-200 rounded-xl px-2 py-1">
                    {thread.createdAt?.toDate
                      ? thread.createdAt
                          .toDate()
                          .toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                      : "Baru saja"}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:shadow-sm disabled:active:scale-100"
            >
              Prev
            </button>
            <span className="font-semibold text-gray-900 text-lg border border-gray-200 rounded-xl px-4 py-1.5 bg-amber-50 shadow-sm">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:shadow-sm disabled:active:scale-100"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal Create Thread */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-purple-50">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Buat Diskusi Baru
              </h2>
            </div>
            <form
              onSubmit={handleCreateThread}
              className="p-6 space-y-4 bg-white"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-bold text-gray-900 mb-1"
                >
                  Judul Diskusi
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Cara mengatasi hama ulat pada bawang merah"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold text-gray-900 mb-1"
                >
                  Isi Pesan
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Jelaskan pertanyaan atau topik diskusi Anda secara detail..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm transition-all font-medium text-gray-900 resize-none placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-900 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !newTitle.trim() || !newMessage.trim()
                  }
                  className="inline-flex items-center justify-center border border-gray-200 rounded-xl bg-agri-green-light px-6 py-2 font-bold text-gray-900 shadow-sm hover:-translate-y-1 hover:shadow-md hover:shadow-sm active:scale-95 active:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Kirim Diskusi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
