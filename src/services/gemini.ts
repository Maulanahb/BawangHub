import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

export interface AnalysisResult {
  isHealthy: boolean;
  diseaseName?: string;
  confidence: string;
  details: string;
  recommendations: string[];
}

export async function analyzeShallotHealth(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Anda adalah ahli patologi tanaman spesialis bawang merah (shallot).
    Analisis gambar tanaman bawang merah yang diberikan.
    
    Tentukan apakah tanaman sehat atau sakit.
    Jika sakit, identifikasi penyakitnya (misalnya: Moler, Bercak Ungu/Trotol, Otomatis, Layu Fusarium, atau Thrips).
    Berikan detail gejala yang terlihat dan langkah-langkah penanganan yang konkret.
    
    Berikan output dalam format JSON murni:
    {
      "isHealthy": boolean,
      "diseaseName": "Nama Penyakit atau 'Sehat'",
      "confidence": "Persentase keyakinan (contoh: 85%)",
      "details": "Deskripsi singkat gejala yang diamati",
      "recommendations": ["Saran 1", "Saran 2", "Saran 3"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export interface PredictionResult {
  estimatedYieldMax: number;
  estimatedYieldMin: number;
  marketingStrategy: string[];
  tips: string[];
  summary: string;
}

export async function predictHarvest(area: string, weather: string, capital: string): Promise<PredictionResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Anda adalah ahli agronomi dan ekonomi pertanian spesialis bawang merah.
    Berdasarkan data berikut:
    - Luas Lahan: ${area}
    - Kondisi Cuaca: ${weather}
    - Modal: ${capital}

    Berikan prediksi panen (dalam satuan Ton, misal estimasi min - max), strategi penjualan terbaik agar harga tidak jatuh, serta tips teknis merawat tanaman berdasarkan cuaca.
    Diasumsikan budidaya konvensional standar jika informasi terbatas.

    Berikan output dalam format JSON murni:
    {
      "estimatedYieldMin": number (Ton),
      "estimatedYieldMax": number (Ton),
      "marketingStrategy": ["Strategi 1", "Strategi 2"],
      "tips": ["Tip 1", "Tip 2"],
      "summary": "Ringkasan pendek prospek panen ini"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    throw error;
  }
}

export interface TimelineEvent {
  day: number;
  date: string;
  activity: string;
  category: "pemupukan" | "penyemprotan" | "pengairan" | "panen" | "perawatan_rutin";
  description: string;
}

export interface TimelineResult {
  schedule: TimelineEvent[];
  summary: string;
}

export interface BukuTaniRecord {
  tanggal: string;
  kategori: string;
  nominal: number;
}

export async function analyzeBukuTani(text: string): Promise<BukuTaniRecord[]> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Ekstrak data keuangan dari cerita atau catatan petani berikut.
    Catatan: "${text}"

    Kembalikan output DENGAN FORMAT JSON MURNI berupa array of objects. TANPA markdown block (tanpa \`\`\`json).
    Setiap object harus memiliki key:
    - "tanggal" (format YYYY-MM-DD, tebak dari konteks atau pakai tanggal hari ini jika tidak ada)
    - "kategori" (contoh: "Pupuk", "Pestisida", "Bibit", "Tenaga Kerja", "Hasil Panen", dll)
    - "nominal" (angka integer MURNI TANPA TITIK)
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Buku Tani Error:", error);
    throw error;
  }
}

export interface WeatherAdvice {
  title: string;
  advice: string;
  icon: string;
}

export async function getWeatherAdvice(weatherInfo: string): Promise<WeatherAdvice> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Cuaca di lahan pertanian saat ini: ${weatherInfo}
    Anda sedang menasihati petani bawang merah. Evaluasi kondisi cuaca ini dan berikan insight atau peringatan ringkas.
    
    Format output ke dalam JSON MURNI TANPA markdown block.
    {
      "title": "Judul singkat (max 4 kata) dengan emoji (contoh: '⚠️ Waspada Jamur Moler' atau '💧 Kelembapan Tinggi')",
      "advice": "1-2 kalimat singkat (max 15 kata) menjelaskan rekomendasi teknis yang jelas",
      "icon": "Sun" | "Cloud" | "CloudRain" | "CloudLightning" | "ThermometerSun"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Weather Advice Error:", error);
    throw error;
  }
}

export async function getDetailedWeatherAdvice(weatherInfo: string): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Cuaca di lahan pertanian bawang merah saat ini: ${weatherInfo}
    Berikan analisis cuaca dan rekomendasi agrikultur terperinci untuk tanaman bawang merah berdasarkan kondisi ini.
    
    Balas dalam format laporan observasi dan instruksi aksi, seperti:
    - Analisis kondisi cuaca saat ini dampaknya terhadap kelembapan tanah, jamur, atau hama (misal: embun upas, moler, ulat bawang).
    - Tindakan preventif atau kuratif yang harus dilakukan hari ini (penyiraman pembilasan embun, dosis pestisida, dsb).
    
    Format dalam Markdown biasa (boleh pakai list, bold), tanpa blok markdown JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return resultText;
  } catch (error) {
    console.error("Gemini Detailed Weather Advice Error:", error);
    throw error;
  }
}

export async function getStatistikInsight(expensesData: string, trenHarga: string): Promise<string> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Kamu adalah analis pertanian. Baca data pengeluaran dan tren harga bawang merah berikut. 
    Berikan maksimal 3 kalimat kesimpulan analitik dan saran finansial yang sangat mudah dipahami oleh petani lokal.
    
    Data Pengeluaran:
    ${expensesData}
    
    Tren Harga Bawang Merah:
    ${trenHarga}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return resultText;
  } catch (error) {
    console.error("Gemini Statistik Insight Error:", error);
    throw error;
  }
}

export async function getBawangBotReply(threadDetails: string, previousReplies: string, newMessage: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Kamu adalah pakar pertanian bernama BawangBot. Pengguna memanggilmu di Forum Tani.
    Bacalah diskusi berikut ini dan berikan saran / solusi yang sangat membantu, solutif,
    dan berdasarkan praktik pertanian yang baik.
    Gunakan bahasa yang bersahabat, profesional, dan mudah dipahami oleh petani lokal.
    
    === DETAIL DISKUSI ===
    ${threadDetails}
    
    === BALASAN SEBELUMNYA ===
    ${previousReplies}
    
    === PESAN TERBARU YANG MEMANGGIL @BawangBot ===
    ${newMessage}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return resultText;
  } catch (error) {
    console.error("Gemini Forum Bot Error:", error);
    throw error;
  }
}

export async function generateTimeline(startDate: string): Promise<TimelineResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Anda adalah ahli agronomi spesialis budidaya bawang merah.
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
          "description": "Deskripsi aktivitas dan apa yang harus dilakukan"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Gemini Timeline Error:", error);
    throw error;
  }
}
