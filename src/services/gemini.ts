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
  advice: string;
  icon: string;
}

export async function getWeatherAdvice(weatherInfo: string): Promise<WeatherAdvice> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    Cuaca di lahan pertanian saat ini: ${weatherInfo}
    Berikan 1-2 kalimat saran tindakan/mitigasi agrikultur spesifik yang sangat berkaitan dengan tanaman bawang merah (misal: jika hujan awas jamur moler, jika panas terik perhatikan kadar air, dsb).
    
    Kembalikan dalam format JSON murni TANPA markdown block.
    {
      "advice": "1-2 kalimat saran...",
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
