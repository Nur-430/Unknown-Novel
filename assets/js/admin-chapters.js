const novelId = new URLSearchParams(location.search).get("novel");

async function loadChapters() {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", novelId)
    .order("chapter_number", { ascending: true });

  const chaptersDiv = document.getElementById("chapters");

  if (error) {
    console.error("Error loading chapters:", error);
    chaptersDiv.innerHTML = `
      <div class="p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
        <p class="font-medium">Gagal memuat chapters</p>
        <p class="text-sm mt-1 mb-2">${error.message}</p>
        <p class="text-xs opacity-75">Pastikan tabel 'chapters' sudah dibuat di Supabase.</p>
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    chaptersDiv.innerHTML = `
      <div class="p-6 text-center text-slate-500 dark:text-slate-400">
        <p>Belum ada chapter. Tambahkan chapter pertama!</p>
      </div>
    `;
    return;
  }

  chaptersDiv.innerHTML = data.map(c => `
    <div class="p-4 mb-3 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group">
      <div>
        <div class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span>Chapter ${c.chapter_number}: ${c.title}</span>
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
           <i class="fas fa-hashtag text-slate-300 dark:text-slate-600"></i> ID: ${c.id}
        </div>
      </div>
      <div class="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onclick="editChapter('${c.id}')" class="px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition">
          <i class="fas fa-edit mr-1"></i> Edit
        </button>
        <button onclick="deleteChapter('${c.id}')" class="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition">
          <i class="fas fa-trash-alt mr-1"></i> Hapus
        </button>
      </div>
    </div>
  `).join("");
}

async function addChapter() {
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const orderInput = document.getElementById("order");
  const imgInput = document.getElementById("img");

  if (!titleInput || !titleInput.value.trim()) {
    alert("Judul chapter harus diisi!");
    return;
  }

  const chapterNumber = parseInt(orderInput?.value) || 1;
  if (!chapterNumber || chapterNumber < 1) {
    alert("Nomor chapter harus diisi dengan angka valid!");
    return;
  }

  let imageUrl = null;
  const file = imgInput?.files?.[0];

  try {
    // Upload image if exists
    if (file) {
      const path = `${novelId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chapters")
        .upload(path, file);

      if (uploadError) {
        console.warn("Image upload error:", uploadError);
        // Continue without image
      } else if (uploadData?.path) {
        const { data: urlData } = supabase.storage
          .from("chapters")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData?.publicUrl || null;
      }
    }

    // Insert chapter - using chapter_number instead of chapter_order
    const { data, error } = await supabase.from("chapters").insert({
      novel_id: novelId,
      title: titleInput.value.trim(),
      content: contentInput?.value || "",
      illustration_url: imageUrl,
      chapter_number: chapterNumber
    }).select();

    if (error) {
      console.error("Insert chapter error:", error);
      alert("Gagal menambahkan chapter: " + error.message);
      return;
    }

    alert("Chapter ditambahkan!");

    // Clear form
    titleInput.value = "";
    if (contentInput) contentInput.value = "";
    if (orderInput) orderInput.value = "";
    if (imgInput) imgInput.value = "";

    loadChapters();
  } catch (err) {
    console.error("addChapter error:", err);
    alert("Gagal menambahkan chapter: " + (err?.message || JSON.stringify(err)));
  }
}

async function deleteChapter(id) {
  if (!confirm("Hapus chapter ini?")) return;

  const { error } = await supabase.from("chapters").delete().eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    alert("Gagal menghapus: " + error.message);
    return;
  }

  loadChapters();
}

async function editChapter(id) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Gagal memuat chapter untuk diedit");
    return;
  }

  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const orderInput = document.getElementById("order");

  if (titleInput) titleInput.value = data.title || "";
  if (contentInput) contentInput.value = data.content || "";
  if (orderInput) orderInput.value = data.chapter_number || 1;

  // Remove existing update button if any
  const existingBtn = document.getElementById("updateBtn");
  if (existingBtn) existingBtn.remove();
  const existingCancel = document.getElementById("cancelBtn");
  if (existingCancel) existingCancel.remove();

  // Create update button
  const updateBtn = document.createElement("button");
  updateBtn.id = "updateBtn";
  updateBtn.innerText = "Update Chapter";
  updateBtn.style.cssText = "background:#22c55e;margin:10px;padding:10px 20px;";
  updateBtn.onclick = async () => {
    const { error: updateError } = await supabase.from("chapters").update({
      title: titleInput?.value || "",
      content: contentInput?.value || "",
      chapter_number: parseInt(orderInput?.value) || 1
    }).eq("id", id);

    if (updateError) {
      alert("Gagal update: " + updateError.message);
      return;
    }

    alert("Chapter diupdate!");
    updateBtn.remove();
    cancelBtn.remove();

    // Clear form
    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    if (orderInput) orderInput.value = "";

    loadChapters();
  };

  // Add cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.id = "cancelBtn";
  cancelBtn.innerText = "Batal";
  cancelBtn.style.cssText = "background:#666;margin:10px;padding:10px 20px;";
  cancelBtn.onclick = () => {
    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    if (orderInput) orderInput.value = "";
    updateBtn.remove();
    cancelBtn.remove();
  };

  const formArea = document.querySelector("form") || document.body;
  formArea.appendChild(updateBtn);
  formArea.appendChild(cancelBtn);
}

loadChapters();
