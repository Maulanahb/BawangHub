import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LeafyGreen, Calculator, CalendarDays, BookOpen, Sun, Cloud, CloudRain, CloudLightning, ThermometerSun, Loader2, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getWeatherAdvice, type WeatherAdvice } from "../services/gemini";
import { motion } from "motion/react";

const WeatherIcon = ({ iconName, className }: { iconName: string, className?: string }) => {
  switch (iconName) {
    case "Sun": return <Sun className={className} />;
    case "Cloud": return <Cloud className={className} />;
    case "CloudRain": return <CloudRain className={className} />;
    case "CloudLightning": return <CloudLightning className={className} />;
    case "ThermometerSun": return <ThermometerSun className={className} />;
    default: return <Cloud className={className} />;
  }
};

export default function Dashboard() {
  const [weatherInfo, setWeatherInfo] = useState<string>("");
  const [advice, setAdvice] = useState<WeatherAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.8694&longitude=109.0533&current_weather=true');
        const data = await res.json();
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        
        let condition = "Cerah";
        if (code > 0 && code <= 3) condition = "Berawan";
        if (code >= 45 && code <= 48) condition = "Berkabut";
        if (code >= 51 && code <= 67) condition = "Hujan";
        if (code >= 95) condition = "Badai Petir";

        const infoText = `${condition}, Suhu ${temp}°C`;
        setWeatherInfo(infoText);

        const aiAdvice = await getWeatherAdvice(infoText);
        setAdvice(aiAdvice);
      } catch (err) {
        console.error("Gagal mendapatkan cuaca:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard BawangHub</h1>
          <p className="text-gray-600 mt-2 text-lg max-w-xl">
            Platform AI untuk mendukung petani bawang merah Indonesia.
          </p>
        </div>

        {/* Widget Cuaca & Saran AI */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="relative overflow-hidden h-full rounded-2xl bg-gradient-to-br from-sky-50/80 to-transparent backdrop-blur-sm p-6 flex flex-col justify-center min-h-[120px]">
            {loading ? (
              <div className="flex items-center text-sm font-medium text-sky-700">
                <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Menganalisis cuaca Brebes...
              </div>
            ) : advice ? (
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-white/80 shadow-sm text-sky-500 flex items-center justify-center shrink-0 z-10 backdrop-blur-md">
                  <WeatherIcon iconName={advice.icon} className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800 flex items-center gap-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" /> Brebes
                    </span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="font-medium text-sky-600 text-xs">
                      {weatherInfo}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-sm text-amber-600 mb-1 leading-tight">{advice.title}</h3>
                  <p className="text-xs text-gray-700 leading-snug line-clamp-2 font-medium mb-2">
                    {advice.advice}
                  </p>
                  
                  <Link to="/cuaca" className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center transition-colors">
                    Lihat saran detail <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
                <div className="text-sm text-gray-500 font-medium">
                  Tidak dapat memuat data cuaca saat ini.
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        <Card className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <CardHeader>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 text-green-600 transition-transform duration-300 group-hover:scale-110">
              <LeafyGreen className="w-6 h-6" />
            </div>
            <CardTitle className="text-gray-900 transition-colors duration-300 group-hover:text-green-700">Klinik Bawang</CardTitle>
            <CardDescription className="line-clamp-3 text-gray-600 mt-1">
              Analisis penyakit daun bawang merah Anda lewat foto. Cukup upload foto, biarkan AI yang mendiagnosis penyakitnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/klinik"
              className="inline-flex items-center text-sm font-medium text-gray-400 group-hover:text-green-600 transition-colors duration-300"
            >
              Coba Sekarang <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 transition-transform duration-300 group-hover:scale-110">
              <Calculator className="w-6 h-6" />
            </div>
            <CardTitle className="text-gray-900 transition-colors duration-300 group-hover:text-blue-700">Kalkulator Panen</CardTitle>
            <CardDescription className="line-clamp-3 text-gray-600 mt-1">
              Hitung estimasi panen, prediksi harga jual, dan terima panduan strategi pasar cerdas berdasarkan luas lahan dan cuaca.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/kalkulator"
              className="inline-flex items-center text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors duration-300"
            >
              Mulai Hitung <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <CardHeader>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600 transition-transform duration-300 group-hover:scale-110">
              <CalendarDays className="w-6 h-6" />
            </div>
            <CardTitle className="text-gray-900 transition-colors duration-300 group-hover:text-amber-700">Jadwal Tanam</CardTitle>
            <CardDescription className="line-clamp-3 text-gray-600 mt-1">
              Masukan tanggal tanam dan AI akan merumuskan timeline harian kapan harus memupuk, menyemprot, dan panen.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/jadwal"
              className="inline-flex items-center text-sm font-medium text-gray-400 group-hover:text-amber-600 transition-colors duration-300"
            >
              Buat Jadwal <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1">
          <CardHeader>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
              <BookOpen className="w-6 h-6" />
            </div>
            <CardTitle className="text-gray-900 transition-colors duration-300 group-hover:text-indigo-700">Buku Tani Cerdas</CardTitle>
            <CardDescription className="line-clamp-3 text-gray-600 mt-1">
              Catat pengeluaran dan pemasukan dengan bahasa layaknya SMS, biarkan AI mengekstrak nilainya ke tabel database.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/bukutani"
              className="inline-flex items-center text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors duration-300"
            >
              Buka Buku <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
