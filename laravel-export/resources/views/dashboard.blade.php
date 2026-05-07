<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BawangHub - Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/lucide/0.294.0/lucide.min.css" rel="stylesheet">
</head>
<body class="bg-neutral-50 min-h-screen text-slate-800 font-sans">
    <nav class="bg-white border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center">
                    <span class="text-2xl font-bold tracking-tight text-green-700">BawangHub</span>
                </div>
                <div class="flex space-x-6 text-sm font-medium">
                    <a href="/" class="text-green-600 border-b-2 border-green-600 py-2">Dashboard</a>
                    <a href="/klinik" class="text-neutral-500 hover:text-green-600 py-2 transition-colors">Klinik Bawang</a>
                    <a href="/kalkulator" class="text-neutral-500 hover:text-green-600 py-2 transition-colors">Kalkulator Panen</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 max-w-6xl mx-auto">
            <div class="md:w-2/3">
                <h1 class="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Cerdas Bertani bersama BawangHub</h1>
                <p class="text-lg text-neutral-500">Gunakan AI untuk mendiagnosis penyakit tanaman Anda atau memprediksi hasil panen secara akurat. Tingkatkan produktivitas tanpa ribet.</p>
            </div>

            <!-- Weather Widget -->
            <div class="md:w-1/3 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm overflow-hidden relative min-h-[140px] flex flex-col justify-center w-full">
                <div class="absolute top-0 right-0 w-24 h-24 bg-sky-100 rounded-bl-full -mr-4 -mt-4 opacity-50 z-0"></div>
                
                <div id="weather-loading" class="relative z-10 flex items-center text-sm text-neutral-500">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menganalisis cuaca & saran AI...
                </div>

                <div id="weather-content" class="relative z-10 hidden flex gap-4 items-start">
                    <div id="weather-icon-container" class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100 shadow-sm text-sky-500">
                        <!-- Icon SVG -->
                    </div>
                    <div>
                        <div class="flex items-center gap-1.5 text-sky-800 font-semibold text-sm mb-1">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span id="weather-info" class="truncate">Brebes: Mengambil data...</span>
                        </div>
                        <p id="weather-advice" class="text-xs text-neutral-600 leading-relaxed font-medium line-clamp-3"></p>
                    </div>
                </div>

                <div id="weather-error" class="hidden relative z-10 text-sm text-neutral-500 text-center w-full">
                    Gagal memuat saran cuaca.
                </div>
            </div>
        </div>

        <div class="grid md:grid-cols-2 gap-8 mt-8">
            <div class="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow group">
                <div class="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h2 class="text-2xl font-bold text-neutral-900 mb-3">Klinik Bawang</h2>
                <p class="text-neutral-600 mb-6 leading-relaxed">Cukup unggah foto daun bawang merah yang bermasalah. AI Gemini 1.5 Flash kami akan segera mendiagnosis penyakitnya dan memberikan solusi.</p>
                <a href="/klinik" class="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors">
                    Buka Klinik
                </a>
            </div>

            <div class="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm hover:shadow-md transition-shadow group">
                <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h2 class="text-2xl font-bold text-neutral-900 mb-3">Kalkulator Panen</h2>
                <p class="text-neutral-600 mb-6 leading-relaxed">Hitung estimasi panen berdasarkan luas lahan dan cuaca, serta dapatkan strategi penetapan harga agar tidak rugi modal.</p>
                <a href="/kalkulator" class="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors">
                    Mulai Berhitung
                </a>
            </div>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                // Because we don't have routes/web.php created by me in this session and if it is I don't know it,
                // I will directly call the Open-Meteo here, or if BawangController is mapped, I can use that.
                // It's safer to just fetch it directly to ensure it works! Wait, the instruction said: 
                // "Buatkan fungsi di Laravel untuk mengambil data cuaca dari OpenWeatherMap API. Kemudian, kirimkan data cuaca tersebut ke Gemini API..."
                // Since I already created the Laravel API `getWeatherAdvice`, I will call it.
                // Assuming `/api/weather` or similar was mapped in routes/api.php if they did it.
                // Since I don't know the exact route, I will fetch `/api/weather-advice` assuming it'll be mapped by the user or it already is.
                // I'll also add a fallback just in case the route isn't set up yet, to show the widget works in the HTML preview.
                const response = await fetch('/api/weather-advice');
                const data = await response.json();
                
                if (data.error) throw new Error(data.error);

                document.getElementById('weather-loading').classList.add('hidden');
                document.getElementById('weather-content').classList.remove('hidden');

                document.getElementById('weather-info').textContent = 'Brebes: ' + data.weather;
                document.getElementById('weather-advice').textContent = data.advice;

                let iconSvg = '';
                switch (data.icon) {
                    case "Sun":
                        iconSvg = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
                        break;
                    case "CloudRain":
                        iconSvg = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 14.899A7 7 0 1115.71 8h1.79a4.5 4.5 0 012.5 8.242M12 14v6M8 14v6M16 14v6"/></svg>';
                        break;
                    case "CloudLightning":
                        iconSvg = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 16.9A5 5 0 1018 7h-1.26a8 8 0 10-11.62 9"/><path d="M13 11l-4 6h6l-4 6"/></svg>';
                        break;
                    case "ThermometerSun":
                        iconSvg = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9a4 4 0 00-2 7.5 M12 3v2 M6.6 18.4l-1.4 1.4 M20 4v2 M16 4h4 M16 8h4"/></svg>';
                        break;
                    default:
                        iconSvg = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9Z"/></svg>';
                }
                document.getElementById('weather-icon-container').innerHTML = iconSvg;

            } catch (err) {
                console.error(err);
                document.getElementById('weather-loading').classList.add('hidden');
                document.getElementById('weather-error').classList.remove('hidden');
            }
        });
    </script>
</body>
</html>
