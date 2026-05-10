import { useState, useEffect, useMemo } from "react";
import { analyzeBukuTani, type BukuTaniRecord } from "../models/services/gemini";

export function useBukuTaniController() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<BukuTaniRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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

  const categories = useMemo(() => {
    const cats = new Set(records.map(r => r.kategori));
    return ["Semua", ...Array.from(cats)];
  }, [records]);

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];
    
    // Filter
    if (categoryFilter !== "Semua") {
      result = result.filter(r => r.kategori === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      // Menangani kalau nilai string tidak valid date
      const dateA = new Date(a.tanggal).getTime() || 0;
      const dateB = new Date(b.tanggal).getTime() || 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [records, categoryFilter, sortOrder]);

  return {
    text,
    setText,
    loading,
    records,
    filteredAndSortedRecords,
    error,
    handleSubmit,
    clearRecords,
    categories,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder
  };
}
