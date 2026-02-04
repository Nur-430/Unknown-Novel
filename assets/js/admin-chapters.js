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
      <div style="color: #f87171; padding: 20px; text-align: center;">
        <p>Gagal memuat chapters. Error: ${error.message}</p>
        <p style="font-size: 12px; color: #888;">Pastikan tabel 'chapters' sudah dibuat di Supabase.</p>
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    chaptersDiv.innerHTML = `
      <div style="color: #888; padding: 20px; text-align: center;">
        <p>Belum ada chapter. Tambahkan chapter pertama!</p>
      </div>
    `;
    return;
  }

  chaptersDiv.innerHTML = data.map(c => `
    <div style="border:1px solid #333;padding:10px;margin:8px 0;border-radius:8px;background:#1a1a1a;">
      <b>Chapter ${c.chapter_number}: ${c.title}</b><br>
      <div style="margin-top:8px;">
        <button onclick="editChapter('${c.id}')" style="margin-right:5px;">Edit</button>
        <button onclick="deleteChapter('${c.id}')" style="background:#dc2626;">Hapus</button>
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
