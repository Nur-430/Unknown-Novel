/*
  Fixed addNovel: validate DOM elements, handle upload errors, and avoid reading properties of null.
*/

async function addNovel() {
  const coverEl = document.getElementById('cover');
  const titleEl = document.getElementById('title');
  const descEl = document.getElementById('desc');

  if (typeof supabase === 'undefined') {
    alert('Supabase belum diinisialisasi');
    return;
  }

  const title = titleEl?.value?.trim() || '';
  const description = descEl?.value?.trim() || '';

  if (!title) {
    alert('Judul harus diisi');
    return;
  }

  const file = coverEl?.files?.[0];
  let publicUrl = null;

  try {
    if (file) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `covers/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;
      if (!uploadData || !uploadData.path) throw new Error('Upload gagal: response kosong');

      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(uploadData.path);
      publicUrl = urlData?.publicUrl || null;
    }

    const { error: insertError } = await supabase
      .from('novels')
      .insert({ title, description, cover_url: publicUrl });

    if (insertError) throw insertError;

    alert('Novel ditambahkan');
    location.reload();
  } catch (err) {
    console.error('addNovel error:', err);
    alert('Gagal menambahkan novel: ' + (err?.message || JSON.stringify(err)));
  }
}