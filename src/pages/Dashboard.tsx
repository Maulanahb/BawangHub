import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LeafyGreen, Calculator, CalendarDays, BookOpen, Sun, Cloud, CloudRain, CloudLightning, ThermometerSun, Loader2, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getWeatherAdvice, type WeatherAdvice } from "../services/gemini";

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
        // Brebes (Sentra Bawang Merah Indonesia) - Coordinates
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard BawangHub</h1>
          <p className="text-neutral-500 mt-2 text-lg">
            Platform AI untuk mendukung petani bawang merah Indonesia.
          </p>
        </div>

        {/* Widget Cuaca & Saran AI */}
        <Card className="w-full md:w-80 shadow-sm border-neutral-200 bg-white shrink-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
          <CardContent className="p-4 relative z-10 flex flex-col justify-center h-full min-h-[120px]">
            {loading ? (
              <div className="flex items-center text-sm text-neutral-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisis cuaca & saran...
              </div>
            ) : advice ? (
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100/50 shadow-sm text-sky-500 text-xl font-bold">
                  <WeatherIcon iconName={advice.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-sky-800 font-semibold text-sm mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Brebes: {weatherInfo}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {advice.advice}
                  </p>
                </div>
              </div>
            ) : (
                <div className="text-sm text-neutral-500 flex items-center justify-center h-full">
                  Tidak dapat memuat saran cuaca.
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="hover:border-green-500/50 transition-colors group">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <LeafyGreen className="text-green-600 w-6 h-6" />
            </div>
            <CardTitle>Klinik Bawang</CardTitle>
            <CardDescription className="line-clamp-3">
              Analisis penyakit daun bawang merah Anda lewat foto. Cukup upload foto, biarkan AI yang mendiagnosis penyakitnya.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/klinik"
              className="inline-flex items-center text-sm font-medium text-green-600 group-hover:text-green-700"
            >
              Coba Sekarang <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-500/50 transition-colors group">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Calculator className="text-blue-600 w-6 h-6" />
            </div>
            <CardTitle>Kalkulator Panen</CardTitle>
            <CardDescription className="line-clamp-3">
              Hitung estimasi panen, prediksi harga jual, dan terima panduan strategi pasar cerdas berdasarkan luas lahan dan cuaca.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/kalkulator"
              className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700"
            >
              Mulai Hitung <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/50 transition-colors group">
          <CardHeader>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <CalendarDays className="text-amber-600 w-6 h-6" />
            </div>
            <CardTitle>Jadwal Tanam</CardTitle>
            <CardDescription className="line-clamp-3">
              Masukan tanggal tanam dan AI akan merumuskan timeline harian kapan harus memupuk, menyemprot, dan panen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/jadwal"
              className="inline-flex items-center text-sm font-medium text-amber-600 group-hover:text-amber-700"
            >
              Buat Jadwal <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/50 transition-colors group">
          <CardHeader>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="text-indigo-600 w-6 h-6" />
            </div>
            <CardTitle>Buku Tani Cerdas</CardTitle>
            <CardDescription className="line-clamp-3">
              Catat pengeluaran dan pemasukan dengan bahasa layaknya SMS, biarkan AI mengekstrak nilainya ke tabel database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/bukutani"
              className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700"
            >
              Buka Buku <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
