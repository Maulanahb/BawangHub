import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { Thread, Reply } from "../types/forum";
import { getBawangBotReply } from "../services/gemini";
import { ArrowLeft, Send, Loader2, Bot, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ForumDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
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

      // 2. Check for @BawangBot
      if (messageToPost.includes("@BawangBot")) {
        const previousRepliesStr = replies.map(r => `[${r.userName}]: ${r.isi_balasan}`).join("\n");
        const threadDetailsStr = `Judul: ${thread.judul}\nIsi: ${thread.isi_pesan}`;
        
        try {
          const aiResponseText = await getBawangBotReply(threadDetailsStr, previousRepliesStr, messageToPost);
          
          await addDoc(collection(db, "threads", id, "replies"), {
            threadId: id,
            userId: "bawang-bot",
            userName: "BawangBot",
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
      <Link to="/forum" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Diskusi
      </Link>

      {/* Main Thread Post */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {thread.judul}
          </h1>
          <div className="flex items-center gap-3 mt-4 text-sm text-slate-500 border-b border-slate-100 pb-6">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
              {thread.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-slate-700">{thread.userName}</span>
              <span className="mx-2">•</span>
              <span>{thread.createdAt?.toDate ? thread.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
          </div>
          <div className="mt-6 text-slate-800 leading-relaxed whitespace-pre-wrap">
            {thread.isi_pesan}
          </div>
        </div>
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <div 
            key={reply.id} 
            className={`p-6 rounded-2xl border ${reply.is_ai_generated ? 'bg-green-50/70 border-green-200 ml-4 sm:ml-8' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${reply.is_ai_generated ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {reply.is_ai_generated ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-semibold text-sm ${reply.is_ai_generated ? 'text-green-800' : 'text-slate-800'}`}>
                    {reply.userName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {reply.createdAt?.toDate ? reply.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {reply.is_ai_generated && (
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      AI Assist
                    </span>
                  )}
                </div>
                {/* if it's AI, use markdown */}
                <div className={`text-sm sm:text-base leading-relaxed ${reply.is_ai_generated ? 'text-green-950 markdown-body prose prose-slate prose-sm' : 'text-slate-700 whitespace-pre-wrap'}`}>
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
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tambahkan Balasan</h3>
        <form onSubmit={handleReply}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis balasan... (Ketik @BawangBot untuk bertanya pada AI)"
            className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white resize-none text-slate-900"
            required
            disabled={isSubmitting}
          />
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500 hidden sm:block">
              Tip: Panggil <span className="font-semibold text-green-600 bg-green-50 px-1 py-0.5 rounded">@BawangBot</span> dalam pesan Anda untuk pendapat AI.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Kirim Balasan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
