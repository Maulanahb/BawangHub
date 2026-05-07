<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buku Tani Cerdas - BawangHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-neutral-50 min-h-screen text-slate-800 font-sans">
    <nav class="bg-white border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center">
                    <a href="/" class="text-2xl font-bold tracking-tight text-green-700">BawangHub</a>
                </div>
                <div class="flex space-x-6 text-sm font-medium overflow-x-auto">
                    <a href="/" class="text-neutral-500 hover:text-green-600 py-2 whitespace-nowrap transition-colors">Dashboard</a>
                    <a href="/klinik" class="text-neutral-500 hover:text-green-600 py-2 whitespace-nowrap transition-colors">Klinik Bawang</a>
                    <a href="/kalkulator" class="text-neutral-500 hover:text-green-600 py-2 whitespace-nowrap transition-colors">Kalkulator Panen</a>
                    <a href="/jadwal" class="text-neutral-500 hover:text-green-600 py-2 whitespace-nowrap transition-colors">Jadwal Tanam</a>
                    <a href="/bukutani" class="text-green-600 border-b-2 border-green-600 py-2 whitespace-nowrap">Buku Tani</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Buku Tani Cerdas</h1>
        <p class="text-neutral-500 mt-2 text-lg">Ketik aktivitas pengeluaran atau pemasukan dengan bahasa sehari-hari. AI akan mengekstraknya.</p>

        <div class="grid md:grid-cols-2 gap-8 mt-8">
            <div>
                <div class="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    @if(session('success'))
                        <div class="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 font-medium">
                            {{ session('success') }}
                        </div>
                    @endif
                    @if(session('error'))
                        <div class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 font-medium">
                            {{ session('error') }}
                        </div>
                    @endif

                    <form action="/api/bukutani/analyze" method="POST" class="space-y-4">
                        @csrf
                        <div>
                            <textarea 
                                name="catatan" 
                                rows="6" 
                                class="w-full border border-neutral-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none resize-none" 
                                placeholder="Contoh: Hari ini beli pupuk urea habis 150 ribu, lalu bayar buruh cabut rumput 50 ribu..." 
                                required></textarea>
                        </div>
                        
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-xl transition-colors flex justify-center items-center shadow-sm">
                            Ekstrak Catatan ke Database
                        </button>
                    </form>
                </div>
            </div>

            <div>
                <div class="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm h-full flex flex-col">
                    <div class="p-5 border-b border-neutral-100">
                        <h3 class="font-bold text-lg text-neutral-800">Riwayat Keuangan (PostgreSQL)</h3>
                    </div>
                    <div class="flex-1 overflow-auto">
                        @if($records->isEmpty())
                            <div class="h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center min-h-[250px] bg-neutral-50/50">
                                <svg class="h-12 w-12 text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                <p class="text-sm">Belum ada catatan yang diekstrak.</p>
                            </div>
                        @else
                            <table class="w-full text-sm text-left">
                                <thead class="bg-neutral-50 text-neutral-500">
                                    <tr>
                                        <th class="px-5 py-3 font-medium border-b border-neutral-200">Tanggal</th>
                                        <th class="px-5 py-3 font-medium border-b border-neutral-200">Kategori</th>
                                        <th class="px-5 py-3 font-medium border-b border-neutral-200 text-right">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-neutral-100">
                                    @foreach($records as $r)
                                        <tr class="hover:bg-neutral-50/50">
                                            <td class="px-5 py-3 text-neutral-600 font-mono text-xs">{{ $r->tanggal }}</td>
                                            <td class="px-5 py-3 text-neutral-800 font-medium">{{ $r->kategori }}</td>
                                            <td class="px-5 py-3 text-right text-neutral-900 font-bold">Rp {{ number_format($r->nominal, 0, ',', '.') }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
