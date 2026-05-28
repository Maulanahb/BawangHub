import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, serverTimestamp, writeBatch, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Thread, Reply } from "../../types/forum";
import { getAgriAIReply } from "../../models/services/gemini";
import { ArrowLeft, Send, Loader2, Bot, User as UserIcon, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
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

export default function ForumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Fetch Thread Details
    const fetchThread = async () => {
      try {
        const docRef = doc(db, "threads", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setThread({ id: docSnap.id, ...docSnap.data() } as Thread);
        } else {
          setThread(null);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `threads/${id}`);
      }
    };

    fetchThread();

    // Listen to Replies
    const q = query(collection(db, "threads", id, "replies"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const repliesData = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<Reply, 'id'>),
          id: doc.id,
        })) as Reply[];
        setReplies(repliesData);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `threads/${id}/replies`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !replyText.trim() || !thread) return;

    const messageToPost = replyText.trim();
    setReplyText("");
    setIsSubmitting(true);

    try {
      // 1. Save user's reply
      await addDoc(collection(db, "threads", id, "replies"), {
        threadId: id,
        userId: user.uid,
        userName: user.displayName || "Petani Anonim",
        isi_balasan: messageToPost,
        is_ai_generated: false,
        createdAt: serverTimestamp(),
      });

      // 2. Check for @AgriAI
      if (messageToPost.includes("@AgriAI")) {
        const previousRepliesStr = replies.map(r => `[${r.userName}]: ${r.isi_balasan}`).join("\n");
        const threadDetailsStr = `Judul: ${thread.judul}\nIsi: ${thread.isi_pesan}`;
        
        try {
          const aiResponseText = await getAgriAIReply(threadDetailsStr, previousRepliesStr, messageToPost);
          
          await addDoc(collection(db, "threads", id, "replies"), {
            threadId: id,
            userId: "bawang-bot",
            userName: "Agri AI",
            isi_balasan: aiResponseText,
            is_ai_generated: true,
            createdAt: serverTimestamp(),
          });
        } catch (aiError) {
          console.error("Failed to get AI reply:", aiError);
          // Optionally, add a fallback reply if AI fails
        }
      }
      
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `threads/${id}/replies`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!id || !window.confirm("Apakah Anda yakin ingin menghapus diskusi ini? Semua balasan juga akan ikut terhapus.")) return;
    
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      // Get all replies and add them to batch delete
      const repliesRef = collection(db, "threads", id, "replies");
      const repliesSnap = await getDocs(repliesRef);
      repliesSnap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      
      // Delete the main thread doc
      batch.delete(doc(db, "threads", id));
      
      // Commit the batch
      await batch.commit();
      
      navigate("/forum");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `threads/${id}`);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900">Diskusi tidak ditemukan</h2>
        <Link to="/forum" className="text-green-600 mt-4 inline-block hover:underline">
          <ArrowLeft className="w-4 h-4 inline mr-1" /> Kembali ke Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/forum" className="inline-flex items-center text-sm font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-200 transition-colors w-max">
          <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={2.5} /> Kembali ke Daftar Diskusi
        </Link>
        
        {isAdmin && (
          <button 
            onClick={handleDeleteThread}
            disabled={isSubmitting}
            className="flex items-center gap-1 font-bold text-white bg-red-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-red-700 shadow-sm active:scale-95 active:shadow-sm transition-all disabled:opacity-50 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Diskusi
          </button>
        )}
      </div>

      {/* Main Thread Post */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
            {thread.judul}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-900 border-b border-gray-100 pb-6 font-bold">
            <div className="w-8 h-8 bg-amber-50 border border-gray-200 rounded-xl shadow-sm flex items-center justify-center text-gray-900">
              {thread.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-gray-900">{thread.userName}</span>
              
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

              <span className="mx-2 hidden sm:inline">•</span>
              <span className="bg-agri-green-light border border-gray-200 rounded-xl px-2 py-0.5 whitespace-nowrap">{thread.createdAt?.toDate ? thread.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
          </div>
          <div className="mt-6 text-gray-900 font-medium leading-relaxed whitespace-pre-wrap">
            {thread.isi_pesan}
          </div>
        </div>
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <div 
            key={reply.id} 
            className={`p-6 border border-gray-200 rounded-xl shadow-sm ${reply.is_ai_generated ? 'bg-blue-50 ml-4 sm:ml-8' : 'bg-white'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${reply.is_ai_generated ? 'bg-purple-50 text-gray-900' : 'bg-amber-50 text-gray-900'}`}>
                {reply.is_ai_generated ? <Bot className="w-4 h-4" strokeWidth={2.5}/> : <UserIcon className="w-4 h-4" strokeWidth={2.5}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`font-semibold text-sm ${reply.is_ai_generated ? 'text-gray-900' : 'text-gray-900'}`}>
                    {reply.userName}
                  </span>
                  
                  {!reply.is_ai_generated && isExpert(getUserPoints(reply.userId)) && (
                    <Badge variant="expert" title={`${getUserPoints(reply.userId)} Poin Jawaban`}>
                      ★ PETANI PAKAR
                    </Badge>
                  )}
                  {!reply.is_ai_generated && !isExpert(getUserPoints(reply.userId)) && (
                    <Badge variant="outline" title={`${getUserPoints(reply.userId)} Poin Jawaban`}>
                      {getUserPoints(reply.userId)} Pts
                    </Badge>
                  )}

                  <span className="text-xs text-gray-900 font-bold border border-gray-200 rounded-xl bg-white px-2 py-0.5">
                    {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {reply.is_ai_generated && (
                    <Badge variant="ai">
                      AI ASSIST
                    </Badge>
                  )}
                </div>
                {/* if it's AI, use markdown */}
                <div className={`text-sm sm:text-base leading-relaxed font-medium ${reply.is_ai_generated ? 'text-gray-900 markdown-body prose prose-slate prose-sm' : 'text-gray-900 whitespace-pre-wrap'}`}>
                  {reply.is_ai_generated ? (
                    <ReactMarkdown>{reply.isi_balasan}</ReactMarkdown>
                  ) : (
                    reply.isi_balasan
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm mt-8">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight mb-4">Tambahkan Balasan</h3>
        <form onSubmit={handleReply}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis balasan... (Ketik @AgriAI untuk bertanya pada AI)"
            className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm bg-white resize-none text-gray-900 font-medium transition-all placeholder:text-gray-500"
            required
            disabled={isSubmitting}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm font-bold text-gray-900 border-l-4 border-agri-green pl-3 hidden sm:block">
              Tip: Panggil <span className="font-semibold text-gray-900 bg-amber-50 border border-gray-200 rounded-xl px-1.5 py-0.5 ml-1">@AgriAI</span> untuk pendapat AI.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="inline-flex items-center justify-center border border-gray-200 rounded-xl bg-agri-green-light px-6 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:-translate-y-1 hover:shadow-md hover:shadow-sm active:scale-95 active:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto w-full sm:w-auto"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" strokeWidth={2.5}/>}
              Kirim Balasan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
