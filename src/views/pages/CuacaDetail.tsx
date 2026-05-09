import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudLightning, ThermometerSun, Loader2, ArrowLeft, Droplets, Wind, Eye, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getDetailedWeatherAdvice } from "../../models/services/gemini";
import Markdown from "react-markdown";

export default function CuacaDetail() {
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeatherDetail() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.8694&longitude=109.0533&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FJakarta');
        const data = await res.json();
        
        const current = data.current_weather;
        const temp = current.temperature;
        const code = current.weathercode;
        const windSpeed = current.windspeed;
        
        // Find current humidity from hourly data
        const currentHour = new Date().getHours();
        const humidity = data.hourly.relative_humidity_2m[currentHour];
        
        let condition = "Cerah";
        if (code > 0 && code <= 3) condition = "Berawan";
        if (code >= 45 && code <= 48) condition = "Berkabut";
        if (code >= 51 && code <= 67) condition = "Hujan";
        if (code >= 95) condition = "Badai Petir";

        const infoText = `${condition}, Suhu ${temp}°C, Angin ${windSpeed} km/h, Kelembapan ${humidity}%`;
        setWeatherInfo({
            condition, temp, windSpeed, humidity
        });

        const aiAdvice = await getDetailedWeatherAdvice(infoText);
        setAdvice(aiAdvice);
      } catch (err) {
        console.error("Gagal mendapatkan cuaca detail:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWeatherDetail();
  }, []);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm font-black uppercase text-black hover:bg-neo-yellow px-2 py-1 border-2 border-transparent hover:border-black transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" strokeWidth={3} /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-neo-blue p-8 text-black relative border-b-4 border-black overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-black mb-4 font-black text-sm bg-white border-2 border-black w-fit px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                    <MapPin className="w-4 h-4" strokeWidth={3} /> Brebes, Jawa Tengah
                </div>
                
                {weatherInfo ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tight" style={{ letterSpacing: "-0.05em" }}>{weatherInfo.condition}</h1>
                            <div className="text-6xl font-black tracking-tighter text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" style={{ WebkitTextStroke: "2px black" }}>
                                {weatherInfo.temp}<span className="text-4xl text-black align-top drop-shadow-none" style={{ WebkitTextStroke: "0" }}>°C</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 bg-neo-yellow border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex flex-col gap-1 text-black">
                                <div className="flex items-center gap-2 font-black uppercase text-xs"><Wind className="w-4 h-4" strokeWidth={3}/> Angin</div>
                                <div className="font-black text-2xl">{weatherInfo.windSpeed} <span className="text-sm">km/h</span></div>
                            </div>
                            <div className="w-1 bg-black"></div>
                            <div className="flex flex-col gap-1 text-black">
                                <div className="flex items-center gap-2 font-black uppercase text-xs"><Droplets className="w-4 h-4" strokeWidth={3}/> Kelembapan</div>
                                <div className="font-black text-2xl">{weatherInfo.humidity}%</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-32 flex items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-black" strokeWidth={3} />
                    </div>
                )}
            </div>
            
            <Cloud className="absolute -bottom-10 -right-10 w-64 h-64 text-black opacity-10" />
            <Sun className="absolute top-10 right-20 w-32 h-32 text-neo-yellow border-black opacity-80" />
        </div>

        <div className="p-8 bg-white">
            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-2 uppercase tracking-tight border-b-4 border-black inline-block pb-1">
                <Eye className="w-6 h-6 text-black" strokeWidth={2.5}/> Analisis & Rekomendasi AI
            </h2>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-black gap-4 border-4 border-black border-dashed bg-neo-primary">
                    <Loader2 className="w-10 h-10 animate-spin text-black" strokeWidth={3} />
                    <p className="font-black uppercase text-center max-w-sm">AI sedang menganalisis saran terbaik untuk tanaman Anda...</p>
                </div>
            ) : advice ? (
                <div className="prose prose-p:font-medium prose-p:text-black prose-headings:font-black prose-headings:uppercase prose-strong:font-black max-w-none text-black leading-relaxed">
                  <div className="markdown-body">
                    <Markdown>{advice}</Markdown>
                  </div>
                </div>
            ) : (
                <div className="p-4 bg-neo-pink border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black font-black uppercase">
                    Gagal memuat analisis dari AI.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
