/*
  Improved addNovel flow:
  1) Insert novel first to get novel id
  2) Upload cover to covers/{novelId}/... so files are organized
  3) Update novel row with cover_url
  Includes validation, error handling, and uses supabase.auth.getUser()
  
  Updated: Uses selectedGenres hidden input for multi-select genres
*/

async function addNovel() {
  const coverEl = document.getElementById('cover');
  const titleEl = document.getElementById('title');
  const descEl = document.getElementById('desc');
  const authorEl = document.getElementById('author');
  const genreEl = document.getElementById('selectedGenres'); // Changed to hidden input for multi-select
  const yearEl = document.getElementById('year');
  const statusEl = document.getElementById('status');

  if (typeof supabase === 'undefined') {
    alert('Supabase belum diinisialisasi');
    return;
  }

  const title = titleEl?.value?.trim() || '';
  const description = descEl?.value?.trim() || '';
  const author = authorEl?.value?.trim() || '';
  const genre = genreEl?.value?.trim() || '';
  const year = yearEl?.value ? parseInt(yearEl.value) : null;
  const status = statusEl?.value || '';

  if (!title) {
    alert('Judul harus diisi');
    return;
  }

  // ambil user (supabase-js v2)
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) console.warn('getUser warning:', userErr);
  const owner = userData?.user?.id || null;

  const file = coverEl?.files?.[0];

  try {
    // 1) Insert novel first (cover_url null for now). Use select() to get inserted row including id.
    const payload = {
      title,
      description,
      author,
      genre,
      year,
      status
    };
    if (owner) payload.owner = owner;

    const { data: insertData, error: insertError } = await supabase
      .from('novels')
      .insert(payload)
      .select()
      .single();

    if (insertError) throw insertError;
    if (!insertData || !insertData.id) throw new Error('Gagal membuat record novel');

    const novelId = insertData.id;
    let publicUrl = null;

    // 2) Upload cover jika ada file
    if (file) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `covers/${novelId}/${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;
      if (!uploadData || !uploadData.path) throw new Error('Upload gagal: response kosong');

      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(uploadData.path);
      publicUrl = urlData?.publicUrl || null;

      // 3) Update novel record with cover_url
      if (publicUrl) {
        const { error: updateError } = await supabase
          .from('novels')
          .update({ cover_url: publicUrl })
          .eq('id', novelId);
        if (updateError) throw updateError;
      }
    }

    alert('Novel berhasil ditambahkan!');

    // Clear form
    if (titleEl) titleEl.value = '';
    if (descEl) descEl.value = '';
    if (authorEl) authorEl.value = '';
    if (genreEl) genreEl.value = '';
    if (yearEl) yearEl.value = '';
    if (statusEl) statusEl.value = '';
    if (coverEl) coverEl.value = '';

    // Clear genre checkboxes
    document.querySelectorAll('.genre-checkbox').forEach(cb => cb.checked = false);

    // Hide preview
    const preview = document.getElementById('preview');
    const uploadText = document.getElementById('uploadText');
    if (preview) {
      preview.classList.add('hidden');
      preview.src = '';
    }
    if (uploadText) uploadText.classList.remove('hidden');

    // Reload novels list
    if (typeof loadNovels === 'function') {
      loadNovels();
    } else {
      location.reload();
    }
  } catch (err) {
    console.error('addNovel error:', err);
    alert('Gagal menambahkan novel: ' + (err?.message || JSON.stringify(err)));
  }
}