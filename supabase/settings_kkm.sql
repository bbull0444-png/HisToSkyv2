-- KKM Sejarah (SMAN 1 Ciawi) untuk perhitungan ketuntasan di Laporan Penelitian.
-- Nilai disimpan di tabel `settings` (baris id=1) supaya bisa diubah guru lewat
-- halaman Pengaturan, bukan hardcode di kode. Default: 75.
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor.

alter table public.settings
  add column if not exists kkm integer not null default 75;
