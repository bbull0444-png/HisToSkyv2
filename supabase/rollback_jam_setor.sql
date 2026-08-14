-- CADANGAN submitted_at test_attempts, diambil dari Supabase 2026-08-14.
-- Jalankan file ini untuk mengembalikan seluruh jam setor ke nilai aslinya.
-- Mencakup ke-114 baris (pretest, posttest siklus 1, posttest siklus 2).
-- Baris posttest_siklus_3 tidak ada di sini; hapus dengan
--   DELETE FROM test_attempts WHERE test_type = 'posttest_siklus_3';

BEGIN;

-- pretest (38 baris)
UPDATE test_attempts SET submitted_at = '2026-08-03T05:30:44.644Z' WHERE id = 31;  -- student 16
UPDATE test_attempts SET submitted_at = '2026-08-03T05:30:47.000Z' WHERE id = 225;  -- student 45
UPDATE test_attempts SET submitted_at = '2026-08-03T05:31:44.125Z' WHERE id = 47;  -- student 32
UPDATE test_attempts SET submitted_at = '2026-08-03T05:32:16.781Z' WHERE id = 39;  -- student 24
UPDATE test_attempts SET submitted_at = '2026-08-03T05:32:40.906Z' WHERE id = 37;  -- student 22
UPDATE test_attempts SET submitted_at = '2026-08-03T05:33:01.214Z' WHERE id = 24;  -- student 9
UPDATE test_attempts SET submitted_at = '2026-08-03T05:33:03.423Z' WHERE id = 29;  -- student 14
UPDATE test_attempts SET submitted_at = '2026-08-03T05:33:35.024Z' WHERE id = 36;  -- student 21
UPDATE test_attempts SET submitted_at = '2026-08-03T05:34:17.783Z' WHERE id = 49;  -- student 34
UPDATE test_attempts SET submitted_at = '2026-08-03T05:34:20.834Z' WHERE id = 21;  -- student 6
UPDATE test_attempts SET submitted_at = '2026-08-03T05:34:42.000Z' WHERE id = 228;  -- student 46
UPDATE test_attempts SET submitted_at = '2026-08-03T05:35:16.326Z' WHERE id = 26;  -- student 11
UPDATE test_attempts SET submitted_at = '2026-08-03T05:35:19.933Z' WHERE id = 40;  -- student 25
UPDATE test_attempts SET submitted_at = '2026-08-03T05:36:13.295Z' WHERE id = 43;  -- student 28
UPDATE test_attempts SET submitted_at = '2026-08-03T05:36:21.452Z' WHERE id = 33;  -- student 18
UPDATE test_attempts SET submitted_at = '2026-08-03T05:36:37.452Z' WHERE id = 35;  -- student 20
UPDATE test_attempts SET submitted_at = '2026-08-03T05:37:11.533Z' WHERE id = 20;  -- student 5
UPDATE test_attempts SET submitted_at = '2026-08-03T05:37:24.313Z' WHERE id = 34;  -- student 19
UPDATE test_attempts SET submitted_at = '2026-08-03T05:37:50.000Z' WHERE id = 231;  -- student 47
UPDATE test_attempts SET submitted_at = '2026-08-03T05:38:37.000Z' WHERE id = 234;  -- student 48
UPDATE test_attempts SET submitted_at = '2026-08-03T05:39:41.162Z' WHERE id = 50;  -- student 35
UPDATE test_attempts SET submitted_at = '2026-08-03T05:39:44.650Z' WHERE id = 27;  -- student 12
UPDATE test_attempts SET submitted_at = '2026-08-03T05:40:03.037Z' WHERE id = 17;  -- student 2
UPDATE test_attempts SET submitted_at = '2026-08-03T05:40:11.000Z' WHERE id = 237;  -- student 49
UPDATE test_attempts SET submitted_at = '2026-08-03T05:40:49.471Z' WHERE id = 46;  -- student 31
UPDATE test_attempts SET submitted_at = '2026-08-03T05:41:04.617Z' WHERE id = 18;  -- student 3
UPDATE test_attempts SET submitted_at = '2026-08-03T05:42:32.000Z' WHERE id = 240;  -- student 50
UPDATE test_attempts SET submitted_at = '2026-08-03T05:43:19.000Z' WHERE id = 243;  -- student 51
UPDATE test_attempts SET submitted_at = '2026-08-03T05:43:49.201Z' WHERE id = 56;  -- student 41
UPDATE test_attempts SET submitted_at = '2026-08-03T05:44:16.186Z' WHERE id = 51;  -- student 36
UPDATE test_attempts SET submitted_at = '2026-08-03T05:48:01.000Z' WHERE id = 246;  -- student 52
UPDATE test_attempts SET submitted_at = '2026-08-03T05:49:35.000Z' WHERE id = 249;  -- student 53
UPDATE test_attempts SET submitted_at = '2026-08-03T05:52:43.000Z' WHERE id = 252;  -- student 54
UPDATE test_attempts SET submitted_at = '2026-08-03T05:55:04.000Z' WHERE id = 255;  -- student 55
UPDATE test_attempts SET submitted_at = '2026-08-03T05:55:51.000Z' WHERE id = 258;  -- student 56
UPDATE test_attempts SET submitted_at = '2026-08-03T05:57:25.000Z' WHERE id = 261;  -- student 57
UPDATE test_attempts SET submitted_at = '2026-08-03T05:58:12.000Z' WHERE id = 264;  -- student 58
UPDATE test_attempts SET submitted_at = '2026-08-03T05:59:46.000Z' WHERE id = 267;  -- student 59

