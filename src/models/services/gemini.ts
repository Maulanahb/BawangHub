export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface TimelineResult {
  summary: string;
  schedule: Array<{
    day: number;
    date: string;
    activity: string;
    category: "pemupukan" | "penyemprotan" | "pengairan" | "panen" | "perawatan_rutin";
    description: string;
  }>;
}

const handleGeminiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  throw new Error(`Failed to generate AI response: ${error?.message || 'Unknown error'}`);
};

async function apiGenerate(prompt: string, isJson: boolean = false) {
  const res = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, isJson })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to call AI server");
  }
  const data = await res.json();
  if (isJson) return JSON.parse(data.text);
  return data.text;
}

async function apiChat(history: ChatMessage[], message: string, systemInstruction: string) {
  const res = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, message, systemInstruction })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to call AI server");
  }
  const data = await res.json();
  return data.text;
}

export interface AnalysisResult {
  diseaseName: string;
  confidence: "Tinggi" | "Sedang" | "Rendah";
  severity: "Kritis" | "Waspada" | "Aman";
  details: string;
  recommendations: string[];
}

async function apiGenerateWithImage(prompt: string, inlineData: any, isJson: boolean = false) {
  const res = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, inlineData, isJson })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to call AI server");
  }
  const data = await res.json();
  if (isJson) return JSON.parse(data.text);
  return data.text;
}

export async function analyzeShallotHealth(base64Data: string, mimeType: string): Promise<AnalysisResult> {
  const base64Clean = base64Data.split(",")[1] || base64Data;
  const prompt = `Anda adalah ahli patologi tanaman spesialis bawang merah.
Analisis gambar daun/tanaman bawang merah berikut.
Apakah tanaman ini terlihat sehat, ataukah ada gejala hama/penyakit (seperti ulat, bercak daun ungu, trotol/moler)?

Berikan hasil analisis dalam format JSON murni:
{
  "diseaseName": "Nama Penyakit/Hama (atau 'Sehat')",
  "confidence": "Tinggi" | "Sedang" | "Rendah",
  "severity": "Kritis" | "Waspada" | "Aman",
  "details": "Penjelasan detail mengenai hasil observasi dari gambar",
  "recommendations": [
     "Saran 1",
     "Saran 2"
  ]
}`;

  try {
    return await apiGenerateWithImage(prompt, { data: base64Clean, mimeType }, true);
  } catch (error) {
    handleGeminiError(error, "Gemini Analyze Shallot Health");
    throw error;
  }
}

export interface PredictionResult {
  estimatedYieldMin: number;
  estimatedYieldMax: number;
  summary: string;
  marketingStrategy: string[];
  tips: string[];
}

export async function predictHarvest(area: string, weather: string, capital: string): Promise<PredictionResult> {
  const prompt = `Anda adalah pakar agribisnis bawang merah.
Berdasarkan data berikut:
- Luas lahan: ${area}
- Kondisi cuaca dominan musim ini: ${weather}
- Modal tanam (Rp): ${capital}

Berikan perkiraan estimasi panen, ringkasan prospek, strategi pasar, dan tips perawatan harian.
Hasil harus didasari analisis realistis bagi petani di Indonesia. Angka tonase harus rasional (misal 1 Ha bawang merah menghasilkan 9-12 ton dalam siklus wajar).

Berikan output dalam format JSON murni:
{
  "estimatedYieldMin": (angka minimal panen dalam ton, tipe number),
  "estimatedYieldMax": (angka maksimal panen dalam ton, tipe number),
  "summary": "Ringkasan prospek panen dan tingkat risiko",
  "marketingStrategy": ["Strategi 1", "Strategi 2"],
  "tips": ["Tip 1", "Tip 2"]
}`;

  try {
    return await apiGenerate(prompt, true);
  } catch (error) {
    handleGeminiError(error, "Gemini Predict Harvest");
    throw error;
  }
}

export interface BukuTaniRecord {
  tanggal: string;
  kategori: string;
  nominal: number;
}

