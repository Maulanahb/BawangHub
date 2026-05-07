<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kalkulator Panen - BawangHub</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
                    <a href="/kalkulator" class="text-green-600 border-b-2 border-green-600 py-2">Kalkulator Panen</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Kalkulator Panen & Harga</h1>
        <p class="text-neutral-500 mt-2 text-lg">Estimasi keuntungan bisnis bertani bawang dengan pertimbangan iklim dan pasar.</p>

        <div class="grid md:grid-cols-5 gap-8 mt-8">
            <!-- Form Area -->
            <div class="md:col-span-2">
                <div class="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    <form id="kalkulator-form" class="space-y-5">
                        @csrf
                        <div>
                            <label class="block text-sm font-bold text-neutral-700 mb-1">Luas Lahan</label>
                            <input type="text" name="area" class="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none" placeholder="Contoh: 1 Hektar, atau 5000 m2" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-neutral-700 mb-1">Kondisi Cuaca Bulanan</label>
                            <input type="text" name="weather" class="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none" placeholder="Contoh: Sangat lembab sering hujan sore" required>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-neutral-700 mb-1">Modal Operasional (Rp)</label>
                            <input type="text" name="capital" class="w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none" placeholder="Contoh: 40.000.000" required>
                        </div>
                        
                        <button type="submit" id="btn-submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center mt-4">
                            <span id="btn-text">Prediksi Sekarang</span>
                            <svg id="btn-spinner" class="hidden animate-spin ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        </button>
                        
                        <div id="error-alert" class="hidden p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100"></div>
                    </form>
                </div>
            </div>

            <!-- Result Area -->
            <div class="md:col-span-3">
                <div id="empty-state" class="h-full border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 p-8 text-center bg-white/50 min-h-[350px]">
                    <svg class="h-16 w-16 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    <p>Isi formulir untuk mendapatkan proyeksi panen dan strategi keuangan.</p>
                </div>

                <div id="result-card" class="hidden space-y-6">
                    <div class="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div class="bg-blue-50/70 border-b border-blue-100 p-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Estimasi Rentang Panen</h3>
                                <p class="text-3xl font-bold tracking-tight text-neutral-900" id="yield-text">0 - 0 Ton</p>
                            </div>
                        </div>
                        <div class="p-6">
                            <p id="summary" class="text-neutral-600 leading-relaxed"></p>
                        </div>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-6">
                        <div class="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                            <h4 class="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Strategi Marketing</h4>
                            <ul id="marketing-list" class="space-y-3"></ul>
                        </div>
                        <div class="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                            <h4 class="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Tips Teknis</h4>
                            <ul id="tips-list" class="space-y-3"></ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        const form = document.getElementById('kalkulator-form');
        const btnSubmit = document.getElementById('btn-submit');
        const btnSpinner = document.getElementById('btn-spinner');
        const btnText = document.getElementById('btn-text');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // UI Loading
            btnText.textContent = 'Menghitung...';
            btnSpinner.classList.remove('hidden');
            btnSubmit.disabled = true;
            document.getElementById('error-alert').classList.add('hidden');
            
            try {
                const response = await fetch('/api/kalkulator/predict', {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' }
                });
                
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');
                
                // Show Result
                document.getElementById('empty-state').classList.add('hidden');
                document.getElementById('result-card').classList.remove('hidden');
                
                document.getElementById('yield-text').textContent = `${data.estimatedYieldMin} - ${data.estimatedYieldMax} Ton`;
                document.getElementById('summary').textContent = data.summary;
                
                const marketingList = document.getElementById('marketing-list');
                marketingList.innerHTML = '';
                if(data.marketingStrategy) {
                    data.marketingStrategy.forEach(strat => {
                        marketingList.innerHTML += `<li class="flex gap-2 text-sm text-neutral-600"><span class="text-blue-500 font-bold">•</span><span>${strat}</span></li>`;
                    });
                }

                const tipsList = document.getElementById('tips-list');
                tipsList.innerHTML = '';
                if(data.tips) {
                    data.tips.forEach(tip => {
                        tipsList.innerHTML += `<li class="flex gap-2 text-sm text-neutral-600"><span class="text-blue-500 font-bold">•</span><span>${tip}</span></li>`;
                    });
                }
                
            } catch (err) {
                const errorAlert = document.getElementById('error-alert');
                errorAlert.textContent = err.message;
                errorAlert.classList.remove('hidden');
            } finally {
                btnText.textContent = 'Prediksi Sekarang';
                btnSpinner.classList.add('hidden');
                btnSubmit.disabled = false;
            }
        });
    </script>
</body>
</html>
