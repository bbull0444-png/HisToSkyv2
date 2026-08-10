-- ============================================================================
-- ISI NILAI POSTTEST SIKLUS 1 SECARA MASSAL
--
-- Username 41 siswa sudah terdaftar di blok `values` berikut. Yang perlu kamu
-- lakukan: GANTI angka `0` di tiap baris dengan NILAI ASLI posttest siklus 1
-- dari lapangan. Jangan dijalankan sebelum semua angka diganti.
--
-- Buka Supabase Dashboard > SQL Editor > tempel > jalankan.
-- ============================================================================

begin;

-- Self-heal: pastikan kolom `answers` tidak pernah kosong walau query lama
-- yang tidak menyebut `answers` dijalankan. Aman dijalankan berulang-ulang.
alter table public.test_attempts
  alter column answers set default '{}'::jsonb;

delete from public.test_attempts where test_type = 'posttest_siklus_1';

insert into public.test_attempts (student_id, test_type, score, total_questions, correct_count, answers, submitted_at)
select
  s.id as student_id,
  v.test_type,
  round(v.score)::integer as score,
  coalesce(ts.total_questions, 0) as total_questions,
  round(round(v.score) * coalesce(ts.total_questions, 0) / 100.0)::integer as correct_count,
  '{}'::jsonb as answers,
  now() as submitted_at
from (
  values
    ('alif01',   'posttest_siklus_1', 0),  -- ← ganti 0 dengan nilai asli
    ('alya02',   'posttest_siklus_1', 0),
    ('andre03',  'posttest_siklus_1', 0),
    ('anindya04','posttest_siklus_1', 0),
    ('anisa05',  'posttest_siklus_1', 0),
    ('arman06',  'posttest_siklus_1', 0),
    ('bagas07',  'posttest_siklus_1', 0),
    ('bilqis08', 'posttest_siklus_1', 0),
    ('dalfa09',  'posttest_siklus_1', 0),
    ('dea10',    'posttest_siklus_1', 0),
    ('devina11', 'posttest_siklus_1', 0),
    ('dhiny12',  'posttest_siklus_1', 0),
    ('fairus13', 'posttest_siklus_1', 0),
    ('fajar14',  'posttest_siklus_1', 0),
    ('fardhan15','posttest_siklus_1', 0),
    ('hilmy16',  'posttest_siklus_1', 0),
    ('indriani17','posttest_siklus_1', 0),
    ('iqlima18', 'posttest_siklus_1', 0),
    ('mochalif19','posttest_siklus_1', 0),
    ('rama20',   'posttest_siklus_1', 0),
    ('reza21',   'posttest_siklus_1', 0),
    ('farid22',  'posttest_siklus_1', 0),
    ('naufal23', 'posttest_siklus_1', 0),
    ('raihan24', 'posttest_siklus_1', 0),
    ('muna25',   'posttest_siklus_1', 0),
    ('najla26',  'posttest_siklus_1', 0),
    ('nazwa27',  'posttest_siklus_1', 0),
    ('nia28',    'posttest_siklus_1', 0),
    ('nuraini29','posttest_siklus_1', 0),
    ('pasha30',  'posttest_siklus_1', 0),
    ('rani31',   'posttest_siklus_1', 0),
    ('rania32',  'posttest_siklus_1', 0),
    ('reza33',   'posttest_siklus_1', 0),
    ('ridwan34', 'posttest_siklus_1', 0),
    ('rifki35',  'posttest_siklus_1', 0),
    ('salwa36',  'posttest_siklus_1', 0),
    ('sari37',   'posttest_siklus_1', 0),
    ('silvi38',  'posttest_siklus_1', 0),
    ('siti39',   'posttest_siklus_1', 0),
    ('tsania40', 'posttest_siklus_1', 0),
    ('yusup41',  'posttest_siklus_1', 0)
) as v(username, test_type, score)
join public.students s on s.username = v.username
join (
  select test_type, count(*) as total_questions
  from public.test_questions
  group by test_type
) ts on ts.test_type = v.test_type
order by s.id;

commit;