-- posttest_siklus_1 (38 baris)
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:04.664Z' WHERE id = 89;  -- student 28
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:13.740Z' WHERE id = 75;  -- student 14
UPDATE test_attempts SET submitted_at = '2026-08-03T07:50:53.000Z' WHERE id = 226;  -- student 45
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:05.751Z' WHERE id = 64;  -- student 3
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:09.877Z' WHERE id = 92;  -- student 31
UPDATE test_attempts SET submitted_at = '2026-08-03T07:51:59.054Z' WHERE id = 66;  -- student 5
UPDATE test_attempts SET submitted_at = '2026-08-03T07:53:18.220Z' WHERE id = 80;  -- student 19
UPDATE test_attempts SET submitted_at = '2026-08-03T07:54:13.702Z' WHERE id = 63;  -- student 2
UPDATE test_attempts SET submitted_at = '2026-08-03T07:54:15.049Z' WHERE id = 67;  -- student 6
UPDATE test_attempts SET submitted_at = '2026-08-03T07:54:22.281Z' WHERE id = 97;  -- student 36
UPDATE test_attempts SET submitted_at = '2026-08-03T07:54:30.089Z' WHERE id = 95;  -- student 34
UPDATE test_attempts SET submitted_at = '2026-08-03T07:55:10.846Z' WHERE id = 93;  -- student 32
UPDATE test_attempts SET submitted_at = '2026-08-03T07:55:18.000Z' WHERE id = 229;  -- student 46
UPDATE test_attempts SET submitted_at = '2026-08-03T07:55:26.400Z' WHERE id = 72;  -- student 11
UPDATE test_attempts SET submitted_at = '2026-08-03T07:56:03.135Z' WHERE id = 81;  -- student 20
UPDATE test_attempts SET submitted_at = '2026-08-03T07:56:05.919Z' WHERE id = 79;  -- student 18
UPDATE test_attempts SET submitted_at = '2026-08-03T07:56:36.320Z' WHERE id = 96;  -- student 35
UPDATE test_attempts SET submitted_at = '2026-08-03T07:57:57.234Z' WHERE id = 86;  -- student 25
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:06.345Z' WHERE id = 73;  -- student 12
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:20.371Z' WHERE id = 70;  -- student 9
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:27.473Z' WHERE id = 77;  -- student 16
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:50.000Z' WHERE id = 232;  -- student 47
UPDATE test_attempts SET submitted_at = '2026-08-03T07:58:56.282Z' WHERE id = 83;  -- student 22
UPDATE test_attempts SET submitted_at = '2026-08-03T07:59:43.000Z' WHERE id = 235;  -- student 48
UPDATE test_attempts SET submitted_at = '2026-08-03T08:00:02.992Z' WHERE id = 85;  -- student 24
UPDATE test_attempts SET submitted_at = '2026-08-03T08:00:32.788Z' WHERE id = 103;  -- student 41
UPDATE test_attempts SET submitted_at = '2026-08-03T08:00:48.852Z' WHERE id = 82;  -- student 21
UPDATE test_attempts SET submitted_at = '2026-08-03T08:01:29.000Z' WHERE id = 238;  -- student 49
UPDATE test_attempts SET submitted_at = '2026-08-03T08:04:08.000Z' WHERE id = 241;  -- student 50
UPDATE test_attempts SET submitted_at = '2026-08-03T08:05:01.000Z' WHERE id = 244;  -- student 51
UPDATE test_attempts SET submitted_at = '2026-08-03T08:10:19.000Z' WHERE id = 247;  -- student 52
UPDATE test_attempts SET submitted_at = '2026-08-03T08:12:05.000Z' WHERE id = 250;  -- student 53
UPDATE test_attempts SET submitted_at = '2026-08-03T08:15:37.000Z' WHERE id = 253;  -- student 54
UPDATE test_attempts SET submitted_at = '2026-08-03T08:18:16.000Z' WHERE id = 256;  -- student 55
UPDATE test_attempts SET submitted_at = '2026-08-03T08:19:09.000Z' WHERE id = 259;  -- student 56
UPDATE test_attempts SET submitted_at = '2026-08-03T08:20:55.000Z' WHERE id = 262;  -- student 57
UPDATE test_attempts SET submitted_at = '2026-08-03T08:21:48.000Z' WHERE id = 265;  -- student 58
UPDATE test_attempts SET submitted_at = '2026-08-03T08:23:34.000Z' WHERE id = 268;  -- student 59

