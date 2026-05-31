import { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, collectionGroup } from "firebase/firestore";
import { db } from "../../models/lib/firebase";
import { Users, MessageSquare, Bot, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    threads: 0,
    aiReplies: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total Users
        const usersSnap = await getCountFromServer(collection(db, "users"));
        const usersCount = usersSnap.data().count;

        // Total Threads
        const threadsSnap = await getCountFromServer(collection(db, "threads"));
        const threadsCount = threadsSnap.data().count;

        // Total AI Replies (Might fail if index is missing in Firestore, we catch it)
        let aiRepliesCount = 0;
        try {
          const aiRepliesQuery = query(collectionGroup(db, "replies"), where("is_ai_generated", "==", true));
          const aiRepliesSnap = await getCountFromServer(aiRepliesQuery);
          aiRepliesCount = aiRepliesSnap.data().count;
        } catch (e) {
          console.warn("Index for collectionGroup might be missing", e);
        }

        setStats({
          users: usersCount,
          threads: threadsCount,
          aiReplies: aiRepliesCount
        });
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-slate-800 tracking-tight mb-2">
          Admin Panel
        </h1>
        <p className="border-l-4 border-slate-800 pl-4 text-slate-700 font-bold max-w-2xl">
          Monitoring dan moderasi platform BawangHub.
        </p>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <p className="font-bold animate-pulse text-slate-600">Memuat Metrik...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 text-white p-6 border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
             <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-700 opacity-50 group-hover:scale-110 transition-transform" />
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-slate-300">Total Petani</h3>
               <p className="text-5xl font-semibold mt-2">{stats.users}</p>
             </div>
          </div>

          <div className="bg-slate-800 text-white p-6 border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
             <MessageSquare className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-700 opacity-50 group-hover:scale-110 transition-transform" />
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-slate-300">Total Diskusi</h3>
               <p className="text-5xl font-semibold mt-2">{stats.threads}</p>
             </div>
          </div>

          <div className="bg-slate-800 text-white p-6 border border-gray-100 rounded-2xl shadow-sm relative overflow-hidden group">
             <Bot className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-700 opacity-50 group-hover:scale-110 transition-transform" />
             <div className="relative z-10">
               <h3 className="text-lg font-bold text-slate-300">Total Balasan AI</h3>
               <p className="text-5xl font-semibold mt-2">{stats.aiReplies}</p>
             </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
         <AlertTriangle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
         <div>
           <h3 className="font-semibold text-xl text-gray-900">Mode Admin Aktif</h3>
           <p className="font-medium text-slate-700 mt-2">
             Saat ini Anda memiliki akses administrator. Anda dapat menghapus diskusi pada halaman Forum Tani. Gunakan fitur ini dengan bijak.
           </p>
         </div>
      </div>
    </div>
  );
}
