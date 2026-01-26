async function addNovel() {
  const file = cover.files[0];

  const { data: img } = await supabase.storage
    .from("covers")
    .upload(`covers/${Date.now()}.jpg`, file);

  const { data: url } = supabase.storage
    .from("covers")
    .getPublicUrl(img.path);

  await supabase.from("novels").insert({
    title: title.value,
    description: desc.value,
    cover_url: url.publicUrl
  });

  alert("Novel ditambahkan");
  location.reload();
}
