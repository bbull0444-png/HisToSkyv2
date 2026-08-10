-- ============================================================================
-- ISI NILAI PRETEST (sudah terisi data asli) + POSTTEST SIKLUS 1 (ganti 0).
-- Cara B: `answers` diisi objek kosong '{}', `submitted_at` otomatis now().
-- Copy seluruh isi file ini ke Supabase > SQL Editor, lalu jalankan.
-- ============================================================================

begin;

-- Bersihkan dulu data lama supaya tidak dobel (aman dijalankan ulang).
delete from public.test_attempts
  where test_type in ('pretest', 'posttest_siklus_1');

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
    -- ============ PRETEST (data asli) ============
    ('alif01',   'pretest', 58.33),
    ('alya02',   'pretest', 50.00),
    ('andre03',  'pretest', 66.67),
    ('anindya04','pretest', 41.67),
    ('anisa05',  'pretest', 58.33),
    ('arman06',  'pretest', 75.00),
    ('bagas07',  'pretest', 50.00),
    ('bilqis08', 'pretest', 66.67),
    ('dalfa09',  'pretest', 58.33),
    ('dea10',    'pretest', 41.67),
    ('devina11', 'pretest', 66.67),
    ('dhiny12',  'pretest', 83.33),
    ('fairus13', 'pretest', 58.33),
    ('fajar14',  'pretest', 50.00),
    ('fardhan15','pretest', 66.67),
    ('hilmy16',  'pretest', 58.33),
    ('indriani17','pretest', 75.00),
    ('iqlima18', 'pretest', 50.00),
    ('mochalif19','pretest', 66.67),
    ('rama20',   'pretest', 58.33),
    ('reza21',   'pretest', 41.67),
    ('farid22',  'pretest', 66.67),
    ('naufal23', 'pretest', 58.33),
    ('raihan24', 'pretest', 50.00),
    ('muna25',   'pretest', 66.67),
    ('najla26',  'pretest', 75.00),
    ('nazwa27',  'pretest', 58.33),
    ('nia28',    'pretest', 66.67),
    ('nuraini29','pretest', 50.00),
    ('pasha30',  'pretest', 58.33),
    ('rani31',   'pretest', 66.67),
    ('rania32',  'pretest', 41.67),
    ('reza33',   'pretest', 75.00),
    ('ridwan34', 'pretest', 58.33),
    ('rifki35',  'pretest', 66.67),
    ('salwa36',  'pretest', 50.00),
    ('sari37',   'pretest', 83.33),
    ('silvi38',  'pretest', 58.33),
    ('siti39',   'pretest', 66.67),
    ('tsania40', 'pretest', 50.00),
    ('yusup41',  'pretest', 83.33),

    -- ============ POSTTEST SIKLUS 1 (GANTI angka 0 dengan nilai asli) ============
    ('alif01',   'posttest_siklus_1', 0),
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