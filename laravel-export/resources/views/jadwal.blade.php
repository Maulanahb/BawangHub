<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jadwal Tanam - BawangHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .category-pemupukan { @apply bg-emerald-100 text-emerald-800 border-emerald-200; }
        .category-penyemprotan { @apply bg-red-100 text-red-800 border-red-200; }
        .category-pengairan { @apply bg-blue-100 text-blue-800 border-blue-200; }
        .category-panen { @apply bg-amber-100 text-amber-800 border-amber-200; }
        .category-default { @apply bg-neutral-100 text-neutral-800 border-neutral-200; }
        
        .icon-pemupukan { color: #10b981; }
        .icon-penyemprotan { color: #ef4444; }
        .icon-pengairan { color: #3b82f6; }
        .icon-panen { color: #d97706; }
        .icon-default { color: #737373; }
    </style>
</head>
<body class="bg-neutral-50 min-h-screen text-slate-800 font-sans">
    <nav class="bg-white border-b border-neutral-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center">
                    <a href="/" class="text-2xl font-bold tracking-tight text-green-700">BawangHub</a>
                </div>
                <div class="flex space-x-6 text-sm font-medium">
                    <a href="/" class="text-neutral-500 hover:text-green-600 py-2 transition-colors">Dashboard</a>
                    <a href="/klinik" class="text-neutral-500 hover:text-green-600 py-2 transition-colors">Klinik Bawang</a>
                    <a href="/kalkulator" class="text-neutral-500 hover:text-green-600 py-2 transition-colors">Kalkulator Panen</a>
                    <a href="/jadwal" class="text-green-600 border-b-2 border-green-600 py-2">Jadwal Tanam</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Jadwal Tanam</h1>
        <p class="text-neutral-500 mt-2 text-lg">Atur tanggal tanam dan AI akan membuatkan timeline perawatan harian untuk panen optimal.</p>

        <div class="grid md:grid-cols-3 gap-8 mt-8">
            <!-- Form Area -->
            <div class="md:col-span-1">
                <div class="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    <h3 class="font-bold text-lg mb-4 text-neutral-800">Mulai Penanaman</h3>
                    <form id="jadwal-form" class="space-y-5">
                        @csrf
                        <div>
                            <label class="block text-sm font-medium text-neutral-700 mb-2">Pilih Tanggal Tanam</label>
                            <input type="date" name="startDate" class="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow outline-none" required>
                        </div>
                        
                        <button type="submit" id="btn-submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center mt-4">
                            <span id="btn-text">Buat Jadwal</span>
                            <svg id="btn-spinner" class="hidden animate-spin ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </button>
                        
                        <div id="error-alert" class="hidden p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100"></div>
                    </form>
                </div>
            </div>

            <!-- Result Area -->
            <div class="md:col-span-2">
                <div id="empty-state" class="h-full border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 p-8 text-center bg-white/50 min-h-[350px]">
                    <svg class="h-16 w-16 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p>Pilih tanggal tanam untuk melihat rincian siklus harian.</p>
                </div>

                <div id="result-card" class="hidden space-y-6">
                    <div class="bg-green-50 rounded-2xl border border-neutral-200 overflow-hidden shadow-sm p-6 flex gap-4 items-start">
                        <div class="w-12 h-12 rounded-full bg-green-200 flex-shrink-0 flex items-center justify-center text-green-700">
                             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-green-900 mb-1">Rangkuman Siklus Tanam</h3>
                            <p id="summary" class="text-green-800 leading-relaxed"></p>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative pt-10">
                        <div class="absolute top-0 bottom-0 left-[39px] md:left-[51px] w-0.5 bg-neutral-200"></div>
                        <div id="timeline-list" class="space-y-8 relative z-10">
                            <!-- Events injected via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        const getIconPath = (category) => {
            switch(category) {
                case 'pemupukan': return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />';
                case 'penyemprotan': return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4M4 11v6a2 2 0 002 2h12a2 2 0 002-2v-6M4 11h16m-8 4h.01M12 19h.01" />'; // Just a rough bug icon
                case 'pengairan': return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />';
                case 'panen': return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />';
                default: return '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
            }
        };

        const form = document.getElementById('jadwal-form');
        const btnSubmit = document.getElementById('btn-submit');
        const btnSpinner = document.getElementById('btn-spinner');
        const btnText = document.getElementById('btn-text');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // UI Loading
            btnText.textContent = 'Merumuskan...';
            btnSpinner.classList.remove('hidden');
            btnSubmit.disabled = true;
            document.getElementById('error-alert').classList.add('hidden');
            
            try {
                const response = await fetch('/api/jadwal/predict', {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' }
                });
                
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');
                
                // Show Result
                document.getElementById('empty-state').classList.add('hidden');
                document.getElementById('result-card').classList.remove('hidden');
                
                document.getElementById('summary').textContent = data.summary;
                
                const timelineList = document.getElementById('timeline-list');
                timelineList.innerHTML = '';
                
                if(data.schedule && data.schedule.length > 0) {
                    data.schedule.forEach(event => {
                        let catClass = 'category-default';
                        let iconClass = 'icon-default';
                        if (['pemupukan', 'penyemprotan', 'pengairan', 'panen'].includes(event.category)) {
                            catClass = 'category-' + event.category;
                            iconClass = 'icon-' + event.category;
                        }

                        const block = `
                            <div class="flex gap-4 md:gap-6 items-start group">
                                <div class="w-14 items-end flex flex-col pt-1 flex-shrink-0">
                                    <span class="text-xs font-bold text-neutral-400">Hari</span>
                                    <span class="text-xl font-black text-neutral-800">${event.day}</span>
                                </div>
                                
                                <div class="w-8 h-8 rounded-full border-4 border-white bg-neutral-100 flex items-center justify-center flex-shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform ${iconClass}">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">${getIconPath(event.category)}</svg>
                                </div>
                                
                                <div class="flex-1 bg-neutral-50 rounded-xl p-4 border border-neutral-100 group-hover:border-neutral-200 group-hover:shadow-sm transition-all text-left">
                                    <div class="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                                        <h4 class="font-semibold text-neutral-900">${event.activity}</h4>
                                        <div class="flex gap-2 items-center">
                                            <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${catClass}">
                                            ${event.category.replace('_', ' ')}
                                            </span>
                                            <span class="text-xs text-neutral-500 font-mono bg-white px-2 py-0.5 rounded border border-neutral-200">
                                            ${event.date}
                                            </span>
                                        </div>
                                    </div>
                                    <p class="text-sm text-neutral-600 leading-relaxed">${event.description}</p>
                                </div>
                            </div>
                        `;
                        timelineList.innerHTML += block;
                    });
                }
                
            } catch (err) {
                const errorAlert = document.getElementById('error-alert');
                errorAlert.textContent = err.message;
                errorAlert.classList.remove('hidden');
            } finally {
                btnText.textContent = 'Buat Jadwal';
                btnSpinner.classList.add('hidden');
                btnSubmit.disabled = false;
            }
        });
    </script>
</body>
</html>
