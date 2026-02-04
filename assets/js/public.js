const novelsDiv = document.getElementById("novels");

async function loadNovels() {
  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    novelsDiv.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
        <p class="text-slate-500">Gagal memuat novel. Silakan refresh halaman.</p>
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    novelsDiv.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-book text-4xl text-slate-300 mb-4"></i>
        <p class="text-slate-500">Belum ada novel tersedia.</p>
      </div>
    `;
    return;
  }

  novelsDiv.innerHTML = data.map(n => `
    <a href="novel.html?id=${n.id}" class="novel-card group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
        ${n.cover_url
      ? `<img src="${n.cover_url}" alt="${n.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.onerror=null;this.src='';this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full\\'><i class=\\'fas fa-book-open text-4xl text-indigo-300\\'></i></div>';">`
      : `<div class="flex items-center justify-center h-full"><i class="fas fa-book-open text-4xl text-indigo-300"></i></div>`
    }
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div class="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full">
            <i class="fas fa-book-reader"></i> Baca
          </span>
        </div>
      </div>
      <div class="p-3">
        <h3 class="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">${n.title}</h3>
        <p class="text-xs text-slate-500 mt-1 line-clamp-2">${n.description || 'Tidak ada deskripsi'}</p>
        <div class="flex items-center gap-2 mt-2 text-xs text-slate-400">
          <span class="flex items-center gap-1">
            <i class="fas fa-clock"></i>
            ${formatDate(n.created_at)}
          </span>
        </div>
      </div>
    </a>
  `).join("");
}

function formatDate(dateString) {
  if (!dateString) return 'Baru';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}

loadNovels();
