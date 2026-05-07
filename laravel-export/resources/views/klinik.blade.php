<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klinik Bawang - BawangHub</title>
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
                    <a href="/klinik" class="text-green-600 border-b-2 border-green-600 py-2">Klinik Bawang</a>
                    <a href="/kalkulator" class="text-neutral-500 hover:text-green-600 py-2 transition-colors">Kalkulator Panen</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Klinik Bawang AI</h1>
        <p class="text-neutral-500 mt-2 text-lg">Unggah foto tanaman, dan AI kami akan mendeteksi penyakitnya seketika.</p>

        <div class="grid md:grid-cols-2 gap-8 mt-8">
            <!-- Upload Area -->
            <div class="bg-white rounded-2xl border border-neutral-200 p-8">
                <form id="klinik-form" class="space-y-6">
                    @csrf
                    <div class="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center relative hover:bg-neutral-50 transition-colors">
                        <input type="file" id="image-upload" name="image_file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required>
                        <div id="upload-prompt">
                            <svg class="mx-auto h-12 w-12 text-neutral-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            <p class="text-sm font-medium text-neutral-700">Pilih foto atau drag and drop</p>
                            <p class="text-xs text-neutral-400 mt-1">PNG, JPG to 5MB</p>
                        </div>
                        <img id="image-preview" src="#" alt="Preview" class="hidden mx-auto max-h-64 rounded-lg shadow-sm">
                    </div>
                    
                    <button type="submit" id="btn-submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center">
                        <span id="btn-text">Analisis Gambar</span>
                        <svg id="btn-spinner" class="hidden animate-spin ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </button>
                    
                    <div id="error-alert" class="hidden p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100"></div>
                </form>
            </div>

            <!-- Result Area -->
            <div>
                <div id="empty-state" class="h-full border border-neutral-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-400 p-8 text-center bg-white/50">
                    <p>Hasil analisis sistem Gemini AI akan muncul di sini.</p>
                </div>

                <div id="result-card" class="hidden bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm h-full">
                    <div id="status-header" class="px-6 py-4 border-b">
                        <div class="flex items-center justify-between">
                            <h3 id="disease-name" class="text-xl font-bold"></h3>
                            <span id="confidence-badge" class="bg-white px-3 py-1 text-sm font-medium rounded-full shadow-sm"></span>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="mb-6">
                            <h4 class="text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">Detail Observasi</h4>
                            <p id="disease-details" class="text-neutral-600 leading-relaxed"></p>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wide">Saran Penanganan</h4>
                            <ul id="recommendations-list" class="space-y-3"></ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        const form = document.getElementById('klinik-form');
        const input = document.getElementById('image-upload');
        const preview = document.getElementById('image-preview');
        const prompt = document.getElementById('upload-prompt');
        const btnSubmit = document.getElementById('btn-submit');
        const btnSpinner = document.getElementById('btn-spinner');
        const btnText = document.getElementById('btn-text');
        
        input.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    prompt.classList.add('hidden');
                }
                reader.readAsDataURL(this.files[0]);
            }
        });

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // UI Loading
            btnText.textContent = 'Menganalisis...';
            btnSpinner.classList.remove('hidden');
            btnSubmit.disabled = true;
            document.getElementById('error-alert').classList.add('hidden');
            
            try {
                const response = await fetch('/api/klinik/analyze', {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-CSRF-TOKEN': '{{ csrf_token() }}' }
                });
                
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan sistem');
                
                // Show Result
                document.getElementById('empty-state').classList.add('hidden');
                const resultCard = document.getElementById('result-card');
                resultCard.classList.remove('hidden');
                
                const header = document.getElementById('status-header');
                const diseaseName = document.getElementById('disease-name');
                if (data.isHealthy) {
                    header.className = 'px-6 py-4 border-b bg-green-50 border-green-100';
                    diseaseName.className = 'text-xl font-bold text-green-800';
                } else {
                    header.className = 'px-6 py-4 border-b bg-red-50 border-red-100';
                    diseaseName.className = 'text-xl font-bold text-red-800';
                }
                
                diseaseName.textContent = data.diseaseName;
                document.getElementById('confidence-badge').textContent = data.confidence;
                document.getElementById('disease-details').textContent = data.details;
                
                const list = document.getElementById('recommendations-list');
                list.innerHTML = '';
                if(data.recommendations) {
                    data.recommendations.forEach(rec => {
                        const li = document.createElement('li');
                        li.className = 'flex gap-3 text-neutral-600 text-sm';
                        li.innerHTML = `<span class="text-blue-500 font-bold mt-0.5">•</span><span>${rec}</span>`;
                        list.appendChild(li);
                    });
                }
                
            } catch (err) {
                const errorAlert = document.getElementById('error-alert');
                errorAlert.textContent = err.message;
                errorAlert.classList.remove('hidden');
            } finally {
                btnText.textContent = 'Analisis Gambar';
                btnSpinner.classList.add('hidden');
                btnSubmit.disabled = false;
            }
        });
    </script>
</body>
</html>
