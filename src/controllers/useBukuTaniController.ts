import { useState, useEffect } from "react";
import { analyzeBukuTani, type BukuTaniRecord } from "../models/services/gemini";

export function useBukuTaniController() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<BukuTaniRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("buku_tani_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveRecords = (newRecords: BukuTaniRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem("buku_tani_records", JSON.stringify(newRecords));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setLoading(true);
    setError(null);
    try {
      const extracted = await analyzeBukuTani(text);
      if (Array.isArray(extracted)) {
        saveRecords([...extracted, ...records]);
        setText("");
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses catatan.");
    } finally {
      setLoading(false);
    }
  };
  
  const clearRecords = () => {
    saveRecords([]);
  };

  return {
    text,
    setText,
    loading,
    records,
    error,
    handleSubmit,
    clearRecords
  };
}
