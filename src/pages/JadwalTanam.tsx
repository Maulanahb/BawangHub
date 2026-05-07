import { useState } from "react";
import { Loader2, Calendar, Droplet, Bug, Scissors, Leaf, CheckCircle2, AlertCircle } from "lucide-react";
import { generateTimeline, type TimelineResult } from "../services/gemini";
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
      return <Leaf className="w-5 h-5 text-emerald-600" />;
    case "penyemprotan":
      return <Bug className="w-5 h-5 text-red-500" />;
    case "pengairan":
      return <Droplet className="w-5 h-5 text-blue-500" />;
    case "panen":
      return <Scissors className="w-5 h-5 text-amber-600" />;
    default:
      return <CheckCircle2 className="w-5 h-5 text-neutral-500" />;
  }
};

const CategoryColor = (category: string) => {
  switch (category) {
    case "pemupukan":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "penyemprotan":
      return "bg-red-100 text-red-800 border-red-200";
    case "pengairan":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "panen":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-neutral-100 text-neutral-800 border-neutral-200";
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Jadwal Tanam</h1>
        <p className="text-neutral-500 mt-2 text-lg">
          Atur tanggal tanam dan AI akan membuatkan timeline perawatan harian untuk panen optimal.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="md:col-span-1 border-r border-neutral-200 pr-0 md:pr-8">
          <Card className="shadow-none border-neutral-200 bg-white">
            <CardHeader className="p-5 border-b border-neutral-100">
              <CardTitle className="text-lg">Mulai Penanaman</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-700">Pilih Tanggal Tanam</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Merumuskan Jadwal...</>
                  ) : "Buat Jadwal"}
                </Button>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-2 mt-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Column */}
        <div className="md:col-span-2">
          {result ? (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm ring-1 ring-neutral-200 bg-green-50 overflow-hidden">
                <div className="p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex-shrink-0 flex items-center justify-center flex-col text-green-700">
                    <Calendar className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">Rangkuman Siklus Tanam</h3>
                    <p className="text-sm text-green-800 leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </Card>

              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative pt-10">
                <div className="absolute top-0 bottom-0 left-[39px] md:left-[51px] w-0.5 bg-neutral-200" />
                
                <div className="space-y-8 relative z-10">
                  {result.schedule.map((event, i) => (
                    <div key={i} className="flex gap-4 md:gap-6 items-start group">
                      <div className="w-14 items-end flex flex-col pt-1 flex-shrink-0">
                        <span className="text-xs font-bold text-neutral-400">Hari</span>
                        <span className="text-xl font-black text-neutral-800">{event.day}</span>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full border-4 border-white bg-neutral-100 flex items-center justify-center flex-shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
                        <CategoryIcon category={event.category} />
                      </div>
                      
                      <div className="flex-1 bg-neutral-50 rounded-xl p-4 border border-neutral-100 group-hover:border-neutral-200 group-hover:shadow-sm transition-all text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                           <h4 className="font-semibold text-neutral-900">{event.activity}</h4>
                           <div className="flex gap-2 items-center">
                             <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border", CategoryColor(event.category))}>
                               {event.category.replace('_', ' ')}
                             </span>
                             <span className="text-xs text-neutral-500 font-mono bg-white px-2 py-0.5 rounded border border-neutral-200">
                               {event.date}
                             </span>
                           </div>
                        </div>
                        <p className="text-sm text-neutral-600 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 bg-neutral-50/50 p-8 text-center text-sm min-h-[400px]">
              <Calendar className="w-12 h-12 mb-4 text-neutral-300" />
              <p>Pilih tanggal tanam di sebelah kiri untuk melihat rincian siklus harian dari tanam hingga panen.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
