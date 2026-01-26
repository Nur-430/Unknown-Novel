const novelId = new URLSearchParams(location.search).get("novel");

async function loadChapters() {
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", novelId)
    .order("chapter_order");

  document.getElementById("chapters").innerHTML =
    data.map(c => `
      <div style="border:1px solid #333;padding:10px;margin:8px 0">
        <b>${c.title}</b> (Order: ${c.chapter_order})<br>
        <button onclick="editChapter('${c.id}')">Edit</button>
        <button onclick="deleteChapter('${c.id}')">Hapus</button>
      </div>
    `).join("");
}

async function addChapter() {
  let imageUrl = null;
  const file = img.files[0];

  if (file) {
    const path = `${novelId}/${Date.now()}-${file.name}`;
    const { data } = await supabase.storage
      .from("chapters")
      .upload(path, file);

    imageUrl = supabase.storage
      .from("chapters")
      .getPublicUrl(data.path).data.publicUrl;
  }

  await supabase.from("chapters").insert({
    novel_id: novelId,
    title: title.value,
    content: content.value,
    illustration_url: imageUrl,
    chapter_order: parseInt(order.value)
  });

  alert("Chapter ditambahkan");
  loadChapters();
}

async function deleteChapter(id) {
  if (!confirm("Hapus chapter ini?")) return;
  await supabase.from("chapters").delete().eq("id", id);
  loadChapters();
}

async function editChapter(id) {
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  title.value = data.title;
  content.value = data.content;
  order.value = data.chapter_order;

  deleteBtn = document.createElement("button");
  deleteBtn.innerText = "Update Chapter";
  deleteBtn.onclick = async () => {
    await supabase.from("chapters").update({
      title: title.value,
      content: content.value,
      chapter_order: parseInt(order.value)
    }).eq("id", id);

    alert("Chapter diupdate");
    loadChapters();
  };

  document.body.appendChild(deleteBtn);
}

loadChapters();
