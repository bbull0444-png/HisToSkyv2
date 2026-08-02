-- Sintaks 6 "Presentasi Hasil Kelompok" + diferensiasi produk:
-- - Satu kelompok mengunggah SATU produk aktif (PDF/PPT/PNG/JPG) per pertemuan,
--   diunggah/diganti hanya oleh ketua kelompok (leader_student_id di tabel
--   `groups`). Penegakan "hanya ketua" dilakukan di client, sama seperti
--   pola otorisasi tabel lain di proyek ini (lihat student_responses.sql).
-- - Setiap siswa bisa kirim satu pertanyaan dan satu apresiasi ditujukan ke
--   satu kelompok tertentu. Constraint unique disengaja per
--   (student_id, meeting_id, target_group_id) -- bukan per (student_id,
--   meeting_id) saja -- supaya skema lebih fleksibel untuk kebutuhan
--   mendatang, meski UI saat ini hanya pernah membuat satu baris per siswa
--   per pertemuan (target kelompok dikunci begitu terkirim).
-- - Guru bisa "mengunci" sesi presentasi per pertemuan (meetings.presentation_locked).
--   Selama belum dikunci, siswa boleh edit/hapus pertanyaan & apresiasi
--   miliknya sendiri. Setelah dikunci, seluruhnya jadi read-only di UI.

alter table public.meetings
  add column if not exists presentation_locked boolean not null default false;

create table if not exists public.group_products (
  id                      bigint generated always as identity primary key,
  meeting_id              bigint not null references public.meetings(id) on delete cascade,
  group_id                bigint not null references public.groups(id) on delete cascade,
  uploaded_by_student_id  bigint references public.students(id) on delete set null,
  file_url                text not null,
  storage_path            text not null,
  file_name               text not null,
  file_type               text not null, -- 'pdf' | 'png' | 'jpg' | 'ppt'
  file_size_bytes         bigint not null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (group_id, meeting_id)
);

create index if not exists group_products_meeting_id_idx on public.group_products (meeting_id);

create table if not exists public.presentation_questions (
  id                bigint generated always as identity primary key,
  meeting_id        bigint not null references public.meetings(id) on delete cascade,
  student_id        bigint not null references public.students(id) on delete cascade,
  target_group_id   bigint not null references public.groups(id) on delete cascade,
  question          text not null,
  is_selected       boolean not null default false,
  selected_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (student_id, meeting_id, target_group_id)
);

create index if not exists presentation_questions_meeting_id_idx on public.presentation_questions (meeting_id);
create index if not exists presentation_questions_target_group_id_idx on public.presentation_questions (target_group_id);

create table if not exists public.presentation_appreciations (
  id                bigint generated always as identity primary key,
  meeting_id        bigint not null references public.meetings(id) on delete cascade,
  student_id        bigint not null references public.students(id) on delete cascade,
  target_group_id   bigint not null references public.groups(id) on delete cascade,
  message           text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (student_id, meeting_id, target_group_id)
);

create index if not exists presentation_appreciations_meeting_id_idx on public.presentation_appreciations (meeting_id);
create index if not exists presentation_appreciations_target_group_id_idx on public.presentation_appreciations (target_group_id);

-- RLS: pola sama persis dengan student_responses (baseline kompatibel
-- dengan arsitektur auth saat ini -- siswa login via RPC, bukan Supabase
-- Auth, jadi otorisasi kepemilikan tetap ditegakkan di client).
alter table public.group_products enable row level security;
create policy "group_products_all"
  on public.group_products
  for all
  using (true)
  with check (true);

alter table public.presentation_questions enable row level security;
create policy "presentation_questions_all"
  on public.presentation_questions
  for all
  using (true)
  with check (true);

alter table public.presentation_appreciations enable row level security;
create policy "presentation_appreciations_all"
  on public.presentation_appreciations
  for all
  using (true)
  with check (true);

-- Storage: bucket public untuk produk kelompok, sama pola dengan
-- bucket "materi-images" yang sudah ada (anon boleh baca & tulis).
insert into storage.buckets (id, name, public)
values ('presentasi-produk', 'presentasi-produk', true)
on conflict (id) do nothing;

create policy "presentasi_produk_read"
  on storage.objects for select
  using (bucket_id = 'presentasi-produk');

create policy "presentasi_produk_write"
  on storage.objects for insert
  with check (bucket_id = 'presentasi-produk');

create policy "presentasi_produk_update"
  on storage.objects for update
  using (bucket_id = 'presentasi-produk');

create policy "presentasi_produk_delete"
  on storage.objects for delete
  using (bucket_id = 'presentasi-produk');
