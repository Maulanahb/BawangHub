import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LeafyGreen, Calculator, CalendarDays, BookOpen, Sun, Cloud, CloudRain, CloudLightning, ThermometerSun, Loader2, MapPin } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-6 relative">
        <div className="flex-1 relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase" style={{ letterSpacing: "-0.05em" }}>Dashboard BawangHub</h1>
          <p className="text-black font-medium mt-2 text-lg max-w-xl border-l-4 border-black pl-4">
            Platform AI untuk mendukung petani bawang merah Indonesia.
          </p>
          
          {/* Dashboard Vector Illustration Placeholder */}
          <div className="mt-8 hidden md:block">
            <div className="inline-flex items-end gap-2 border-b-4 border-black px-4 pb-0 relative">
               <div className="absolute w-full h-1/2 bg-neo-accent bottom-0 left-0 -z-10"></div>
               <div className="relative transform hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-24 h-24 bg-white border-4 border-black border-b-0 rounded-t-2xl flex items-center justify-center shadow-[4px_0_0_0_rgba(0,0,0,1)] relative z-20 overflow-hidden">
                    <JavaneseFarmerSVG className="w-20 h-20 mt-4" />
                 </div>
               </div>
               <div className="relative transform hover:-translate-y-1 transition-transform duration-300 delay-75">
                 <div className="w-16 h-20 bg-neo-yellow border-4 border-black border-b-0 rounded-t-2xl flex items-center justify-center shadow-[4px_0_0_0_rgba(0,0,0,1)] relative z-10 overflow-hidden">
                    <BawangMerahSVG className="w-12 h-12 mt-2" />
                 </div>
               </div>
               <div className="ml-4 pb-2 flex flex-col items-start gap-2">
                 <span className="font-black text-black">Petani & Bawang Merah!</span>
                 <Link to="/tanya-ai" className="inline-flex items-center text-xs font-bold text-white border-2 border-black bg-black px-3 py-1 hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(255,234,167,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                   Tanya Agri AI <ArrowRight className="ml-1 w-3 h-3" />
                 </Link>
               </div>
            </div>
          </div>
        </div>

        {/* Widget Cuaca & Saran AI */}
        <div className="w-full md:w-[400px] shrink-0">
          <div className="relative overflow-hidden h-full bg-neo-blue border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-center min-h-[120px]">
            {loading ? (
              <div className="flex items-center text-sm font-bold text-black border-2 border-black bg-white px-4 py-2 w-max">
                <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Menganalisis...
              </div>
            ) : advice ? (
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 border-2 border-black bg-neo-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black flex items-center justify-center shrink-0 z-10">
                  <WeatherIcon iconName={advice.icon} className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-black flex items-center gap-1 text-xs border-2 border-black bg-white px-2 py-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {locationName}
                    </span>
                    <span className="font-bold text-black text-xs border-2 border-black bg-neo-accent px-2 py-0.5">
                      {weatherInfo}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-sm text-black mb-1 uppercase leading-tight">{advice.title}</h3>
                  <p className="text-xs text-black leading-snug line-clamp-2 font-medium mb-2">
                    {advice.advice}
                  </p>
                  
                  <Link to="/cuaca" className="text-[11px] font-bold text-black hover:bg-white border-b-2 border-black hover:border-black flex items-center transition-colors w-max">
                    Lihat saran detail <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
                <div className="text-sm text-black font-bold border-2 border-black bg-white px-4 py-2 w-max text-center">
                  Tidak dapat memuat cuaca.
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        <Card className="group flex flex-col bg-neo-green border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 h-full rounded-none">
          <CardHeader>
            <div className="w-14 h-14 bg-white border-4 border-black rounded-none flex items-center justify-center mb-4 text-black transition-transform duration-300 group-hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <LeafyGreen className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-black uppercase text-black tracking-tight">Klinik Bawang</CardTitle>
            <CardDescription className="line-clamp-3 text-black font-medium mt-2">
              Analisis penyakit daun bawang merah Anda lewat foto. Cukup upload foto, biarkan AI yang mendiagnosis penyakitnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/klinik"
              className="inline-flex items-center text-sm font-black uppercase text-black border-4 border-black bg-white px-4 py-2 hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Coba Sekarang <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-neo-blue border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 h-full rounded-none">
          <CardHeader>
            <div className="w-14 h-14 bg-white border-4 border-black rounded-none flex items-center justify-center mb-4 text-black transition-transform duration-300 group-hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Calculator className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-black uppercase text-black tracking-tight">Kalkulator Panen</CardTitle>
            <CardDescription className="line-clamp-3 text-black font-medium mt-2">
              Hitung estimasi panen, prediksi harga jual, dan terima panduan strategi pasar cerdas berdasarkan luas lahan dan cuaca.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/kalkulator"
              className="inline-flex items-center text-sm font-black uppercase text-black border-4 border-black bg-white px-4 py-2 hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Mulai Hitung <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-neo-yellow border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 h-full rounded-none">
          <CardHeader>
            <div className="w-14 h-14 bg-white border-4 border-black rounded-none flex items-center justify-center mb-4 text-black transition-transform duration-300 group-hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CalendarDays className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-black uppercase text-black tracking-tight">Jadwal Tanam</CardTitle>
            <CardDescription className="line-clamp-3 text-black font-medium mt-2">
              Masukan tanggal tanam dan AI akan merumuskan timeline harian kapan harus memupuk, menyemprot, dan panen.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/jadwal"
              className="inline-flex items-center text-sm font-black uppercase text-black border-4 border-black bg-white px-4 py-2 hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Buat Jadwal <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="group flex flex-col bg-neo-pink border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 h-full rounded-none">
          <CardHeader>
            <div className="w-14 h-14 bg-white border-4 border-black rounded-none flex items-center justify-center mb-4 text-black transition-transform duration-300 group-hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <BookOpen className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-black uppercase text-black tracking-tight">Buku Tani Cerdas</CardTitle>
            <CardDescription className="line-clamp-3 text-black font-medium mt-2">
              Catat pengeluaran dan pemasukan dengan bahasa layaknya SMS, biarkan AI mengekstrak nilainya ke tabel database.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Link
              to="/bukutani"
              className="inline-flex items-center text-sm font-black uppercase text-black border-4 border-black bg-white px-4 py-2 hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              Buka Buku <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
