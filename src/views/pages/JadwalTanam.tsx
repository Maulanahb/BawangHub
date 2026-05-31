import { useState } from "react";
import { Loader2, Calendar, Droplet, Bug, Scissors, Leaf, CheckCircle2, AlertCircle } from "lucide-react";
import { generateTimeline, type TimelineResult } from "../../models/services/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "pemupukan":
      return <Leaf className="w-5 h-5 text-gray-900" strokeWidth={2.5}/>;
    case "penyemprotan":
      return <Bug className="w-5 h-5 text-gray-900" strokeWidth={2.5}/>;
    case "pengairan":
      return <Droplet className="w-5 h-5 text-gray-900" strokeWidth={2.5}/>;
    case "panen":
      return <Scissors className="w-5 h-5 text-gray-900" strokeWidth={2.5}/>;
    default:
      return <CheckCircle2 className="w-5 h-5 text-gray-900" strokeWidth={2.5}/>;
  }
};

const CategoryColor = (category: string) => {
  switch (category) {
    case "pemupukan":
      return "bg-agri-green text-gray-900 border-gray-200 shadow-sm";
    case "penyemprotan":
      return "bg-purple-50 text-gray-900 border-gray-200 shadow-sm";
    case "pengairan":
      return "bg-blue-50 text-gray-900 border-gray-200 shadow-sm";
    case "panen":
      return "bg-amber-50 text-gray-900 border-gray-200 shadow-sm";
    default:
      return "bg-white text-gray-900 border-gray-200 shadow-sm";
  }
};

export default function JadwalTanam() {
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    setLoading(true);
    setError(null);
    try {
      const res = await generateTimeline(startDate);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Gagal menghasilkan jadwal tanam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Jadwal Tanam</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Atur tanggal tanam dan AI akan membuatkan timeline perawatan harian untuk panen optimal.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Calendar className="w-64 h-64 text-gray-900" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="md:col-span-1 border-r-4 border-transparent md:border-gray-200 pr-0 md:pr-8">
          <div className="border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 bg-amber-50">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight text-center">Mulai Penanaman</h2>
            </div>
            <div className="p-6 bg-white flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Pilih Tanggal Tanam</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 focus:shadow-sm transition-all font-medium text-gray-900 bg-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-agri-green-light border border-gray-100 rounded-2xl shadow-sm hover:shadow-sm hover:-translate-y-1 hover:shadow-md active:scale-95 active:shadow-sm text-gray-900 font-semibold tracking-tight py-4 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" strokeWidth={3} /> Merumuskan Jadwal...</>
                  ) : "Buat Jadwal"}
                </button>

                {error && (
                  <div className="border border-gray-100 rounded-2xl bg-purple-50 p-4 flex items-start gap-3 shadow-sm mt-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-gray-900 mt-0.5" strokeWidth={3} />
                    <p className="text-gray-900 font-bold">{error}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Timeline Column */}
        <div className="md:col-span-2">
          {result ? (
            <div className="space-y-6">
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="p-6 flex gap-4 items-start bg-agri-green">
                  <div className="w-12 h-12 border border-gray-200 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-900 flex-shrink-0">
                    <Calendar className="w-6 h-6" strokeWidth={2.5}/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 border-b-2 border-gray-200 inline-block pb-0.5">Rangkuman Siklus Tanam</h3>
                    <p className="text-gray-900 font-medium leading-relaxed mt-2">{result.summary}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative pt-10">
                <div className="absolute top-0 bottom-0 left-[39px] md:left-[51px] w-1 bg-black" />
                
                <div className="space-y-8 relative z-10">
                  {result.schedule.map((event, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 items-start group">
                      <div className="w-14 items-end flex flex-col pt-1 flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-900 tracking-widest bg-amber-50 border border-gray-200 rounded-xl px-1.5 py-0.5 mb-1 z-10 w-full text-center">Hari</span>
                        <span className="text-2xl font-semibold text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-1 w-full text-center shadow-sm group-hover:bg-agri-green-light transition-colors z-10">{event.day}</span>
                      </div>
                      
                      <div className="w-10 h-10 border border-gray-100 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-transform mt-3">
                        <CategoryIcon category={event.category} />
                      </div>
                      
                      <div className="flex-1 bg-white p-5 border border-gray-100 rounded-2xl shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all text-left">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-2">
                           <h4 className="font-semibold text-gray-900 text-lg">{event.activity}</h4>
                           <div className="flex gap-2 items-center flex-wrap">
                             <span className={cn("text-[10px] tracking-wider font-semibold px-2 py-0.5 border border-gray-200 rounded-xl", CategoryColor(event.category))}>
                               {event.category.replace('_', ' ')}
                             </span>
                             <span className="text-xs text-gray-900 font-bold bg-white px-2 py-0.5 border border-gray-200 rounded-xl whitespace-nowrap">
                               {event.date}
                             </span>
                           </div>
                        </div>
                        <p className="text-gray-900 font-medium leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-900 bg-white p-8 text-center min-h-[400px]">
              <div className="w-20 h-20 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
                 <Calendar className="w-10 h-10 text-gray-900" strokeWidth={2.5}/>
              </div>
              <p className="font-bold text-lg max-w-sm text-center leading-relaxed">Pilih tanggal tanam di sebelah kiri untuk melihat rincian siklus harian dari tanam hingga panen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
