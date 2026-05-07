import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudLightning, ThermometerSun, Loader2, ArrowLeft, Droplets, Wind, Eye, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getDetailedWeatherAdvice } from "../services/gemini";
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
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-sky-100 mb-4 font-medium text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                    <MapPin className="w-4 h-4" /> Brebes, Jawa Tengah
                </div>
                
                {weatherInfo ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{weatherInfo.condition}</h1>
                            <div className="text-5xl font-light tracking-tighter">
                                {weatherInfo.temp}<span className="text-3xl text-sky-200 align-top">°C</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 bg-black/10 p-4 rounded-xl backdrop-blur-md">
                            <div className="flex flex-col gap-1 text-sky-100">
                                <div className="flex items-center gap-2"><Wind className="w-4 h-4" /> Angin</div>
                                <div className="font-semibold text-white text-lg">{weatherInfo.windSpeed} km/h</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div className="flex flex-col gap-1 text-sky-100">
                                <div className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Kelembapan</div>
                                <div className="font-semibold text-white text-lg">{weatherInfo.humidity}%</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-32 flex items-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                )}
            </div>
            
            <Cloud className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10" />
            <Sun className="absolute top-10 right-20 w-32 h-32 text-yellow-300/20" />
        </div>

        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" /> Analisis & Rekomendasi AI
            </h2>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                    <p>AI sedang menganalisis saran terbaik untuk tanaman Anda...</p>
                </div>
            ) : advice ? (
                <div className="prose prose-sky max-w-none text-gray-700 leading-relaxed marker:text-sky-500">
                  <div className="markdown-body">
                    <Markdown>{advice}</Markdown>
                  </div>
                </div>
            ) : (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    Gagal memuat analisis dari AI.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