-- posttest_siklus_2 (38 baris)
UPDATE test_attempts SET submitted_at = '2026-08-10T07:52:41.000Z' WHERE id = 227;  -- student 45
UPDATE test_attempts SET submitted_at = '2026-08-10T07:56:06.000Z' WHERE id = 230;  -- student 46
UPDATE test_attempts SET submitted_at = '2026-08-10T07:58:50.000Z' WHERE id = 233;  -- student 47
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:02.833Z' WHERE id = 214;  -- student 22
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:04.059Z' WHERE id = 217;  -- student 3
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:09.881Z' WHERE id = 197;  -- student 14
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:11.004Z' WHERE id = 223;  -- student 11
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:12.865Z' WHERE id = 213;  -- student 31
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:24.808Z' WHERE id = 198;  -- student 12
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:25.932Z' WHERE id = 184;  -- student 20
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:27.213Z' WHERE id = 199;  -- student 36
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:28.607Z' WHERE id = 185;  -- student 16
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:31.000Z' WHERE id = 236;  -- student 48
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:34.482Z' WHERE id = 203;  -- student 21
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:37.748Z' WHERE id = 208;  -- student 24
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:42.497Z' WHERE id = 222;  -- student 34
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:48.923Z' WHERE id = 219;  -- student 25
UPDATE test_attempts SET submitted_at = '2026-08-10T07:59:53.667Z' WHERE id = 210;  -- student 2
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:01.754Z' WHERE id = 220;  -- student 41
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:08.896Z' WHERE id = 187;  -- student 18
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:20.829Z' WHERE id = 205;  -- student 9
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:22.817Z' WHERE id = 221;  -- student 19
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:23.755Z' WHERE id = 202;  -- student 28
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:28.017Z' WHERE id = 196;  -- student 5
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:52.087Z' WHERE id = 207;  -- student 35
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:53.000Z' WHERE id = 239;  -- student 49
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:57.963Z' WHERE id = 190;  -- student 32
UPDATE test_attempts SET submitted_at = '2026-08-10T08:00:59.150Z' WHERE id = 195;  -- student 6
UPDATE test_attempts SET submitted_at = '2026-08-10T08:02:56.000Z' WHERE id = 242;  -- student 50
UPDATE test_attempts SET submitted_at = '2026-08-10T08:03:37.000Z' WHERE id = 245;  -- student 51
UPDATE test_attempts SET submitted_at = '2026-08-10T08:07:43.000Z' WHERE id = 248;  -- student 52
UPDATE test_attempts SET submitted_at = '2026-08-10T08:09:05.000Z' WHERE id = 251;  -- student 53
UPDATE test_attempts SET submitted_at = '2026-08-10T08:11:49.000Z' WHERE id = 254;  -- student 54
UPDATE test_attempts SET submitted_at = '2026-08-10T08:13:52.000Z' WHERE id = 257;  -- student 55
UPDATE test_attempts SET submitted_at = '2026-08-10T08:14:33.000Z' WHERE id = 260;  -- student 56
UPDATE test_attempts SET submitted_at = '2026-08-10T08:15:55.000Z' WHERE id = 263;  -- student 57
UPDATE test_attempts SET submitted_at = '2026-08-10T08:16:36.000Z' WHERE id = 266;  -- student 58
UPDATE test_attempts SET submitted_at = '2026-08-10T08:17:58.000Z' WHERE id = 269;  -- student 59

COMMIT;
