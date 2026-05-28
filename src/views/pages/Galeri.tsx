import { useState } from "react";
import { Image as ImageIcon, X, AlertCircle, Leaf, Search } from "lucide-react";

type GalleryCategory = "Semua" | "Pertumbuhan" | "Penyakit";

interface GalleryItem {
  id: string;
  category: GalleryCategory;
  title: string;
  description: string;
  imageUrl: string;
  badges: string[];
}

const GALLERY_DATA: GalleryItem[] = [
  {
    id: "g1",
    category: "Pertumbuhan",
    title: "Fase Tunas (0-15 HST)",
    description: "Tunas mulai membelah dan muncul ke permukaan tanah. Pertumbuhan akar aktif.",
    imageUrl: "https://images.unsplash.com/photo-1593604340846-4cb442b36b56?q=80&w=800&auto=format&fit=crop",
    badges: ["0-15 Hari", "Fase Awal"],
  },
  {
    id: "g2",
    category: "Pertumbuhan",
    title: "Fase Vegetatif (16-35 HST)",
    description: "Pembentukan daun yang pesat. Warna daun hijau cerah dan tegak. Kebutuhan air dan nitrogen meningkat.",
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop",
    badges: ["16-35 Hari", "Daun Aktif"],
  },
  {
    id: "g3",
    category: "Pertumbuhan",
    title: "Pembentukan Umbi (36-50 HST)",
    description: "Ujung daun mulai menguning, batang semu membesar membentuk umbi. Pertumbuhan daun terhenti.",
    imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop",
    badges: ["36-50 Hari", "Umbi"],
  },
  {
    id: "g4",
    category: "Pertumbuhan",
    title: "Fase Pematangan (51-60+ HST)",
    description: "Daun merebah (60-70% populasi). Umbi berwarna merah tua dan siap dipanen.",
    imageUrl: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?q=80&w=800&auto=format&fit=crop",
    badges: ["51-60+ Hari", "Panen"],
  },
  {
    id: "d1",
    category: "Penyakit",
    title: "Bercak Ungu (Alternaria porri)",
    description: "Gejala diawali dengan bercak kecil melekuk berwarna putih, kemudian bagian tengahnya berwarna ungu dan dikelilingi zona kekuningan.",
    imageUrl: "https://images.unsplash.com/photo-1618349275747-c0e5a953e34b?q=80&w=800&auto=format&fit=crop", // Using a placeholder for disease
    badges: ["Jamur", "Daun"],
  },
  {
    id: "d2",
    category: "Penyakit",
    title: "Layu Fusarium (Moler)",
    description: "Daun menguning mulai dari ujung dan melilit (moler). Bagian dasar umbi membusuk dan akar rusak putih keabu-abuan.",
    imageUrl: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=800&auto=format&fit=crop",
    badges: ["Jamur", "Akar & Umbi"],
  },
  {
    id: "d3",
    category: "Penyakit",
    title: "Ulat Bawang (Spodoptera exigua)",
    description: "Adanya bercak putih transparan pada daun karena ulat memakan daging daun dari dalam, menyisakan lapisan epidermis luar.",
    imageUrl: "https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=800&auto=format&fit=crop",
    badges: ["Hama", "Daun"],
  },
  {
    id: "d4",
    category: "Penyakit",
    title: "Embun Bulu (Peronospora destructor)",
    description: "Bercak pucat pada daun yang perlahan tertutup kumpulan spora berbentuk bulu berwarna ungu keabu-abuan, terutama saat lembab.",
    imageUrl: "https://images.unsplash.com/photo-1530836369250-ef71a3f5e4bf?q=80&w=800&auto=format&fit=crop",
    badges: ["Jamur", "Kelembaban Tinggi"],
  }
];

export default function Galeri() {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredGallery = GALLERY_DATA.filter((item) => {
    const matchCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full pb-12 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-agri-green-light/40 to-white border border-gray-100 rounded-3xl p-8 md:p-10 relative shadow-sm overflow-hidden mb-8 flex items-center justify-between">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">Galeri Bawang</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Dokumentasi visual tahapan pertumbuhan normal dan referensi identifikasi hama penyakit bawang merah.
          </p>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <ImageIcon className="w-64 h-64 text-gray-900" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Cari gambar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-0 shadow-sm text-gray-900 bg-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
        {(["Semua", "Pertumbuhan", "Penyakit"] as GalleryCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 border border-gray-100 rounded-2xl font-semibold text-sm sm:text-base flex items-center gap-2 shadow-sm transition-all active:scale-95 active:shadow-sm ${
              selectedCategory === cat 
                ? (cat === 'Pertumbuhan' ? 'bg-agri-green text-gray-900' : cat === 'Penyakit' ? 'bg-red-50 text-white' : 'bg-amber-50 text-gray-900')
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {cat === "Pertumbuhan" && <Leaf className="w-5 h-5" />}
            {cat === "Penyakit" && <AlertCircle className="w-5 h-5" />}
            {cat === "Semua" && <ImageIcon className="w-5 h-5" />}
            {cat}
          </button>
        ))}
        </div>
      </div>

      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGallery.map((item) => (
            <div 
              key={item.id} 
              className="group cursor-pointer border border-gray-100 rounded-2xl bg-white shadow-sm hover:-translate-y-1 hover:shadow-md hover:shadow-sm transition-all flex flex-col h-full"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative h-48 sm:h-56 overflow-hidden border-b border-gray-100 shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {item.badges.map(badge => (
                    <span key={badge} className="bg-white border border-gray-200 rounded-xl text-gray-900 text-xs font-bold px-2 py-0.5 shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-gray-900">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-900 font-medium text-sm line-clamp-3 mt-auto">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 px-4 border border-dashed border-gray-200 rounded-3xl bg-white flex flex-col items-center justify-center text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ditemukan</h3>
          <p className="text-gray-500 font-medium max-w-md">
            Gambar dengan kata kunci tersebut tidak tersedia di dalam galeri.
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setSelectedImage(null)}>
          <div 
            className="w-full max-w-4xl bg-white border border-gray-100 rounded-2xl flex flex-col md:flex-row shadow-sm max-h-[90vh] overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-3/5 bg-black relative flex items-center justify-center shrink-0">
              <img 
                src={selectedImage.imageUrl} 
                alt={selectedImage.title} 
                className="w-full h-full object-contain max-h-[50vh] md:max-h-full"
              />
            </div>
            <div className="md:w-2/5 p-6 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 border border-gray-200 rounded-xl font-bold text-xs shadow-sm ${selectedImage.category === 'Pertumbuhan' ? 'bg-agri-green text-gray-900' : 'bg-red-50 text-white'}`}>
                    {selectedImage.category}
                  </span>
                  {selectedImage.badges.map(badge => (
                    <span key={badge} className="bg-gray-100 border border-gray-200 rounded-xl text-gray-900 text-xs font-bold px-2 py-1 shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-1 border border-gray-200 rounded-xl bg-amber-50 hover:bg-red-50 hover:text-white transition-colors shadow-sm active:scale-95 active:shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {selectedImage.title}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-900 font-medium leading-relaxed">
                <p>{selectedImage.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
