import { useState } from "react";
import { Loader2, Calendar, Droplet, Bug, Scissors, Leaf, CheckCircle2, AlertCircle } from "lucide-react";
import { generateTimeline, type TimelineResult } from "../../models/services/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "pemupukan":
      return <Leaf className="w-5 h-5 text-black" strokeWidth={2.5}/>;
    case "penyemprotan":
      return <Bug className="w-5 h-5 text-black" strokeWidth={2.5}/>;
    case "pengairan":
      return <Droplet className="w-5 h-5 text-black" strokeWidth={2.5}/>;
    case "panen":
      return <Scissors className="w-5 h-5 text-black" strokeWidth={2.5}/>;
    default:
      return <CheckCircle2 className="w-5 h-5 text-black" strokeWidth={2.5}/>;
  }
};

const CategoryColor = (category: string) => {
  switch (category) {
    case "pemupukan":
      return "bg-neo-green text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
    case "penyemprotan":
      return "bg-neo-pink text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
    case "pengairan":
      return "bg-neo-blue text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
    case "panen":
      return "bg-neo-yellow text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
    default:
      return "bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Jadwal Tanam</h1>
        <p className="text-black font-medium mt-2 text-lg border-l-4 border-black pl-4">
          Atur tanggal tanam dan AI akan membuatkan timeline perawatan harian untuk panen optimal.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="md:col-span-1 border-r-4 border-transparent md:border-black pr-0 md:pr-8">
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full">
            <div className="p-5 border-b-4 border-black bg-neo-yellow">
              <h2 className="text-xl font-black text-black uppercase tracking-tight text-center">Mulai Penanaman</h2>
            </div>
            <div className="p-6 bg-neo-primary flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-black uppercase">Pilih Tanggal Tanam</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium text-black bg-white"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neo-accent border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-black font-black uppercase tracking-tight py-4 text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" strokeWidth={3} /> Merumuskan Jadwal...</>
                  ) : "Buat Jadwal"}
                </button>

                {error && (
                  <div className="border-4 border-black bg-neo-pink p-4 flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-black mt-0.5" strokeWidth={3} />
                    <p className="text-black font-bold uppercase">{error}</p>
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
              <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="p-6 flex gap-4 items-start bg-neo-green">
                  <div className="w-12 h-12 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-black flex-shrink-0">
                    <Calendar className="w-6 h-6" strokeWidth={2.5}/>
                  </div>
                  <div>
                    <h3 className="font-black text-black uppercase text-lg mb-1 border-b-2 border-black inline-block pb-0.5">Rangkuman Siklus Tanam</h3>
                    <p className="text-black font-medium leading-relaxed mt-2">{result.summary}</p>
                  </div>
                </div>
              </div>

              <div className="bg-neo-primary border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative pt-10">
                <div className="absolute top-0 bottom-0 left-[39px] md:left-[51px] w-1 bg-black" />
                
                <div className="space-y-8 relative z-10">
                  {result.schedule.map((event, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 items-start group">
                      <div className="w-14 items-end flex flex-col pt-1 flex-shrink-0">
                        <span className="text-xs font-black text-black uppercase tracking-widest bg-neo-yellow border-2 border-black px-1.5 py-0.5 mb-1 z-10 w-full text-center">Hari</span>
                        <span className="text-2xl font-black text-black bg-white border-2 border-black px-3 py-1 w-full text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-neo-accent transition-colors z-10">{event.day}</span>
                      </div>
                      
                      <div className="w-10 h-10 border-4 border-black bg-white flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-transform mt-3">
                        <CategoryIcon category={event.category} />
                      </div>
                      
                      <div className="flex-1 bg-white p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-[2px] group-hover:-translate-x-[2px] transition-all text-left">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 gap-2">
                           <h4 className="font-black text-black text-lg uppercase">{event.activity}</h4>
                           <div className="flex gap-2 items-center flex-wrap">
                             <span className={cn("text-[10px] uppercase tracking-wider font-black px-2 py-0.5 border-2 border-black", CategoryColor(event.category))}>
                               {event.category.replace('_', ' ')}
                             </span>
                             <span className="text-xs text-black font-bold bg-white px-2 py-0.5 border-2 border-black whitespace-nowrap">
                               {event.date}
                             </span>
                           </div>
                        </div>
                        <p className="text-black font-medium leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-4 border-black border-dashed rounded-none flex flex-col items-center justify-center text-black bg-neo-primary p-8 text-center min-h-[400px]">
              <div className="w-20 h-20 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                 <Calendar className="w-10 h-10 text-black" strokeWidth={2.5}/>
              </div>
              <p className="font-bold text-lg max-w-sm uppercase text-center leading-relaxed">Pilih tanggal tanam di sebelah kiri untuk melihat rincian siklus harian dari tanam hingga panen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
