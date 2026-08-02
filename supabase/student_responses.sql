-- Sintaks 5 "Menulis Tanggapan": menyimpan tanggapan tertulis siswa.
-- Satu siswa hanya punya SATU tanggapan per pertemuan (upsert pakai
-- unique constraint (student_id, meeting_id), pola sama seperti tabel
-- `reflections`).

create table if not exists public.student_responses (
  id          bigint generated always as identity primary key,
  meeting_id  bigint not null references public.meetings(id) on delete cascade,
  student_id  bigint not null references public.students(id) on delete cascade,
  group_id    bigint          references public.groups(id) on delete set null,
  response    text    not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (student_id, meeting_id)
);

create index if not exists student_responses_meeting_id_idx on public.student_responses (meeting_id);
create index if not exists student_responses_group_id_idx  on public.student_responses (group_id);

-- RLS: baseline yang kompatibel dengan arsitektur auth saat ini.
-- Guru memakai Supabase Auth, tetapi siswa login via RPC
-- `verify_student_login` (identitas hanya di localStorage, tanpa sesi
-- Supabase Auth). Semua query client memakai anon key, jadi otorisasi
-- di-enforce di client-side (sama seperti tabel lain di proyek ini).
-- JANGAN ganti pola ini sampai siswa dimigrasi ke Supabase Auth.
alter table public.student_responses enable row level security;

create policy "student_responses_all"
  on public.student_responses
  for all
  using (true)
  with check (true);
