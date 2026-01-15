const novelsDiv = document.getElementById("novels");

async function loadNovels() {
  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    novelsDiv.innerText = "Gagal load novel";
    return;
  }

  novelsDiv.innerHTML = data.map(n => `
    <div>
      <img src="${n.cover_url}" width="120">
      <h3>${n.title}</h3>
      <p>${n.description}</p>
      <a href="novel.html?id=${n.id}">Baca</a>
    </div>
  `).join("");
}

loadNovels();
