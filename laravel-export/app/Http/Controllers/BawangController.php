<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BawangController extends Controller
{
    private $geminiApiKey;
    private $geminiUrl;

    public function __construct()
    {
        $this->geminiApiKey = env('GEMINI_API_KEY');
        // Using Gemini 1.5 Flash as requested
        $this->geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $this->geminiApiKey;
    }

    // ============================================
    // VIEWS
    // ============================================

    public function dashboard()
    {
        return view('dashboard');
    }

    public function klinik()
    {
        return view('klinik');
    }

    public function kalkulator()
    {
        return view('kalkulator');
    }

    public function jadwal()
    {
        return view('jadwal');
    }

    public function bukuTani()
    {
        // Require the model
        $records = \App\Models\BukuTaniRecord::orderBy('tanggal', 'desc')->get();
        return view('buku-tani', compact('records'));
    }

    // ============================================
    // API & PROCESSING LOGIC
    // ============================================

    /**
     * Memproses analisis penyakit dari gambar daun
     */
    public function analyzeKlinik(Request $request)
    {
        $request->validate([
            'image_file' => 'required|image|max:5120', // max 5MB
        ]);

        try {
            $imagePath = $request->file('image_file')->getPathname();
            $mimeType = $request->file('image_file')->getMimeType();
            $base64Image = base64_encode(file_get_contents($imagePath));

            $prompt = <<<EOT
Anda adalah ahli patologi tanaman spesialis bawang merah (shallot).
Analisis gambar tanaman bawang merah yang diberikan.

Tentukan apakah tanaman sehat atau sakit.
Jika sakit, identifikasi penyakitnya (misalnya: Moler, Bercak Ungu/Trotol, Otomatis, Layu Fusarium, atau Thrips).
Berikan detail gejala yang terlihat dan langkah-langkah penanganan yang konkret.

Berikan output dalam format JSON murni TANPA markdown block (tanpa ```json ... ```):
{
    "isHealthy": boolean,
    "diseaseName": "Nama Penyakit atau 'Sehat'",
    "confidence": "Persentase keyakinan (contoh: 85%)",
    "details": "Deskripsi singkat gejala",
    "recommendations": ["Saran 1", "Saran 2"]
}
EOT;

            $client = new Client();
            $response = $client->post($this->geminiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['inlineData' => ['data' => $base64Image, 'mimeType' => $mimeType]],
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]
            ]);

            $resultBody = json_decode($response->getBody(), true);
            $aiText = $resultBody['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            
            // Clean up backticks in case Gemini still wraps in json markdown
            $aiText = str_replace(['```json', '```'], '', $aiText);
            
            return response()->json(json_decode(trim($aiText), true));

        } catch (\Exception $e) {
            Log::error("Gemini Error Klinik: " . $e->getMessage());
            return response()->json(['error' => 'Gagal menganalisis gambar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Memproses kalkulator panen berdasarkan input
     */
    public function predictKalkulator(Request $request)
    {
        $request->validate([
            'area' => 'required|string',
            'weather' => 'required|string',
            'capital' => 'required|string',
        ]);

        try {
            $prompt = <<<EOT
Anda adalah ahli agronomi dan ekonomi pertanian spesialis bawang merah.
Berdasarkan data berikut:
- Luas Lahan: {$request->area}
- Kondisi Cuaca: {$request->weather}
- Modal: {$request->capital}

Berikan prediksi panen (dalam satuan Ton, misal estimasi min - max), strategi penjualan terbaik agar harga tidak jatuh, serta tips teknis merawat tanaman berdasarkan cuaca.

Berikan output dalam format JSON murni TANPA markdown block (tanpa ```json ... ```):
{
    "estimatedYieldMin": number (Ton),
    "estimatedYieldMax": number (Ton),
    "marketingStrategy": ["Strategi 1", "Strategi 2"],
    "tips": ["Tip 1", "Tip 2"],
    "summary": "Ringkasan pendek prospek panen"
}
EOT;

            $client = new Client();
            $response = $client->post($this->geminiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]
            ]);

            $resultBody = json_decode($response->getBody(), true);
            $aiText = $resultBody['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            
            // Clean up trailing/leading markdown
            $aiText = str_replace(['```json', '```'], '', $aiText);

            return response()->json(json_decode(trim($aiText), true));

        } catch (\Exception $e) {
            Log::error("Gemini Error Kalkulator: " . $e->getMessage());
            return response()->json(['error' => 'Gagal memproses prediksi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Memproses jadwal tanam berdasarkan tanggal mulai
     */
    public function predictJadwal(Request $request)
    {
        $request->validate([
            'startDate' => 'required|date',
        ]);

        try {
            $prompt = <<<EOT
Anda adalah ahli agronomi spesialis budidaya bawang merah.
Pengguna mulai menanam bawang merah pada tanggal {$request->startDate}.
Buat jadwal timeline perawatan dari Hari ke-1 hingga Hari ke-60 (masa panen).
Termasuk kapan waktu yang tepat untuk pemupukan susulan, penyemprotan hama, pengurangan kadar air, dan waktu panen.

Berikan setidaknya 8-10 poin penting aktivitas berdasarkan hari (misal: Hari 10, Hari 20, dll).
Hitung tanggal aktual (date) dari hari tersebut terhadap tanggal mulai ({$request->startDate}).

Berikan output dalam format JSON murni TANPA markdown block (tanpa ```json ... ```):
{
  "summary": "Ringkasan siklus tanam yang dimulai pada tanggal ini",
  "schedule": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "activity": "Nama Aktivitas",
      "category": "pemupukan" atau "penyemprotan" atau "pengairan" atau "panen" atau "perawatan_rutin",
      "description": "Deskripsi aktivitas dan apa yang harus dilakukan"
    }
  ]
}
EOT;

            $client = new Client();
            $response = $client->post($this->geminiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]
            ]);

            $resultBody = json_decode($response->getBody(), true);
            $aiText = $resultBody['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            
            // Clean up trailing/leading markdown
            $aiText = str_replace(['```json', '```'], '', $aiText);

            return response()->json(json_decode(trim($aiText), true));

        } catch (\Exception $e) {
            Log::error("Gemini Error Jadwal: " . $e->getMessage());
            return response()->json(['error' => 'Gagal membuat jadwal: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Memproses teks bebas menjadi data buku tani terstruktur
     */
    public function analyzeBukuTani(Request $request)
    {
        $request->validate([
            'catatan' => 'required|string',
        ]);

        try {
            $prompt = <<<EOT
Ekstrak data keuangan dari cerita atau catatan petani berikut.
Catatan: "{$request->catatan}"

Output HARUS berupa JSON murni (array of objects) TANPA markdown block (tanpa ```json ... ```) dan tanpa teks pembuka/penutup.
Setiap object harus memiliki key:
- "tanggal" (format YYYY-MM-DD, tebak dari konteks atau pakai tanggal hari ini jika tidak ada info)
- "kategori" (contoh singkat: "Pupuk", "Pestisida", "Tenaga Kerja", "Penjualan Panen", dll)
- "nominal" (angka integer murni tanpa titik/koma dan tanpa Rp)
EOT;

            $client = new Client();
            $response = $client->post($this->geminiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]
            ]);

            $resultBody = json_decode($response->getBody(), true);
            $aiText = $resultBody['candidates'][0]['content']['parts'][0]['text'] ?? '[]';
            
            // Clean up trailing/leading markdown
            $aiText = str_replace(['```json', '```'], '', $aiText);

            $extractedData = json_decode(trim($aiText), true);

            if (is_array($extractedData)) {
                foreach ($extractedData as $item) {
                    \App\Models\BukuTaniRecord::create([
                        'tanggal' => $item['tanggal'] ?? date('Y-m-d'),
                        'kategori' => $item['kategori'] ?? 'Lainnya',
                        'nominal' => $item['nominal'] ?? 0,
                    ]);
                }
            }

            return redirect('/bukutani')->with('success', 'Catatan berhasil diekstrak dan disimpan ke database.');

        } catch (\Exception $e) {
            Log::error("Gemini Error Buku Tani: " . $e->getMessage());
            return redirect('/bukutani')->with('error', 'Gagal memproses catatan: ' . $e->getMessage());
        }
    }

    /**
     * Mengambil data cuaca dan saran AI
     */
    public function getWeatherAdvice()
    {
        try {
            $apiKey = env('OPENWEATHER_API_KEY');
            // Jika tidak ada API key OpenWeatherMap, fallback ke Open-Meteo (tanpa key)
            if ($apiKey) {
                // Koordinat Brebes (Sentra Bawang Merah)
                $lat = '-6.8694';
                $lon = '109.0533';
                $url = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&units=metric&lang=id";
                
                $client = new Client();
                $res = $client->get($url);
                $data = json_decode($res->getBody(), true);
                
                $temp = $data['main']['temp'];
                $condition = $data['weather'][0]['description'] ?? 'Cerah';
                $weatherInfo = "{$condition}, Suhu {$temp}°C";
            } else {
                // Fallback Open-Meteo
                $url = "https://api.open-meteo.com/v1/forecast?latitude=-6.8694&longitude=109.0533&current_weather=true";
                $client = new Client();
                $res = $client->get($url);
                $data = json_decode($res->getBody(), true);
                
                $temp = $data['current_weather']['temperature'];
                $code = $data['current_weather']['weathercode'];
                
                $condition = "Cerah";
                if ($code > 0 && $code <= 3) $condition = "Berawan";
                if ($code >= 45 && $code <= 48) $condition = "Berkabut";
                if ($code >= 51 && $code <= 67) $condition = "Hujan";
                if ($code >= 95) $condition = "Badai Petir";
                
                $weatherInfo = "{$condition}, Suhu {$temp}°C";
            }

            $prompt = <<<EOT
Cuaca di lahan pertanian saat ini: {$weatherInfo}
Berikan 1-2 kalimat saran tindakan/mitigasi agrikultur spesifik yang sangat berkaitan dengan tanaman bawang merah (misal: jika hujan awas jamur moler, jika panas terik perhatikan kadar air, dsb).

Kembalikan DENGAN FORMAT JSON MURNI TANPA markdown block (tanpa ```json ... ```):
{
  "advice": "1-2 kalimat saran...",
  "icon": "Sun" atau "Cloud" atau "CloudRain" atau "CloudLightning" atau "ThermometerSun",
  "weather": "{$weatherInfo}"
}
EOT;

            $client = new Client();
            $response = $client->post($this->geminiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ]
                ]
            ]);

            $resultBody = json_decode($response->getBody(), true);
            $aiText = $resultBody['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            
            // Clean up trailing/leading markdown
            $aiText = str_replace(['```json', '```'], '', $aiText);

            return response()->json(json_decode(trim($aiText), true));

        } catch (\Exception $e) {
            Log::error("Gemini Error Cuaca: " . $e->getMessage());
            return response()->json(['error' => 'Gagal memuat saran cuaca: ' . $e->getMessage()], 500);
        }
    }
}
