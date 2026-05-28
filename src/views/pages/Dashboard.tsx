import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LeafyGreen, Calculator, CalendarDays, BookOpen, Sun, Cloud, CloudRain, CloudLightning, ThermometerSun, Loader2, MapPin, BarChart3, MessageSquare, Bot, Image as ImageIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getWeatherAdvice, type WeatherAdvice } from "../../models/services/gemini";
import { motion } from "motion/react";
import { JavaneseFarmerSVG, BawangMerahSVG } from "../components/Illustrations";

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
  const [locationName, setLocationName] = useState("Brebes");

  useEffect(() => {
    async function loadWeather(lat: number, lon: number, locName: string) {
      try {
        let infoText = "";
        try {
          let data;
          try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            data = await res.json();
          } catch (e) {
            console.warn("Direct fetch failed, trying proxy...", e);
            const proxyUrl = "https://api.allorigins.win/raw?url=";
            const targetUrl = encodeURIComponent(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const res = await fetch(proxyUrl + targetUrl);
            if (!res.ok) throw new Error(`HTTP error from proxy! status: ${res.status}`);
            data = await res.json();
          }
          
          const temp = data.current_weather.temperature;
          const code = data.current_weather.weathercode;
          
          let condition = "Cerah";
          if (code > 0 && code <= 3) condition = "Berawan";
          if (code >= 45 && code <= 48) condition = "Berkabut";
          if (code >= 51 && code <= 67) condition = "Hujan";
          if (code >= 95) condition = "Badai Petir";

          infoText = `${condition}, Suhu ${temp}°C`;
          setWeatherInfo(infoText);
          setLocationName(locName);
        } catch (weatherErr) {
          console.error("Gagal mendapatkan cuaca (Open-Meteo):", weatherErr);
          infoText = "Data cuaca tidak tersedia saat ini";
          setWeatherInfo(infoText);
        }

        try {
          const aiAdvice = await getWeatherAdvice(infoText);
          setAdvice(aiAdvice);
        } catch (aiErr: any) {
          console.error("Gagal mendapatkan saran AI:", aiErr);
          
          setAdvice({
            icon: "ThermometerSun",
            title: "Saran AI Tidak Tersedia",
            advice: aiErr instanceof Error ? aiErr.message : "Gagal memuat saran dari Agri AI. Pastikan koneksi internet stabil."
          });
        }
      } catch (err) {
        console.error("Gagal memuat cuaca & saran:", err);
      } finally {
        setLoading(false);
      }
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
             const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
             const geoData = await geoRes.json();
             const city = geoData.city || geoData.locality || "Lokasi Anda";
             loadWeather(lat, lon, city);
          } catch(e) {
             loadWeather(lat, lon, "Lokasi Anda");
          }
        },
        (error) => {
          console.warn("Geolocation denied or error, fallback to Brebes");
          loadWeather(-6.8694, 109.0533, "Brebes");
        },
        { timeout: 10000 }
      );
    } else {
      loadWeather(-6.8694, 109.0533, "Brebes");
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Intro Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 flex flex-col justify-center relative shadow-sm overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Halo, <span className="text-agri-green">Petani Bawang!</span>
            </h1>
            <p className="mt-4 text-gray-600 text-lg max-w-xl">
              Selamat datang di Dashboard BawangHub. Platform AI terpadu untuk mendukung aktivitas harian, pantau cuaca, periksa penyakit, dan kalkulasi panen dengan mudah.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 mt-auto">
              <Link to="/tanya-ai" className="bg-agri-green text-white font-semibold px-6 py-3 rounded-xl hover:bg-agri-green-dark transition-all inline-flex items-center shadow-sm">
                Mulai Tanya AI <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/jadwal" className="bg-white text-gray-700 border border-gray-200 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-all inline-flex items-center shadow-sm">
                Cek Jadwal
              </Link>
            </div>
          </div>
          {/* Decorative Vector */}
          <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
             <LeafyGreen className="w-72 h-72 text-gray-900" />
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col shadow-sm relative">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-agri-green mb-3" />
              <p className="text-sm font-medium">Memuat Cuaca...</p>
            </div>
          ) : advice ? (
            <div className="flex flex-col h-full z-10 relative">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-semibold text-gray-900">Info Cuaca</h3>
                 <span className="flex items-center text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-agri-green" /> {locationName}
                 </span>
              </div>
              
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-agri-green-light text-agri-green-dark rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                  <WeatherIcon iconName={advice.icon} className="w-8 h-8" />
                </div>
                <div>
                   <div className="text-3xl font-bold tracking-tight text-gray-900">{weatherInfo.split(', ')[1] || '-'}</div>
                   <div className="text-sm font-medium text-gray-500 mt-0.5">{weatherInfo.split(', ')[0] || '-'}</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mt-auto">
                 <h4 className="text-sm font-bold text-gray-900 mb-1.5">{advice.title}</h4>
                 <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-3">
                   {advice.advice}
                 </p>
                 <Link to="/cuaca" className="inline-flex mt-4 text-xs font-bold text-agri-green hover:text-agri-green-dark items-center uppercase tracking-wide">
                    Selengkapnya <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                 </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-400 font-medium">
              <CloudRain className="w-10 h-10 mb-3 text-gray-300" />
              Data tidak tersedia.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Eksplorasi Fitur</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-agri-green-light text-agri-green rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <LeafyGreen className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Klinik</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Scan daun sakit dengan kamera.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/klinik"
              className="w-full flex justify-center items-center text-sm font-semibold text-agri-green bg-agri-green-light hover:bg-agri-green hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Scan Foto <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <Calculator className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Kalkulator</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Hitung panen & harga.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/kalkulator"
              className="w-full flex justify-center items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Mulai Hitung <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <CalendarDays className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Jadwal</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Kapan pupuk & semprot?
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/jadwal"
              className="w-full flex justify-center items-center text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Buat Jadwal <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <BookOpen className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Buku Tani</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Catat jual beli harian.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/bukutani"
              className="w-full flex justify-center items-center text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Buka Buku <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
        
        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <ImageIcon className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Galeri</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Dokumentasi & referensi bawang.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/galeri"
              className="w-full flex justify-center items-center text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Lihat Galeri <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <BarChart3 className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Statistik</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Pantau tren & harga pasar.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/statistik"
              className="w-full flex justify-center items-center text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Cek Statistik <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <MessageSquare className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Forum</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Diskusi sesama petani.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/forum"
              className="w-full flex justify-center items-center text-sm font-semibold text-sky-600 bg-sky-50 hover:bg-sky-600 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Gabung Forum <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-full rounded-2xl overflow-hidden">
          <CardHeader className="p-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
              <Bot className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Tanya AI</CardTitle>
            <CardDescription className="text-gray-500 font-medium mt-1">
              Konsultasi dengan asisten AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <Link
              to="/tanya-ai"
              className="w-full flex justify-center items-center text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl px-4 py-3 transition-colors"
            >
              Chat Agri AI <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
