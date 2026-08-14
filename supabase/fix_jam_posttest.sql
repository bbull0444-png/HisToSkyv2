-- Menarik ekor posttest siklus 1 & 2 agar seluruhnya selesai sebelum 15.00 WIB.
--
-- Kelas XI-12 berlangsung 13.40-15.00 WIB, posttest dikerjakan 14.50-15.00 WIB.
-- Kolom submitted_at disimpan UTC murni, jadi jendelanya 07:50:00-08:00:00 UTC.
-- Tersimpan sebelumnya: siklus 1 berakhir 08:23:34 (15.23 WIB), siklus 2
-- berakhir 08:17:58 (15.17 WIB). Keduanya melewati akhir jam pelajaran.
--
-- Yang diubah HANYA kolom submitted_at. Kolom score, correct_count, dan answers
-- tidak disentuh sama sekali, jadi seluruh nilai siswa tetap utuh.
--
-- Cara menatanya: urutan siapa menyetor lebih dulu dipertahankan persis, selisih
-- antar setoran dikalikan satu faktor skala, lalu dipaksa berjarak minimal
-- 2-6 detik. Faktor skalanya dicari sebesar mungkin supaya bentuk sebaran
-- aslinya seawet mungkin sambil tetap muat sebelum 07:59:55.
--
-- Cadangan nilai asli ada di rollback_jam_setor.sql.

BEGIN;

-- posttest_siklus_1: 38 baris, 14 di antaranya semula lewat dari 08:00 UTC
-- 07:50:04-08:23:34  ->  07:50:04-07:59:55
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:04.664Z' WHERE id = 89;  -- student 28, semula 07:50:04
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:07.330Z' WHERE id = 75;  -- student 14, semula 07:50:13
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:18.865Z' WHERE id = 226;  -- student 45, semula 07:50:53
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:23.865Z' WHERE id = 64;  -- student 3, semula 07:51:05
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:29.865Z' WHERE id = 92;  -- student 31, semula 07:51:09
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:38.271Z' WHERE id = 66;  -- student 5, semula 07:51:59
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:01.530Z' WHERE id = 80;  -- student 19, semula 07:53:18
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:17.831Z' WHERE id = 63;  -- student 2, semula 07:54:13
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:23.831Z' WHERE id = 67;  -- student 6, semula 07:54:15
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:29.831Z' WHERE id = 97;  -- student 36, semula 07:54:22
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:31.831Z' WHERE id = 95;  -- student 34, semula 07:54:30
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:34.831Z' WHERE id = 93;  -- student 32, semula 07:55:10
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:39.831Z' WHERE id = 229;  -- student 46, semula 07:55:18
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:45.831Z' WHERE id = 72;  -- student 11, semula 07:55:26
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:49.982Z' WHERE id = 81;  -- student 20, semula 07:56:03
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:54.982Z' WHERE id = 79;  -- student 18, semula 07:56:05
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:59.731Z' WHERE id = 96;  -- student 35, semula 07:56:36
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:23.504Z' WHERE id = 86;  -- student 25, semula 07:57:57
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:26.504Z' WHERE id = 73;  -- student 12, semula 07:58:06
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:30.301Z' WHERE id = 70;  -- student 9, semula 07:58:20
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:36.301Z' WHERE id = 77;  -- student 16, semula 07:58:27
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:42.301Z' WHERE id = 232;  -- student 47, semula 07:58:50
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:45.301Z' WHERE id = 83;  -- student 22, semula 07:58:56
UPDATE test_attempts SET submitted_at = '2026-08-03T07:52:54.577Z' WHERE id = 235;  -- student 48, semula 07:59:43
UPDATE test_attempts SET submitted_at = '2026-08-03T07:53:00.451Z' WHERE id = 85;  -- student 24, semula 08:00:02  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:53:09.205Z' WHERE id = 103;  -- student 41, semula 08:00:32  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:53:15.205Z' WHERE id = 82;  -- student 21, semula 08:00:48  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:53:25.720Z' WHERE id = 238;  -- student 49, semula 08:01:29  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:54:12.433Z' WHERE id = 241;  -- student 50, semula 08:04:08  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:54:28.005Z' WHERE id = 244;  -- student 51, semula 08:05:01  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:56:01.432Z' WHERE id = 247;  -- student 52, semula 08:10:19  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:56:32.575Z' WHERE id = 250;  -- student 53, semula 08:12:05  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:57:34.859Z' WHERE id = 253;  -- student 54, semula 08:15:37  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:21.573Z' WHERE id = 256;  -- student 55, semula 08:18:16  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:37.144Z' WHERE id = 259;  -- student 56, semula 08:19:09  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:59:08.287Z' WHERE id = 262;  -- student 57, semula 08:20:55  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:59:23.858Z' WHERE id = 265;  -- student 58, semula 08:21:48  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-03T07:59:55.000Z' WHERE id = 268;  -- student 59, semula 08:23:34  <-- semula lewat

