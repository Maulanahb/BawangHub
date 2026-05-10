import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, serverTimestamp, writeBatch, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../../models/lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Thread, Reply } from "../../types/forum";
import { getAgriAIReply } from "../../models/services/gemini";
import { ArrowLeft, Send, Loader2, Bot, User as UserIcon, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
        <Link to="/forum" className="inline-flex items-center text-sm font-bold text-black border-b-2 border-transparent hover:border-black transition-colors w-max">
          <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={2.5} /> Kembali ke Daftar Diskusi
        </Link>
        
        {isAdmin && (
          <button 
            onClick={handleDeleteThread}
            disabled={isSubmitting}
            className="flex items-center gap-1 font-bold text-white bg-red-600 border-2 border-black px-4 py-2 hover:bg-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Diskusi
          </button>
        )}
      </div>

      {/* Main Thread Post */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase leading-tight">
            {thread.judul}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm text-black border-b-4 border-black pb-6 font-bold">
            <div className="w-8 h-8 bg-neo-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black">
              {thread.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-black">{thread.userName}</span>
              <span className="mx-2">•</span>
              <span className="bg-neo-accent border-2 border-black px-2 py-0.5">{thread.createdAt?.toDate ? thread.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
          </div>
          <div className="mt-6 text-black font-medium leading-relaxed whitespace-pre-wrap">
            {thread.isi_pesan}
          </div>
        </div>
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <div 
            key={reply.id} 
            className={`p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${reply.is_ai_generated ? 'bg-neo-blue ml-4 sm:ml-8' : 'bg-white'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${reply.is_ai_generated ? 'bg-neo-pink text-black' : 'bg-neo-yellow text-black'}`}>
                {reply.is_ai_generated ? <Bot className="w-4 h-4" strokeWidth={2.5}/> : <UserIcon className="w-4 h-4" strokeWidth={2.5}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`font-black text-sm uppercase ${reply.is_ai_generated ? 'text-black' : 'text-black'}`}>
                    {reply.userName}
                  </span>
                  <span className="text-xs text-black font-bold border-2 border-black bg-white px-2 py-0.5">
                    {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {reply.is_ai_generated && (
                    <span className="bg-neo-accent text-black text-[10px] px-2 py-0.5 border-2 border-black font-black uppercase tracking-wider">
                      AI ASSIST
                    </span>
                  )}
                </div>
                {/* if it's AI, use markdown */}
                <div className={`text-sm sm:text-base leading-relaxed font-medium ${reply.is_ai_generated ? 'text-black markdown-body prose prose-slate prose-sm' : 'text-black whitespace-pre-wrap'}`}>
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
      <div className="bg-neo-primary p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-8">
        <h3 className="text-xl font-black text-black uppercase tracking-tight mb-4">Tambahkan Balasan</h3>
        <form onSubmit={handleReply}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis balasan... (Ketik @AgriAI untuk bertanya pada AI)"
            className="w-full h-32 px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white resize-none text-black font-medium transition-all placeholder:text-gray-500"
            required
            disabled={isSubmitting}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm font-bold text-black border-l-4 border-black pl-3 hidden sm:block">
              Tip: Panggil <span className="font-black text-black bg-neo-yellow border-2 border-black px-1.5 py-0.5 ml-1">@AgriAI</span> untuk pendapat AI.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="inline-flex items-center justify-center border-2 border-black bg-neo-accent px-6 py-2.5 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto w-full sm:w-auto"
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
