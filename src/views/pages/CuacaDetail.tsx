import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudLightning, ThermometerSun, Loader2, ArrowLeft, Droplets, Wind, Eye, MapPin, Map as MapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getDetailedWeatherAdvice } from "../../models/services/gemini";
import Markdown from "react-markdown";

export default function CuacaDetail() {
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Brebes, Jawa Tengah");
  const [coords, setCoords] = useState({ lat: -6.8694, lon: 109.0533 });

  useEffect(() => {
    async function loadWeatherDetail(lat: number, lon: number, locName: string) {
      try {
        let infoText = "";
        try {
          let data;
          try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FJakarta`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            data = await res.json();
          } catch (e) {
            console.warn("Direct fetch failed, trying proxy...", e);
            const proxyUrl = "https://api.allorigins.win/raw?url=";
            const targetUrl = encodeURIComponent(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FJakarta`);
            const res = await fetch(proxyUrl + targetUrl);
            if (!res.ok) throw new Error(`HTTP error from proxy! status: ${res.status}`);
            data = await res.json();
          }
          
          const current = data.current_weather;
          const temp = current.temperature;
          const code = current.weathercode;
          const windSpeed = current.windspeed;
          
          // Find current humidity from hourly data
          const currentHour = new Date().getHours();
          const humidity = data.hourly.relative_humidity_2m[currentHour] || 0;
          
          let condition = "Cerah";
          if (code > 0 && code <= 3) condition = "Berawan";
          if (code >= 45 && code <= 48) condition = "Berkabut";
          if (code >= 51 && code <= 67) condition = "Hujan";
          if (code >= 95) condition = "Badai Petir";

          infoText = `${condition}, Suhu ${temp}°C, Angin ${windSpeed} km/h, Kelembapan ${humidity}%`;
          setWeatherInfo({
              condition, temp, windSpeed, humidity
          });
          setLocationName(locName);
          setCoords({ lat, lon });
        } catch (weatherErr) {
          console.error("Gagal mendapatkan cuaca (Open-Meteo):", weatherErr);
          infoText = "Data cuaca tidak tersedia";
          setWeatherInfo({
              condition: "-", temp: 0, windSpeed: 0, humidity: 0
          });
        }

        try {
          const aiAdvice = await getDetailedWeatherAdvice(infoText);
          setAdvice(aiAdvice);
        } catch (aiErr: any) {
          console.error("Gagal mendapatkan saran AI:", aiErr);
          setAdvice(`Gagal memuat analisis cuaca Agri AI: \n\n${aiErr instanceof Error ? aiErr.message : "Error jaringan"}`);
        }
      } catch (err) {
        console.error("Gagal mendapatkan cuaca detail:", err);
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
             const province = geoData.principalSubdivision || "";
             const fullName = province ? `${city}, ${province}` : city;
             loadWeatherDetail(lat, lon, fullName);
          } catch(e) {
             loadWeatherDetail(lat, lon, "Lokasi Anda");
          }
        },
        (error) => {
          console.warn("Geolocation denied or error, fallback to Brebes");
          loadWeatherDetail(-6.8694, 109.0533, "Brebes, Jawa Tengah");
        },
        { timeout: 10000 }
      );
    } else {
      loadWeatherDetail(-6.8694, 109.0533, "Brebes, Jawa Tengah");
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-900 hover:bg-gray-50 px-3 py-2 border border-transparent rounded-xl hover:border-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={2.5} /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="p-8 md:p-10 text-gray-900 relative border-b border-gray-100 overflow-hidden">
            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 text-gray-900 mb-6 font-semibold text-sm bg-white border border-gray-200 rounded-xl w-fit px-4 py-2 shadow-sm">
                    <MapPin className="w-4 h-4" strokeWidth={2.5} /> {locationName}
                </div>
                
                {weatherInfo ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight leading-tight">{weatherInfo.condition}</h1>
                            <div className="text-6xl md:text-7xl font-bold tracking-tighter text-gray-900 drop-shadow-sm">
                                {weatherInfo.temp}<span className="text-3xl md:text-4xl text-gray-600 align-top ml-1">°C</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-8 bg-white/60 border border-gray-100 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                            <div className="flex flex-col gap-2 text-gray-900">
                                <div className="flex items-center gap-2 font-semibold text-sm text-gray-600"><Wind className="w-5 h-5"/> Angin</div>
                                <div className="font-bold text-3xl">{weatherInfo.windSpeed} <span className="text-base text-gray-600">km/h</span></div>
                            </div>
                            <div className="w-px bg-gray-200 hidden md:block"></div>
                            <div className="flex flex-col gap-2 text-gray-900">
                                <div className="flex items-center gap-2 font-semibold text-sm text-gray-600"><Droplets className="w-5 h-5"/> Kelembapan</div>
                                <div className="font-bold text-3xl">{weatherInfo.humidity}%</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-32 flex items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-900" strokeWidth={3} />
                    </div>
                )}
            </div>
            
            <Cloud className="absolute -bottom-10 -right-10 w-64 h-64 text-gray-900 opacity-10" />
            <Sun className="absolute top-10 right-20 w-32 h-32 text-amber-500 border-gray-200 opacity-80" />
        </div>

        <div className="p-8 bg-white border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2 tracking-tight border-b border-gray-100 inline-block pb-1">
                <MapIcon className="w-6 h-6 text-gray-900" strokeWidth={2.5}/> Peta Cuaca Langsung
            </h2>
            <div className="w-full h-[450px] border border-gray-100 rounded-2xl shadow-sm bg-gray-100 overflow-hidden relative">
               <iframe 
                width="100%" 
                height="100%" 
                src={`https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lon}&detailLat=${coords.lat}&detailLon=${coords.lon}&width=650&height=450&zoom=10&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=true&calendar=now&city=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                frameBorder="0"
                title="Google Maps Interaktif"
                loading="lazy"
               ></iframe>
            </div>
            <p className="text-sm font-medium text-gray-500 mt-3 flex items-center justify-between">
                <span>Tekan pada peta untuk melihat detail spesifik per wilayah. Zoom in/out untuk area sekitarnya.</span>
                <span className="font-bold border-b-2 border-gray-200">Sumber: Windy.com</span>
            </p>
        </div>

        <div className="p-8 bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2 tracking-tight border-b border-gray-100 inline-block pb-1">
                <Eye className="w-6 h-6 text-gray-900" strokeWidth={2.5}/> Analisis & Rekomendasi AI
            </h2>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-900 gap-4 border border-dashed border-gray-200 rounded-3xl bg-white">
                    <Loader2 className="w-10 h-10 animate-spin text-gray-900" strokeWidth={3} />
                    <p className="font-semibold text-center max-w-sm">AI sedang menganalisis saran terbaik untuk tanaman Anda...</p>
                </div>
            ) : advice ? (
                <div className="prose prose-p:font-medium prose-p:text-gray-900 prose-headings:font-semibold prose-headings:prose-strong:font-semibold max-w-none text-gray-900 leading-relaxed">
                  <div className="markdown-body">
                    <Markdown>{advice}</Markdown>
                  </div>
                </div>
            ) : (
                <div className="p-4 bg-purple-50 border border-gray-100 rounded-2xl shadow-sm text-gray-900 font-semibold">
                    Gagal memuat analisis dari AI.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