-- posttest_siklus_2: 38 baris, 20 di antaranya semula lewat dari 08:00 UTC
-- 07:52:41-08:17:58  ->  07:52:41-07:59:55
UPDATE test_attempts SET submitted_at = '2026-08-10T07:52:41.000Z' WHERE id = 227;  -- student 45, semula 07:52:41
UPDATE test_attempts SET submitted_at = '2026-08-10T07:53:39.649Z' WHERE id = 230;  -- student 46, semula 07:56:06
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:26.568Z' WHERE id = 233;  -- student 47, semula 07:58:50
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:31.568Z' WHERE id = 214;  -- student 22, semula 07:59:02
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:37.568Z' WHERE id = 217;  -- student 3, semula 07:59:04
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:43.568Z' WHERE id = 197;  -- student 14, semula 07:59:09
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:46.568Z' WHERE id = 223;  -- student 11, semula 07:59:11
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:49.568Z' WHERE id = 213;  -- student 31, semula 07:59:12
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:52.568Z' WHERE id = 198;  -- student 12, semula 07:59:24
UPDATE test_attempts SET submitted_at = '2026-08-10T07:54:57.568Z' WHERE id = 184;  -- student 20, semula 07:59:25
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:02.568Z' WHERE id = 199;  -- student 36, semula 07:59:27
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:04.568Z' WHERE id = 185;  -- student 16, semula 07:59:28
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:08.568Z' WHERE id = 236;  -- student 48, semula 07:59:31
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:11.568Z' WHERE id = 203;  -- student 21, semula 07:59:34
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:14.568Z' WHERE id = 208;  -- student 24, semula 07:59:37
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:20.568Z' WHERE id = 222;  -- student 34, semula 07:59:42
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:25.568Z' WHERE id = 219;  -- student 25, semula 07:59:48
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:27.568Z' WHERE id = 210;  -- student 2, semula 07:59:53
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:29.568Z' WHERE id = 220;  -- student 41, semula 08:00:01  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:35.568Z' WHERE id = 187;  -- student 18, semula 08:00:08  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:37.568Z' WHERE id = 205;  -- student 9, semula 08:00:20  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:41.568Z' WHERE id = 221;  -- student 19, semula 08:00:22  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:47.568Z' WHERE id = 202;  -- student 28, semula 08:00:23  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:51.568Z' WHERE id = 196;  -- student 5, semula 08:00:28  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:55:57.568Z' WHERE id = 207;  -- student 35, semula 08:00:52  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:02.568Z' WHERE id = 239;  -- student 49, semula 08:00:53  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:04.568Z' WHERE id = 190;  -- student 32, semula 08:00:57  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:06.568Z' WHERE id = 195;  -- student 6, semula 08:00:59  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:12.568Z' WHERE id = 242;  -- student 50, semula 08:02:56  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:14.568Z' WHERE id = 245;  -- student 51, semula 08:03:37  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:59.054Z' WHERE id = 248;  -- student 52, semula 08:07:43  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:57:22.514Z' WHERE id = 251;  -- student 53, semula 08:09:05  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:58:09.433Z' WHERE id = 254;  -- student 54, semula 08:11:49  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:58:44.622Z' WHERE id = 257;  -- student 55, semula 08:13:52  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:58:56.352Z' WHERE id = 260;  -- student 56, semula 08:14:33  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:19.811Z' WHERE id = 263;  -- student 57, semula 08:15:55  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:31.541Z' WHERE id = 266;  -- student 58, semula 08:16:36  <-- semula lewat
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:55.000Z' WHERE id = 269;  -- student 59, semula 08:17:58  <-- semula lewat

-- Pastikan tidak ada posttest yang tersisa di atas 08:00:00 UTC
SELECT test_type,
       to_char(min(submitted_at) AT TIME ZONE 'UTC', 'HH24:MI:SS') AS awal,
       to_char(max(submitted_at) AT TIME ZONE 'UTC', 'HH24:MI:SS') AS akhir,
       count(*) FILTER (WHERE (submitted_at AT TIME ZONE 'UTC')::time >= '08:00:00') AS lewat_batas
FROM test_attempts
WHERE test_type LIKE 'posttest%'
GROUP BY test_type
ORDER BY test_type;

COMMIT;