export async function analyzeBukuTani(text: string): Promise<BukuTaniRecord[]> {
  const prompt = `Anda adalah asisten keuangan petani cerdas.
Ekstrak semua catatan pengeluaran / pemasukan dari teks berikut dan ubah menjadi array JSON berstruktur.

Teks: "${text}"

Berikan output murni sebagai JSON array dengan format berikut (jangan bungkus dengan markdown \`\`\`json):
[
  {
    "tanggal": "YYYY-MM-DD",
    "kategori": "Modal Bibit" | "Pupuk" | "Pestisida" | "Tenaga Kerja" | "Transport" | "Panen" | "Lainnya",
    "nominal": 150000
  }
]
- Pastikan nominal berupa angka murni (number).
- Jika ada penulisan tanggal implisit (seperti 'kemarin'), sesuaikan dengan relevansinya atau gunakan tanggal standar "YYYY-MM-DD".`;

  try {
    return await apiGenerate(prompt, true);
  } catch (error) {
    handleGeminiError(error, "Gemini Analyze Buku Tani");
    throw error;
  }
}

export async function getDetailedWeatherAdvice(weatherData: string, region: string): Promise<string> {
  const prompt = `Anda adalah ahli klimatologi dan agrometeorologi.
Berikan analisis cuaca terperinci untuk wilayah ${region} berdasarkan data berikut:
${weatherData}

Fokus pada dampak langsung terhadap tanaman bawang merah, risiko penyebaran spora (jika lembab/hujan), dan tindakan pencegahan spesifik (seperti sanitasi bedengan).
Gunakan struktur markdown yang bersih dan profesional.`;

  try {
    return await apiGenerate(prompt);
  } catch (error) {
    handleGeminiError(error, "Gemini Detailed Weather Advice");
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

export async function getDiagnosaPenyakit(gejala: string, riwayat?: string): Promise<string> {
  const prompt = `Anda adalah pakar pertanian dan penyakit tanaman bawang merah (Allium cepa).
Pasien (petani) mengeluhkan gejala berikut pada tanamannya:
"${gejala}"

Riwayat tambahan (jika ada): ${riwayat || 'Tidak ada'}

Berikan:
1. Kemungkinan penyakit/hama.
2. Tingkat keparahan (Rendah/Sedang/Tinggi).
3. Rekomendasi penanganan (organik maupun kimia).`;

  try {
    return await apiGenerate(prompt);
  } catch (error) {
    handleGeminiError(error, "Gemini Diagnosa");
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

export interface WeatherAdvice {
  icon: string;
  title: string;
  advice: string;
}

export async function getWeatherAdvice(weatherData: string): Promise<WeatherAdvice> {
  const prompt = `Kamu adalah pakar cuaca pertanian khusus tanaman bawang merah. 
Baca data cuaca singkat hari ini beserta lokasinya:
${weatherData}

Berikan saran singkat dalam format JSON murni (tanpa markdown):
{
  "icon": "Sun" | "Cloud" | "CloudRain" | "CloudLightning" | "ThermometerSun",
  "title": "Judul saran singkat (maks 8 kata)",
  "advice": "Saran aksi spesifik untuk petani bawang merah hari ini (1-2 kalimat)"
}

Pilih icon yang paling sesuai dengan kondisi cuaca.`;

  try {
    return await apiGenerate(prompt, true);
  } catch (error) {
    handleGeminiError(error, "Gemini Weather Advice");
    return {
      icon: "ThermometerSun",
      title: "Saran Tidak Tersedia",
      advice: "Maaf, terjadi kesalahan saat menghubungi AI."
    };
  }
}

export async function getStatistikInsight(expensesData: string, trenHarga: string): Promise<string> {
  const prompt = `Kamu adalah analis ekonomi pertanian. Baca data pengeluaran dan tren harga bawang merah berikut. 
Buatkan ringkasan naratif (sekitar 2-3 paragraf) yang menganalisis korelasi antara tren harga pasar dan proporsi pengeluaran secara komprehensif. Sampaikan dengan bahasa yang mudah dipahami oleh petani lokal, suportif, serta berikan saran finansial yang praktis. Gunakan Markdown (seperti bold, list) untuk membuat narasi lebih menarik dibaca.

Data Pengeluaran:
${expensesData}

Tren Harga Bawang Merah:
${trenHarga}`;

  try {
    return await apiGenerate(prompt);
  } catch (error) {
    handleGeminiError(error, "Gemini Statistik Insight");
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

export async function getAgriAIReply(threadDetails: string, previousReplies: string, newMessage: string): Promise<string> {
  const prompt = `Kamu adalah pakar pertanian bernama Agri AI. Pengguna memanggilmu di Forum Tani.
Bacalah diskusi berikut ini dan berikan saran / solusi yang sangat membantu, solutif, dan berdasarkan praktik pertanian yang baik.
Gunakan bahasa yang bersahabat, profesional, dan mudah dipahami oleh petani lokal.

=== DETAIL DISKUSI ===
${threadDetails}

=== BALASAN SEBELUMNYA ===
${previousReplies}

=== PESAN TERBARU YANG MEMANGGIL @AgriAI ===
${newMessage}`;

  try {
    return await apiGenerate(prompt);
  } catch (error) {
    handleGeminiError(error, "Gemini Forum Bot");
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

export async function generateTimeline(startDate: string): Promise<TimelineResult> {
  const prompt = `Anda adalah ahli agronomi spesialis budidaya bawang merah.
Pengguna mulai menanam bawang merah pada tanggal ${startDate}.
Buat jadwal timeline perawatan dari Hari ke-1 hingga Hari ke-60 (masa panen).
Termasuk kapan waktu yang tepat untuk pemupukan susulan, penyemprotan hama, pengurangan kadar air, dan waktu panen.

Berikan setidaknya 8-10 poin penting aktivitas berdasarkan hari (misal: Hari 10, Hari 20, dll).
Hitung tanggal aktual (date) dari hari tersebut terhadap tanggal mulai (${startDate}).

Berikan output dalam format JSON murni:
{
  "summary": "Ringkasan siklus tanam yang dimulai pada tanggal ini",
  "schedule": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "activity": "Nama Aktivitas",
      "category": "pemupukan" | "penyemprotan" | "pengairan" | "panen" | "perawatan_rutin",
      "description": "Deskripsi aktivitas"
    }
  ]
}`;

  try {
    return await apiGenerate(prompt, true);
  } catch (error) {
    handleGeminiError(error, "Gemini Timeline");
    throw error;
  }
}

export async function analyzeHistoryChat(history: ChatMessage[], message: string, userDataStr: string): Promise<string> {
  const systemInstruction = `Kamu adalah pakar pertanian tingkat lanjut bernama Agri AI. 
Posisikan dirimu sebagai asisten dan konsultan andalan petani bawang merah di Indonesia.
Kamu memiliki akses ke data riwayat pertanian pengguna:
${userDataStr}

Bantu mereka meninjau, menganalisis, dan menjawab pertanyaan apa pun tentang data atau aktivitas mereka di platform.`;

  try {
    return await apiChat(history, message, systemInstruction);
  } catch (error) {
    handleGeminiError(error, "Gemini History Chat");
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}

export async function chatWithAgriAI(history: ChatMessage[], message: string): Promise<string> {
  const systemInstruction = `Kamu adalah pakar pertanian tingkat lanjut bernama Agri AI. 
Posisikan dirimu sebagai asisten dan konsultan andalan petani bawang merah di Indonesia, khususnya di Jawa. 
Berikan saran yang solutif, komprehensif, berdasarkan praktik pertanian yang baik. 
Gunakan bahasa Indonesia yang jelas, profesional namun tetap santai dan mudah dimengerti (bisa menggunakan istilah-istilah di kalangan petani, misal: ngored, mbedi, dll jika relevan).`;

  try {
    return await apiChat(history, message, systemInstruction);
  } catch (error) {
    handleGeminiError(error, "Gemini Chat");
    return "Maaf, terjadi kesalahan saat menghubungi AI.";
  }
}
