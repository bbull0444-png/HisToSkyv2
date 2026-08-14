-- Data Pertemuan 3 HisToSky (meeting_id = 3)
-- SAUDAGAR & PENGUASA LOKAL NUSANTARA + PERSAINGAN VOC-PORTUGIS-SPANYOL-INGGRIS
--
-- Jam pelajaran 13.40-15.00 WIB = 06:40-08:00 UTC. Seluruh waktu di bawah UTC:
--   produk kelompok  06:43-07:01  (13.43-14.01 WIB)
--   tanggapan        07:05-07:18  (14.05-14.18 WIB)
--   pertanyaan       07:22-07:29  (14.22-14.29 WIB)
--   apresiasi        07:29-07:36  (14.29-14.36 WIB)
--   refleksi         07:30-07:44  (14.30-14.44 WIB)
--   posttest         07:52-07:59  (14.52-14.59 WIB, sudah dimasukkan terpisah)
--   penghargaan      11:06        (18.06 WIB, guru menilai setelah pelajaran)
--
-- Poin 4 (produk) sengaja TIDAK dimasukkan ke tanggapan tertulis, sesuai
-- permintaan guru. Produk fisiknya ada di tabel group_products.

BEGIN;

DELETE FROM group_products           WHERE meeting_id = 3;
DELETE FROM student_responses        WHERE meeting_id = 3;
DELETE FROM presentation_questions   WHERE meeting_id = 3;
DELETE FROM presentation_appreciations WHERE meeting_id = 3;
DELETE FROM group_awards             WHERE meeting_id = 3;
DELETE FROM reflections              WHERE meeting_id = 3;

-- Produk kelompok (8 berkas sudah diunggah ke bucket presentasi-produk)
INSERT INTO group_products (meeting_id, group_id, uploaded_by_student_id, file_url, storage_path, file_name, file_type, file_size_bytes, created_at, updated_at) VALUES
  (3, 1, 5, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/1/073b9cdf-1f31-4fcd-81f3-4a8b19c0147e.png', '3/1/073b9cdf-1f31-4fcd-81f3-4a8b19c0147e.png', '221b33ab-7bd7-480f-88ac-bcec388adb1b.png', 'png', 3206804, '2026-08-14T06:52:14Z', '2026-08-14T06:52:14Z'),  -- kelompok1(infografis).png
  (3, 2, 14, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/2/299b5453-684f-46dd-a1cb-d9ad8d8f1db3.png', '3/2/299b5453-684f-46dd-a1cb-d9ad8d8f1db3.png', '9b8c292e-c243-469f-bd78-c813033278f2.png', 'png', 3037639, '2026-08-14T06:47:39Z', '2026-08-14T06:47:39Z'),  -- kelompok2(mindmap).png
  (3, 3, 28, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/3/38b0338e-3d17-4908-b11e-2a5ec1e52a35.png', '3/3/38b0338e-3d17-4908-b11e-2a5ec1e52a35.png', '675931f5-a36f-4ba6-b819-3760d2f234b1.png', 'png', 3206668, '2026-08-14T06:58:02Z', '2026-08-14T06:58:02Z'),  -- kelompok3(komik).png
  (3, 4, 2, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/4/b001b0c6-65aa-4d58-9384-1b6e83701bd5.png', '3/4/b001b0c6-65aa-4d58-9384-1b6e83701bd5.png', 'f68667de-7d24-4a8e-9d5e-4324d69f55b7.png', 'png', 3060869, '2026-08-14T06:45:51Z', '2026-08-14T06:45:51Z'),  -- kelompok4(psoter).png
  (3, 5, 19, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/5/350b61af-e45d-4c74-b1bd-b9f96768b2e3.jpg', '3/5/350b61af-e45d-4c74-b1bd-b9f96768b2e3.jpg', '6ee7bda9-7420-43b3-a27d-1e5a0865111d.jpg', 'jpg', 218666, '2026-08-14T06:44:27Z', '2026-08-14T06:44:27Z'),  -- kelompok5(peta konsep).jpg
  (3, 6, 16, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/6/fd0f7fd3-4848-4fa6-acd1-8a53b8fa34d4.jpg', '3/6/fd0f7fd3-4848-4fa6-acd1-8a53b8fa34d4.jpg', 'cf441371-fcaa-4d57-969d-815546e06149.jpg', 'jpg', 261570, '2026-08-14T06:49:33Z', '2026-08-14T06:49:33Z'),  -- kelompok6(suratkabar).jpg
  (3, 7, 31, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/7/fc16c632-e0b0-409e-a17b-9cfdc2ad44b0.jpg', '3/7/fc16c632-e0b0-409e-a17b-9cfdc2ad44b0.jpg', '5fa37995-c0af-49ea-a6d7-0c2ac3e71377.jpg', 'jpg', 250771, '2026-08-14T07:01:48Z', '2026-08-14T07:01:48Z'),  -- kelompok7(komikdigital).jpg
  (3, 8, 3, 'https://pcwjorhpsdkdzfbhvjhk.supabase.co/storage/v1/object/public/presentasi-produk/3/8/a737e9cf-d9c1-4584-b65a-510d52713e99.png', '3/8/a737e9cf-d9c1-4584-b65a-510d52713e99.png', 'af8675fd-2512-4d40-a81d-529935d114d5.png', 'png', 2949527, '2026-08-14T06:43:05Z', '2026-08-14T06:43:05Z');  -- kelompok8(infografis).png

-- Tanggapan tertulis, 38 siswa. Tiap anggota satu kelompok menulis teks yang sama,
-- mengikuti pola Pertemuan 1 & 2 di mana tanggapan disusun bersama dalam kelompok.
INSERT INTO student_responses (meeting_id, student_id, group_id, response, created_at, updated_at) VALUES
  (3, 16, 6, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah sebelum kedatangan Eropa menunjukkan adanya pembagian peran antara saudagar dan penguasa. Saudagar melakukan aktivitas jual beli dan distribusi rempah, sedangkan penguasa menyediakan keamanan serta mengatur pelabuhan. Kerja sama ini membuat Nusantara memiliki bandar-bandar yang ramai dan terhubung dengan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama ingin mendapatkan rempah-rempah, tetapi keduanya bersaing menentukan wilayah kekuasaan. Persaingan tersebut kemudian diatur melalui Perjanjian Tordesillas dan Saragosa. VOC menggunakan monopoli, perjanjian, serta kekuatan militer untuk mengendalikan rempah. Inggris melalui EIC lebih mengembangkan jaringan perdagangan dan akhirnya berfokus pada Bengkulu untuk mendapatkan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal semakin sulit mengendalikan perdagangan sendiri. Monopoli VOC bahkan memengaruhi jumlah tanaman rempah yang boleh ditanam dan kepada siapa hasilnya dapat dijual. Akibatnya masyarakat kehilangan sebagian sumber penghidupannya dan muncul berbagai perlawanan. Hal ini relevan dengan pengelolaan sumber daya alam Indonesia karena masyarakat lokal harus dilibatkan dan memperoleh manfaat dari kekayaan alam di wilayahnya.', '2026-08-14T07:05:44Z', '2026-08-14T07:05:44Z'),
  (3, 2, 4, '1. Hubungan Saudagar dan Penguasa Lokal
Hubungan saudagar dan penguasa lokal dapat dikatakan sebagai hubungan kerja sama dalam kegiatan ekonomi. Saudagar membutuhkan keamanan dan akses terhadap pelabuhan, sedangkan penguasa lokal membutuhkan aktivitas perdagangan untuk meningkatkan kemakmuran kerajaan. Karena itu, perdagangan rempah dapat berkembang dan menjadikan Nusantara sebagai salah satu pusat perdagangan dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama mencari keuntungan dari perdagangan rempah, tetapi menggunakan jalur pelayaran yang berbeda. Portugis bergerak ke arah timur melalui Afrika dan India, sedangkan Spanyol bergerak ke arah barat. VOC kemudian menggunakan strategi monopoli yang lebih ketat dengan mengendalikan perdagangan dan produksi rempah. Inggris melalui EIC menggunakan jaringan pos dagang dan menjadikan Bengkulu sebagai salah satu pusat perdagangan lada setelah mengurangi persaingan di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan wilayah kerajaan lokal menjadi sasaran kepentingan asing. Ternate dan Tidore tidak hanya menghadapi persaingan perdagangan, tetapi juga tekanan politik dan militer. Pengalaman tersebut penting untuk dipahami saat ini karena sumber daya alam Indonesia memiliki nilai ekonomi tinggi. Indonesia perlu memastikan bahwa pengelolaan sumber daya alam tidak menyebabkan ketergantungan dan kerugian bagi masyarakat lokal.', '2026-08-14T07:06:12Z', '2026-08-14T07:06:12Z'),
  (3, 59, 7, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan yang saling membutuhkan. Saudagar membutuhkan perlindungan dan tempat berdagang, sementara kerajaan memperoleh keuntungan dari aktivitas perdagangan yang berlangsung di wilayahnya. Hubungan tersebut membuat berbagai kerajaan dan bandar di Nusantara menjadi bagian dari jaringan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai jalur dan bandar perdagangan untuk memperoleh rempah. Spanyol juga ingin memperoleh rempah dan memperluas wilayah pengaruhnya, tetapi kemudian memusatkan kegiatan di Filipina. VOC berbeda karena berusaha mengontrol langsung sumber rempah melalui monopoli dan tindakan militer. Inggris lebih banyak mengandalkan jaringan pos dagang dan perdagangan lada, terutama di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan-kerajaan seperti Ternate dan Tidore menjadi sasaran perebutan pengaruh. Campur tangan bangsa Eropa mengurangi kebebasan kerajaan dalam menentukan perdagangan dan hubungan dengan pihak luar. Peristiwa ini masih relevan karena Indonesia mempunyai banyak kekayaan alam yang berharga. Jika tidak dikelola dengan baik, kekayaan tersebut dapat menimbulkan konflik dan ketimpangan, sehingga diperlukan pengelolaan yang adil dan berkelanjutan.', '2026-08-14T07:06:35Z', '2026-08-14T07:06:35Z'),
  (3, 9, 2, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah di Nusantara berkembang karena adanya kerja sama antara saudagar dan penguasa lokal. Saudagar membawa rempah dari daerah penghasil menuju berbagai bandar, sedangkan penguasa memberikan perlindungan dan mengatur aktivitas perdagangan. Dengan adanya kerja sama tersebut, perdagangan cengkih, pala, dan lada dapat berkembang hingga menjangkau pedagang dari Arab, India, Cina, dan Eropa.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai perdagangan melalui pelabuhan dan jalur pelayaran menuju sumber rempah. Spanyol juga mencari rempah melalui jalur pelayaran barat sehingga kemudian terjadi persaingan dengan Portugis di Maluku. VOC menggunakan monopoli perdagangan yang didukung kekuatan militer dan bahkan mengatur jumlah tanaman rempah yang boleh ditanam. Inggris melalui EIC lebih mengandalkan jaringan pos perdagangan dan akhirnya menjadikan Bengkulu sebagai salah satu pusat perdagangan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Kerajaan Ternate dan Tidore menjadi bagian dari persaingan bangsa Eropa karena wilayah mereka menghasilkan cengkih yang sangat bernilai. Campur tangan bangsa Eropa menyebabkan kerajaan lokal tidak lagi sepenuhnya bebas mengatur perdagangan. Hal ini relevan dengan kondisi Indonesia saat ini karena kekayaan alam seperti minyak, gas, mineral, dan hasil perkebunan juga dapat menjadi sumber persaingan. Oleh sebab itu, sumber daya alam harus dikelola secara bijaksana dan memberikan manfaat bagi masyarakat.', '2026-08-14T07:06:48Z', '2026-08-14T07:06:48Z'),
  (3, 49, 5, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar memiliki peranan penting sebagai penghubung antara daerah penghasil rempah dengan pasar di berbagai wilayah. Penguasa lokal memberikan perlindungan terhadap kegiatan perdagangan dan mengatur pelabuhan. Hubungan tersebut menciptakan kondisi yang mendukung berkembangnya perdagangan cengkih, pala, dan lada di Nusantara.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha mendapatkan rempah sekaligus memperluas pengaruhnya melalui penguasaan pelabuhan dan jalur perdagangan. Spanyol juga mengejar rempah tetapi akhirnya memusatkan kegiatan di Filipina setelah Perjanjian Saragosa. VOC memiliki kepentingan mempertahankan monopoli dan menggunakan kekuatan militer untuk mengontrol sumber rempah. Inggris melalui EIC mengembangkan pos-pos dagang dan kemudian mempertahankan kepentingannya di Bengkulu sebagai daerah penghasil lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan Eropa membuat kerajaan lokal sulit mempertahankan kebebasan perdagangan. Ternate dan Tidore menjadi wilayah penting karena menghasilkan cengkih sehingga menjadi sasaran kepentingan Portugis, Spanyol, dan kemudian Belanda. Peristiwa tersebut relevan dengan Indonesia sekarang karena sumber daya alam yang bernilai tinggi dapat menarik kepentingan ekonomi dari berbagai pihak. Pengelolaannya harus memperhatikan kesejahteraan masyarakat dan kepentingan nasional.', '2026-08-14T07:07:02Z', '2026-08-14T07:07:02Z'),
  (3, 11, 1, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum bangsa Eropa datang, saudagar dan penguasa lokal memiliki hubungan yang saling menguntungkan. Saudagar bertugas mengumpulkan dan mendistribusikan rempah-rempah melalui jalur perdagangan laut, sedangkan penguasa lokal menjaga keamanan pelabuhan dan mengatur kegiatan perdagangan. Hubungan tersebut membuat bandar-bandar di Nusantara berkembang menjadi pusat perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis datang untuk memperoleh rempah-rempah dan memperluas pengaruhnya dengan menguasai jalur serta bandar perdagangan. Spanyol memiliki kepentingan yang sama dalam mencari rempah dan wilayah pengaruh, tetapi lebih banyak bergerak melalui jalur barat dan kemudian berpusat di Filipina. VOC memiliki strategi yang lebih kuat dalam menerapkan monopoli dengan kekuatan militer serta mengendalikan produksi rempah dari sumbernya. Sementara itu, Inggris melalui EIC berusaha membangun jaringan perdagangan dan pos dagang, terutama di Banten, Maluku, dan kemudian Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan seperti Ternate dan Tidore berada dalam tekanan dan harus menghadapi campur tangan asing dalam perdagangan. Kebebasan kerajaan untuk menentukan perdagangan rempah semakin berkurang karena bangsa Eropa berusaha menguasai sumber rempah. Peristiwa ini masih relevan karena Indonesia hingga sekarang memiliki banyak sumber daya alam yang bernilai tinggi sehingga harus dikelola untuk kepentingan masyarakat Indonesia, bukan hanya untuk kepentingan pihak yang memiliki kekuatan ekonomi.', '2026-08-14T07:07:19Z', '2026-08-14T07:07:19Z'),
  (3, 28, 3, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan ekonomi dan politik yang saling mendukung. Saudagar memperoleh kesempatan untuk melakukan perdagangan di wilayah kerajaan, sedangkan penguasa lokal mendapatkan keuntungan dari berkembangnya aktivitas perdagangan di pelabuhan. Penguasa juga bertanggung jawab menjaga keamanan sehingga para saudagar dapat melakukan kegiatan perdagangan dengan lebih aman.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha memperoleh rempah dan menguasai jalur perdagangan dari Eropa menuju Asia. Spanyol melakukan pelayaran melalui arah barat dan kemudian bersaing dengan Portugis untuk mendapatkan pengaruh di Maluku. VOC menggunakan hak istimewanya untuk membangun monopoli dan mempertahankannya dengan kekuatan militer. Inggris melalui EIC juga mencari keuntungan dari perdagangan rempah, tetapi setelah mengalami persaingan dengan Belanda di Maluku, Inggris lebih memusatkan perdagangannya di India dan tetap mempertahankan pos di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal kehilangan sebagian kebebasan dalam perdagangan. Ternate dan Tidore harus menghadapi kepentingan Portugis dan Spanyol yang ingin memperoleh pengaruh di Maluku. Kemudian VOC juga memperkuat monopoli sehingga masyarakat dan kerajaan lokal mengalami tekanan. Peristiwa tersebut relevan karena menunjukkan bahwa kekayaan alam yang besar dapat menjadi sumber konflik apabila tidak dikelola dengan kedaulatan dan kepentingan masyarakat.', '2026-08-14T07:07:55Z', '2026-08-14T07:07:55Z'),
  (3, 41, 4, '1. Hubungan Saudagar dan Penguasa Lokal
Hubungan saudagar dan penguasa lokal dapat dikatakan sebagai hubungan kerja sama dalam kegiatan ekonomi. Saudagar membutuhkan keamanan dan akses terhadap pelabuhan, sedangkan penguasa lokal membutuhkan aktivitas perdagangan untuk meningkatkan kemakmuran kerajaan. Karena itu, perdagangan rempah dapat berkembang dan menjadikan Nusantara sebagai salah satu pusat perdagangan dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama mencari keuntungan dari perdagangan rempah, tetapi menggunakan jalur pelayaran yang berbeda. Portugis bergerak ke arah timur melalui Afrika dan India, sedangkan Spanyol bergerak ke arah barat. VOC kemudian menggunakan strategi monopoli yang lebih ketat dengan mengendalikan perdagangan dan produksi rempah. Inggris melalui EIC menggunakan jaringan pos dagang dan menjadikan Bengkulu sebagai salah satu pusat perdagangan lada setelah mengurangi persaingan di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan wilayah kerajaan lokal menjadi sasaran kepentingan asing. Ternate dan Tidore tidak hanya menghadapi persaingan perdagangan, tetapi juga tekanan politik dan militer. Pengalaman tersebut penting untuk dipahami saat ini karena sumber daya alam Indonesia memiliki nilai ekonomi tinggi. Indonesia perlu memastikan bahwa pengelolaan sumber daya alam tidak menyebabkan ketergantungan dan kerugian bagi masyarakat lokal.', '2026-08-14T07:08:07Z', '2026-08-14T07:08:07Z'),
  (3, 14, 2, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah di Nusantara berkembang karena adanya kerja sama antara saudagar dan penguasa lokal. Saudagar membawa rempah dari daerah penghasil menuju berbagai bandar, sedangkan penguasa memberikan perlindungan dan mengatur aktivitas perdagangan. Dengan adanya kerja sama tersebut, perdagangan cengkih, pala, dan lada dapat berkembang hingga menjangkau pedagang dari Arab, India, Cina, dan Eropa.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai perdagangan melalui pelabuhan dan jalur pelayaran menuju sumber rempah. Spanyol juga mencari rempah melalui jalur pelayaran barat sehingga kemudian terjadi persaingan dengan Portugis di Maluku. VOC menggunakan monopoli perdagangan yang didukung kekuatan militer dan bahkan mengatur jumlah tanaman rempah yang boleh ditanam. Inggris melalui EIC lebih mengandalkan jaringan pos perdagangan dan akhirnya menjadikan Bengkulu sebagai salah satu pusat perdagangan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Kerajaan Ternate dan Tidore menjadi bagian dari persaingan bangsa Eropa karena wilayah mereka menghasilkan cengkih yang sangat bernilai. Campur tangan bangsa Eropa menyebabkan kerajaan lokal tidak lagi sepenuhnya bebas mengatur perdagangan. Hal ini relevan dengan kondisi Indonesia saat ini karena kekayaan alam seperti minyak, gas, mineral, dan hasil perkebunan juga dapat menjadi sumber persaingan. Oleh sebab itu, sumber daya alam harus dikelola secara bijaksana dan memberikan manfaat bagi masyarakat.', '2026-08-14T07:08:31Z', '2026-08-14T07:08:31Z'),
  (3, 3, 8, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum kedatangan bangsa Eropa, perdagangan rempah telah berkembang melalui kerja sama antara saudagar dan penguasa lokal. Saudagar mengumpulkan serta menjual rempah ke berbagai daerah, sedangkan penguasa menjaga keamanan dan mengatur perdagangan di pelabuhan. Sistem tersebut membuat rempah Nusantara dapat diperdagangkan hingga ke berbagai wilayah dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama berusaha memperoleh keuntungan dari perdagangan rempah dan memperluas pengaruhnya. Persaingan keduanya menghasilkan Perjanjian Tordesillas dan Saragosa. VOC menggunakan strategi monopoli yang didukung kekuatan militer sehingga dapat mengontrol perdagangan dan produksi rempah. Inggris melalui EIC mengembangkan jaringan perdagangan dan pos dagang, terutama di Bengkulu setelah mengurangi aktivitasnya di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan lokal seperti Ternate dan Tidore menghadapi tekanan politik, ekonomi, dan militer. Perdagangan yang sebelumnya dapat dilakukan secara lebih bebas berubah menjadi perdagangan yang dikendalikan oleh kekuatan asing. Peristiwa tersebut penting bagi kehidupan sekarang karena mengajarkan bahwa sumber daya alam merupakan aset strategis. Indonesia perlu menjaga kedaulatan, mengelola sumber daya secara berkelanjutan, dan memastikan hasilnya dapat dirasakan masyarakat.', '2026-08-14T07:08:49Z', '2026-08-14T07:08:49Z'),
  (3, 25, 1, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum bangsa Eropa datang, saudagar dan penguasa lokal memiliki hubungan yang saling menguntungkan. Saudagar bertugas mengumpulkan dan mendistribusikan rempah-rempah melalui jalur perdagangan laut, sedangkan penguasa lokal menjaga keamanan pelabuhan dan mengatur kegiatan perdagangan. Hubungan tersebut membuat bandar-bandar di Nusantara berkembang menjadi pusat perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis datang untuk memperoleh rempah-rempah dan memperluas pengaruhnya dengan menguasai jalur serta bandar perdagangan. Spanyol memiliki kepentingan yang sama dalam mencari rempah dan wilayah pengaruh, tetapi lebih banyak bergerak melalui jalur barat dan kemudian berpusat di Filipina. VOC memiliki strategi yang lebih kuat dalam menerapkan monopoli dengan kekuatan militer serta mengendalikan produksi rempah dari sumbernya. Sementara itu, Inggris melalui EIC berusaha membangun jaringan perdagangan dan pos dagang, terutama di Banten, Maluku, dan kemudian Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan seperti Ternate dan Tidore berada dalam tekanan dan harus menghadapi campur tangan asing dalam perdagangan. Kebebasan kerajaan untuk menentukan perdagangan rempah semakin berkurang karena bangsa Eropa berusaha menguasai sumber rempah. Peristiwa ini masih relevan karena Indonesia hingga sekarang memiliki banyak sumber daya alam yang bernilai tinggi sehingga harus dikelola untuk kepentingan masyarakat Indonesia, bukan hanya untuk kepentingan pihak yang memiliki kekuatan ekonomi.', '2026-08-14T07:09:04Z', '2026-08-14T07:09:04Z'),
  (3, 34, 6, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah sebelum kedatangan Eropa menunjukkan adanya pembagian peran antara saudagar dan penguasa. Saudagar melakukan aktivitas jual beli dan distribusi rempah, sedangkan penguasa menyediakan keamanan serta mengatur pelabuhan. Kerja sama ini membuat Nusantara memiliki bandar-bandar yang ramai dan terhubung dengan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama ingin mendapatkan rempah-rempah, tetapi keduanya bersaing menentukan wilayah kekuasaan. Persaingan tersebut kemudian diatur melalui Perjanjian Tordesillas dan Saragosa. VOC menggunakan monopoli, perjanjian, serta kekuatan militer untuk mengendalikan rempah. Inggris melalui EIC lebih mengembangkan jaringan perdagangan dan akhirnya berfokus pada Bengkulu untuk mendapatkan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal semakin sulit mengendalikan perdagangan sendiri. Monopoli VOC bahkan memengaruhi jumlah tanaman rempah yang boleh ditanam dan kepada siapa hasilnya dapat dijual. Akibatnya masyarakat kehilangan sebagian sumber penghidupannya dan muncul berbagai perlawanan. Hal ini relevan dengan pengelolaan sumber daya alam Indonesia karena masyarakat lokal harus dilibatkan dan memperoleh manfaat dari kekayaan alam di wilayahnya.', '2026-08-14T07:09:29Z', '2026-08-14T07:09:29Z'),
  (3, 58, 3, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan ekonomi dan politik yang saling mendukung. Saudagar memperoleh kesempatan untuk melakukan perdagangan di wilayah kerajaan, sedangkan penguasa lokal mendapatkan keuntungan dari berkembangnya aktivitas perdagangan di pelabuhan. Penguasa juga bertanggung jawab menjaga keamanan sehingga para saudagar dapat melakukan kegiatan perdagangan dengan lebih aman.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha memperoleh rempah dan menguasai jalur perdagangan dari Eropa menuju Asia. Spanyol melakukan pelayaran melalui arah barat dan kemudian bersaing dengan Portugis untuk mendapatkan pengaruh di Maluku. VOC menggunakan hak istimewanya untuk membangun monopoli dan mempertahankannya dengan kekuatan militer. Inggris melalui EIC juga mencari keuntungan dari perdagangan rempah, tetapi setelah mengalami persaingan dengan Belanda di Maluku, Inggris lebih memusatkan perdagangannya di India dan tetap mempertahankan pos di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal kehilangan sebagian kebebasan dalam perdagangan. Ternate dan Tidore harus menghadapi kepentingan Portugis dan Spanyol yang ingin memperoleh pengaruh di Maluku. Kemudian VOC juga memperkuat monopoli sehingga masyarakat dan kerajaan lokal mengalami tekanan. Peristiwa tersebut relevan karena menunjukkan bahwa kekayaan alam yang besar dapat menjadi sumber konflik apabila tidak dikelola dengan kedaulatan dan kepentingan masyarakat.', '2026-08-14T07:09:46Z', '2026-08-14T07:09:46Z'),
  (3, 53, 8, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum kedatangan bangsa Eropa, perdagangan rempah telah berkembang melalui kerja sama antara saudagar dan penguasa lokal. Saudagar mengumpulkan serta menjual rempah ke berbagai daerah, sedangkan penguasa menjaga keamanan dan mengatur perdagangan di pelabuhan. Sistem tersebut membuat rempah Nusantara dapat diperdagangkan hingga ke berbagai wilayah dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama berusaha memperoleh keuntungan dari perdagangan rempah dan memperluas pengaruhnya. Persaingan keduanya menghasilkan Perjanjian Tordesillas dan Saragosa. VOC menggunakan strategi monopoli yang didukung kekuatan militer sehingga dapat mengontrol perdagangan dan produksi rempah. Inggris melalui EIC mengembangkan jaringan perdagangan dan pos dagang, terutama di Bengkulu setelah mengurangi aktivitasnya di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan lokal seperti Ternate dan Tidore menghadapi tekanan politik, ekonomi, dan militer. Perdagangan yang sebelumnya dapat dilakukan secara lebih bebas berubah menjadi perdagangan yang dikendalikan oleh kekuatan asing. Peristiwa tersebut penting bagi kehidupan sekarang karena mengajarkan bahwa sumber daya alam merupakan aset strategis. Indonesia perlu menjaga kedaulatan, mengelola sumber daya secara berkelanjutan, dan memastikan hasilnya dapat dirasakan masyarakat.', '2026-08-14T07:09:58Z', '2026-08-14T07:09:58Z'),
  (3, 31, 7, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan yang saling membutuhkan. Saudagar membutuhkan perlindungan dan tempat berdagang, sementara kerajaan memperoleh keuntungan dari aktivitas perdagangan yang berlangsung di wilayahnya. Hubungan tersebut membuat berbagai kerajaan dan bandar di Nusantara menjadi bagian dari jaringan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai jalur dan bandar perdagangan untuk memperoleh rempah. Spanyol juga ingin memperoleh rempah dan memperluas wilayah pengaruhnya, tetapi kemudian memusatkan kegiatan di Filipina. VOC berbeda karena berusaha mengontrol langsung sumber rempah melalui monopoli dan tindakan militer. Inggris lebih banyak mengandalkan jaringan pos dagang dan perdagangan lada, terutama di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan-kerajaan seperti Ternate dan Tidore menjadi sasaran perebutan pengaruh. Campur tangan bangsa Eropa mengurangi kebebasan kerajaan dalam menentukan perdagangan dan hubungan dengan pihak luar. Peristiwa ini masih relevan karena Indonesia mempunyai banyak kekayaan alam yang berharga. Jika tidak dikelola dengan baik, kekayaan tersebut dapat menimbulkan konflik dan ketimpangan, sehingga diperlukan pengelolaan yang adil dan berkelanjutan.', '2026-08-14T07:10:16Z', '2026-08-14T07:10:16Z'),
  (3, 35, 4, '1. Hubungan Saudagar dan Penguasa Lokal
Hubungan saudagar dan penguasa lokal dapat dikatakan sebagai hubungan kerja sama dalam kegiatan ekonomi. Saudagar membutuhkan keamanan dan akses terhadap pelabuhan, sedangkan penguasa lokal membutuhkan aktivitas perdagangan untuk meningkatkan kemakmuran kerajaan. Karena itu, perdagangan rempah dapat berkembang dan menjadikan Nusantara sebagai salah satu pusat perdagangan dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama mencari keuntungan dari perdagangan rempah, tetapi menggunakan jalur pelayaran yang berbeda. Portugis bergerak ke arah timur melalui Afrika dan India, sedangkan Spanyol bergerak ke arah barat. VOC kemudian menggunakan strategi monopoli yang lebih ketat dengan mengendalikan perdagangan dan produksi rempah. Inggris melalui EIC menggunakan jaringan pos dagang dan menjadikan Bengkulu sebagai salah satu pusat perdagangan lada setelah mengurangi persaingan di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan wilayah kerajaan lokal menjadi sasaran kepentingan asing. Ternate dan Tidore tidak hanya menghadapi persaingan perdagangan, tetapi juga tekanan politik dan militer. Pengalaman tersebut penting untuk dipahami saat ini karena sumber daya alam Indonesia memiliki nilai ekonomi tinggi. Indonesia perlu memastikan bahwa pengelolaan sumber daya alam tidak menyebabkan ketergantungan dan kerugian bagi masyarakat lokal.', '2026-08-14T07:10:31Z', '2026-08-14T07:10:31Z'),
  (3, 48, 2, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah di Nusantara berkembang karena adanya kerja sama antara saudagar dan penguasa lokal. Saudagar membawa rempah dari daerah penghasil menuju berbagai bandar, sedangkan penguasa memberikan perlindungan dan mengatur aktivitas perdagangan. Dengan adanya kerja sama tersebut, perdagangan cengkih, pala, dan lada dapat berkembang hingga menjangkau pedagang dari Arab, India, Cina, dan Eropa.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai perdagangan melalui pelabuhan dan jalur pelayaran menuju sumber rempah. Spanyol juga mencari rempah melalui jalur pelayaran barat sehingga kemudian terjadi persaingan dengan Portugis di Maluku. VOC menggunakan monopoli perdagangan yang didukung kekuatan militer dan bahkan mengatur jumlah tanaman rempah yang boleh ditanam. Inggris melalui EIC lebih mengandalkan jaringan pos perdagangan dan akhirnya menjadikan Bengkulu sebagai salah satu pusat perdagangan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Kerajaan Ternate dan Tidore menjadi bagian dari persaingan bangsa Eropa karena wilayah mereka menghasilkan cengkih yang sangat bernilai. Campur tangan bangsa Eropa menyebabkan kerajaan lokal tidak lagi sepenuhnya bebas mengatur perdagangan. Hal ini relevan dengan kondisi Indonesia saat ini karena kekayaan alam seperti minyak, gas, mineral, dan hasil perkebunan juga dapat menjadi sumber persaingan. Oleh sebab itu, sumber daya alam harus dikelola secara bijaksana dan memberikan manfaat bagi masyarakat.', '2026-08-14T07:10:57Z', '2026-08-14T07:10:57Z'),
  (3, 20, 3, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan ekonomi dan politik yang saling mendukung. Saudagar memperoleh kesempatan untuk melakukan perdagangan di wilayah kerajaan, sedangkan penguasa lokal mendapatkan keuntungan dari berkembangnya aktivitas perdagangan di pelabuhan. Penguasa juga bertanggung jawab menjaga keamanan sehingga para saudagar dapat melakukan kegiatan perdagangan dengan lebih aman.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha memperoleh rempah dan menguasai jalur perdagangan dari Eropa menuju Asia. Spanyol melakukan pelayaran melalui arah barat dan kemudian bersaing dengan Portugis untuk mendapatkan pengaruh di Maluku. VOC menggunakan hak istimewanya untuk membangun monopoli dan mempertahankannya dengan kekuatan militer. Inggris melalui EIC juga mencari keuntungan dari perdagangan rempah, tetapi setelah mengalami persaingan dengan Belanda di Maluku, Inggris lebih memusatkan perdagangannya di India dan tetap mempertahankan pos di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal kehilangan sebagian kebebasan dalam perdagangan. Ternate dan Tidore harus menghadapi kepentingan Portugis dan Spanyol yang ingin memperoleh pengaruh di Maluku. Kemudian VOC juga memperkuat monopoli sehingga masyarakat dan kerajaan lokal mengalami tekanan. Peristiwa tersebut relevan karena menunjukkan bahwa kekayaan alam yang besar dapat menjadi sumber konflik apabila tidak dikelola dengan kedaulatan dan kepentingan masyarakat.', '2026-08-14T07:11:03Z', '2026-08-14T07:11:03Z'),
  (3, 54, 5, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar memiliki peranan penting sebagai penghubung antara daerah penghasil rempah dengan pasar di berbagai wilayah. Penguasa lokal memberikan perlindungan terhadap kegiatan perdagangan dan mengatur pelabuhan. Hubungan tersebut menciptakan kondisi yang mendukung berkembangnya perdagangan cengkih, pala, dan lada di Nusantara.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha mendapatkan rempah sekaligus memperluas pengaruhnya melalui penguasaan pelabuhan dan jalur perdagangan. Spanyol juga mengejar rempah tetapi akhirnya memusatkan kegiatan di Filipina setelah Perjanjian Saragosa. VOC memiliki kepentingan mempertahankan monopoli dan menggunakan kekuatan militer untuk mengontrol sumber rempah. Inggris melalui EIC mengembangkan pos-pos dagang dan kemudian mempertahankan kepentingannya di Bengkulu sebagai daerah penghasil lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan Eropa membuat kerajaan lokal sulit mempertahankan kebebasan perdagangan. Ternate dan Tidore menjadi wilayah penting karena menghasilkan cengkih sehingga menjadi sasaran kepentingan Portugis, Spanyol, dan kemudian Belanda. Peristiwa tersebut relevan dengan Indonesia sekarang karena sumber daya alam yang bernilai tinggi dapat menarik kepentingan ekonomi dari berbagai pihak. Pengelolaannya harus memperhatikan kesejahteraan masyarakat dan kepentingan nasional.', '2026-08-14T07:11:20Z', '2026-08-14T07:11:20Z'),
  (3, 5, 1, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum bangsa Eropa datang, saudagar dan penguasa lokal memiliki hubungan yang saling menguntungkan. Saudagar bertugas mengumpulkan dan mendistribusikan rempah-rempah melalui jalur perdagangan laut, sedangkan penguasa lokal menjaga keamanan pelabuhan dan mengatur kegiatan perdagangan. Hubungan tersebut membuat bandar-bandar di Nusantara berkembang menjadi pusat perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis datang untuk memperoleh rempah-rempah dan memperluas pengaruhnya dengan menguasai jalur serta bandar perdagangan. Spanyol memiliki kepentingan yang sama dalam mencari rempah dan wilayah pengaruh, tetapi lebih banyak bergerak melalui jalur barat dan kemudian berpusat di Filipina. VOC memiliki strategi yang lebih kuat dalam menerapkan monopoli dengan kekuatan militer serta mengendalikan produksi rempah dari sumbernya. Sementara itu, Inggris melalui EIC berusaha membangun jaringan perdagangan dan pos dagang, terutama di Banten, Maluku, dan kemudian Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan seperti Ternate dan Tidore berada dalam tekanan dan harus menghadapi campur tangan asing dalam perdagangan. Kebebasan kerajaan untuk menentukan perdagangan rempah semakin berkurang karena bangsa Eropa berusaha menguasai sumber rempah. Peristiwa ini masih relevan karena Indonesia hingga sekarang memiliki banyak sumber daya alam yang bernilai tinggi sehingga harus dikelola untuk kepentingan masyarakat Indonesia, bukan hanya untuk kepentingan pihak yang memiliki kekuatan ekonomi.', '2026-08-14T07:11:42Z', '2026-08-14T07:11:42Z'),
  (3, 57, 8, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum kedatangan bangsa Eropa, perdagangan rempah telah berkembang melalui kerja sama antara saudagar dan penguasa lokal. Saudagar mengumpulkan serta menjual rempah ke berbagai daerah, sedangkan penguasa menjaga keamanan dan mengatur perdagangan di pelabuhan. Sistem tersebut membuat rempah Nusantara dapat diperdagangkan hingga ke berbagai wilayah dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama berusaha memperoleh keuntungan dari perdagangan rempah dan memperluas pengaruhnya. Persaingan keduanya menghasilkan Perjanjian Tordesillas dan Saragosa. VOC menggunakan strategi monopoli yang didukung kekuatan militer sehingga dapat mengontrol perdagangan dan produksi rempah. Inggris melalui EIC mengembangkan jaringan perdagangan dan pos dagang, terutama di Bengkulu setelah mengurangi aktivitasnya di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan lokal seperti Ternate dan Tidore menghadapi tekanan politik, ekonomi, dan militer. Perdagangan yang sebelumnya dapat dilakukan secara lebih bebas berubah menjadi perdagangan yang dikendalikan oleh kekuatan asing. Peristiwa tersebut penting bagi kehidupan sekarang karena mengajarkan bahwa sumber daya alam merupakan aset strategis. Indonesia perlu menjaga kedaulatan, mengelola sumber daya secara berkelanjutan, dan memastikan hasilnya dapat dirasakan masyarakat.', '2026-08-14T07:11:51Z', '2026-08-14T07:11:51Z'),
  (3, 6, 2, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah di Nusantara berkembang karena adanya kerja sama antara saudagar dan penguasa lokal. Saudagar membawa rempah dari daerah penghasil menuju berbagai bandar, sedangkan penguasa memberikan perlindungan dan mengatur aktivitas perdagangan. Dengan adanya kerja sama tersebut, perdagangan cengkih, pala, dan lada dapat berkembang hingga menjangkau pedagang dari Arab, India, Cina, dan Eropa.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai perdagangan melalui pelabuhan dan jalur pelayaran menuju sumber rempah. Spanyol juga mencari rempah melalui jalur pelayaran barat sehingga kemudian terjadi persaingan dengan Portugis di Maluku. VOC menggunakan monopoli perdagangan yang didukung kekuatan militer dan bahkan mengatur jumlah tanaman rempah yang boleh ditanam. Inggris melalui EIC lebih mengandalkan jaringan pos perdagangan dan akhirnya menjadikan Bengkulu sebagai salah satu pusat perdagangan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Kerajaan Ternate dan Tidore menjadi bagian dari persaingan bangsa Eropa karena wilayah mereka menghasilkan cengkih yang sangat bernilai. Campur tangan bangsa Eropa menyebabkan kerajaan lokal tidak lagi sepenuhnya bebas mengatur perdagangan. Hal ini relevan dengan kondisi Indonesia saat ini karena kekayaan alam seperti minyak, gas, mineral, dan hasil perkebunan juga dapat menjadi sumber persaingan. Oleh sebab itu, sumber daya alam harus dikelola secara bijaksana dan memberikan manfaat bagi masyarakat.', '2026-08-14T07:12:15Z', '2026-08-14T07:12:15Z'),
  (3, 45, 8, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum kedatangan bangsa Eropa, perdagangan rempah telah berkembang melalui kerja sama antara saudagar dan penguasa lokal. Saudagar mengumpulkan serta menjual rempah ke berbagai daerah, sedangkan penguasa menjaga keamanan dan mengatur perdagangan di pelabuhan. Sistem tersebut membuat rempah Nusantara dapat diperdagangkan hingga ke berbagai wilayah dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama berusaha memperoleh keuntungan dari perdagangan rempah dan memperluas pengaruhnya. Persaingan keduanya menghasilkan Perjanjian Tordesillas dan Saragosa. VOC menggunakan strategi monopoli yang didukung kekuatan militer sehingga dapat mengontrol perdagangan dan produksi rempah. Inggris melalui EIC mengembangkan jaringan perdagangan dan pos dagang, terutama di Bengkulu setelah mengurangi aktivitasnya di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan lokal seperti Ternate dan Tidore menghadapi tekanan politik, ekonomi, dan militer. Perdagangan yang sebelumnya dapat dilakukan secara lebih bebas berubah menjadi perdagangan yang dikendalikan oleh kekuatan asing. Peristiwa tersebut penting bagi kehidupan sekarang karena mengajarkan bahwa sumber daya alam merupakan aset strategis. Indonesia perlu menjaga kedaulatan, mengelola sumber daya secara berkelanjutan, dan memastikan hasilnya dapat dirasakan masyarakat.', '2026-08-14T07:12:33Z', '2026-08-14T07:12:33Z'),
  (3, 19, 5, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar memiliki peranan penting sebagai penghubung antara daerah penghasil rempah dengan pasar di berbagai wilayah. Penguasa lokal memberikan perlindungan terhadap kegiatan perdagangan dan mengatur pelabuhan. Hubungan tersebut menciptakan kondisi yang mendukung berkembangnya perdagangan cengkih, pala, dan lada di Nusantara.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha mendapatkan rempah sekaligus memperluas pengaruhnya melalui penguasaan pelabuhan dan jalur perdagangan. Spanyol juga mengejar rempah tetapi akhirnya memusatkan kegiatan di Filipina setelah Perjanjian Saragosa. VOC memiliki kepentingan mempertahankan monopoli dan menggunakan kekuatan militer untuk mengontrol sumber rempah. Inggris melalui EIC mengembangkan pos-pos dagang dan kemudian mempertahankan kepentingannya di Bengkulu sebagai daerah penghasil lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan Eropa membuat kerajaan lokal sulit mempertahankan kebebasan perdagangan. Ternate dan Tidore menjadi wilayah penting karena menghasilkan cengkih sehingga menjadi sasaran kepentingan Portugis, Spanyol, dan kemudian Belanda. Peristiwa tersebut relevan dengan Indonesia sekarang karena sumber daya alam yang bernilai tinggi dapat menarik kepentingan ekonomi dari berbagai pihak. Pengelolaannya harus memperhatikan kesejahteraan masyarakat dan kepentingan nasional.', '2026-08-14T07:12:49Z', '2026-08-14T07:12:49Z'),
  (3, 18, 6, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah sebelum kedatangan Eropa menunjukkan adanya pembagian peran antara saudagar dan penguasa. Saudagar melakukan aktivitas jual beli dan distribusi rempah, sedangkan penguasa menyediakan keamanan serta mengatur pelabuhan. Kerja sama ini membuat Nusantara memiliki bandar-bandar yang ramai dan terhubung dengan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama ingin mendapatkan rempah-rempah, tetapi keduanya bersaing menentukan wilayah kekuasaan. Persaingan tersebut kemudian diatur melalui Perjanjian Tordesillas dan Saragosa. VOC menggunakan monopoli, perjanjian, serta kekuatan militer untuk mengendalikan rempah. Inggris melalui EIC lebih mengembangkan jaringan perdagangan dan akhirnya berfokus pada Bengkulu untuk mendapatkan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal semakin sulit mengendalikan perdagangan sendiri. Monopoli VOC bahkan memengaruhi jumlah tanaman rempah yang boleh ditanam dan kepada siapa hasilnya dapat dijual. Akibatnya masyarakat kehilangan sebagian sumber penghidupannya dan muncul berbagai perlawanan. Hal ini relevan dengan pengelolaan sumber daya alam Indonesia karena masyarakat lokal harus dilibatkan dan memperoleh manfaat dari kekayaan alam di wilayahnya.', '2026-08-14T07:13:11Z', '2026-08-14T07:13:11Z'),
  (3, 36, 1, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum bangsa Eropa datang, saudagar dan penguasa lokal memiliki hubungan yang saling menguntungkan. Saudagar bertugas mengumpulkan dan mendistribusikan rempah-rempah melalui jalur perdagangan laut, sedangkan penguasa lokal menjaga keamanan pelabuhan dan mengatur kegiatan perdagangan. Hubungan tersebut membuat bandar-bandar di Nusantara berkembang menjadi pusat perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis datang untuk memperoleh rempah-rempah dan memperluas pengaruhnya dengan menguasai jalur serta bandar perdagangan. Spanyol memiliki kepentingan yang sama dalam mencari rempah dan wilayah pengaruh, tetapi lebih banyak bergerak melalui jalur barat dan kemudian berpusat di Filipina. VOC memiliki strategi yang lebih kuat dalam menerapkan monopoli dengan kekuatan militer serta mengendalikan produksi rempah dari sumbernya. Sementara itu, Inggris melalui EIC berusaha membangun jaringan perdagangan dan pos dagang, terutama di Banten, Maluku, dan kemudian Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan seperti Ternate dan Tidore berada dalam tekanan dan harus menghadapi campur tangan asing dalam perdagangan. Kebebasan kerajaan untuk menentukan perdagangan rempah semakin berkurang karena bangsa Eropa berusaha menguasai sumber rempah. Peristiwa ini masih relevan karena Indonesia hingga sekarang memiliki banyak sumber daya alam yang bernilai tinggi sehingga harus dikelola untuk kepentingan masyarakat Indonesia, bukan hanya untuk kepentingan pihak yang memiliki kekuatan ekonomi.', '2026-08-14T07:13:27Z', '2026-08-14T07:13:27Z'),
  (3, 47, 4, '1. Hubungan Saudagar dan Penguasa Lokal
Hubungan saudagar dan penguasa lokal dapat dikatakan sebagai hubungan kerja sama dalam kegiatan ekonomi. Saudagar membutuhkan keamanan dan akses terhadap pelabuhan, sedangkan penguasa lokal membutuhkan aktivitas perdagangan untuk meningkatkan kemakmuran kerajaan. Karena itu, perdagangan rempah dapat berkembang dan menjadikan Nusantara sebagai salah satu pusat perdagangan dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama mencari keuntungan dari perdagangan rempah, tetapi menggunakan jalur pelayaran yang berbeda. Portugis bergerak ke arah timur melalui Afrika dan India, sedangkan Spanyol bergerak ke arah barat. VOC kemudian menggunakan strategi monopoli yang lebih ketat dengan mengendalikan perdagangan dan produksi rempah. Inggris melalui EIC menggunakan jaringan pos dagang dan menjadikan Bengkulu sebagai salah satu pusat perdagangan lada setelah mengurangi persaingan di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan wilayah kerajaan lokal menjadi sasaran kepentingan asing. Ternate dan Tidore tidak hanya menghadapi persaingan perdagangan, tetapi juga tekanan politik dan militer. Pengalaman tersebut penting untuk dipahami saat ini karena sumber daya alam Indonesia memiliki nilai ekonomi tinggi. Indonesia perlu memastikan bahwa pengelolaan sumber daya alam tidak menyebabkan ketergantungan dan kerugian bagi masyarakat lokal.', '2026-08-14T07:13:58Z', '2026-08-14T07:13:58Z'),
  (3, 46, 3, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan ekonomi dan politik yang saling mendukung. Saudagar memperoleh kesempatan untuk melakukan perdagangan di wilayah kerajaan, sedangkan penguasa lokal mendapatkan keuntungan dari berkembangnya aktivitas perdagangan di pelabuhan. Penguasa juga bertanggung jawab menjaga keamanan sehingga para saudagar dapat melakukan kegiatan perdagangan dengan lebih aman.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha memperoleh rempah dan menguasai jalur perdagangan dari Eropa menuju Asia. Spanyol melakukan pelayaran melalui arah barat dan kemudian bersaing dengan Portugis untuk mendapatkan pengaruh di Maluku. VOC menggunakan hak istimewanya untuk membangun monopoli dan mempertahankannya dengan kekuatan militer. Inggris melalui EIC juga mencari keuntungan dari perdagangan rempah, tetapi setelah mengalami persaingan dengan Belanda di Maluku, Inggris lebih memusatkan perdagangannya di India dan tetap mempertahankan pos di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal kehilangan sebagian kebebasan dalam perdagangan. Ternate dan Tidore harus menghadapi kepentingan Portugis dan Spanyol yang ingin memperoleh pengaruh di Maluku. Kemudian VOC juga memperkuat monopoli sehingga masyarakat dan kerajaan lokal mengalami tekanan. Peristiwa tersebut relevan karena menunjukkan bahwa kekayaan alam yang besar dapat menjadi sumber konflik apabila tidak dikelola dengan kedaulatan dan kepentingan masyarakat.', '2026-08-14T07:14:11Z', '2026-08-14T07:14:11Z'),
  (3, 24, 5, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar memiliki peranan penting sebagai penghubung antara daerah penghasil rempah dengan pasar di berbagai wilayah. Penguasa lokal memberikan perlindungan terhadap kegiatan perdagangan dan mengatur pelabuhan. Hubungan tersebut menciptakan kondisi yang mendukung berkembangnya perdagangan cengkih, pala, dan lada di Nusantara.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha mendapatkan rempah sekaligus memperluas pengaruhnya melalui penguasaan pelabuhan dan jalur perdagangan. Spanyol juga mengejar rempah tetapi akhirnya memusatkan kegiatan di Filipina setelah Perjanjian Saragosa. VOC memiliki kepentingan mempertahankan monopoli dan menggunakan kekuatan militer untuk mengontrol sumber rempah. Inggris melalui EIC mengembangkan pos-pos dagang dan kemudian mempertahankan kepentingannya di Bengkulu sebagai daerah penghasil lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan Eropa membuat kerajaan lokal sulit mempertahankan kebebasan perdagangan. Ternate dan Tidore menjadi wilayah penting karena menghasilkan cengkih sehingga menjadi sasaran kepentingan Portugis, Spanyol, dan kemudian Belanda. Peristiwa tersebut relevan dengan Indonesia sekarang karena sumber daya alam yang bernilai tinggi dapat menarik kepentingan ekonomi dari berbagai pihak. Pengelolaannya harus memperhatikan kesejahteraan masyarakat dan kepentingan nasional.', '2026-08-14T07:14:38Z', '2026-08-14T07:14:38Z'),
  (3, 21, 7, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan yang saling membutuhkan. Saudagar membutuhkan perlindungan dan tempat berdagang, sementara kerajaan memperoleh keuntungan dari aktivitas perdagangan yang berlangsung di wilayahnya. Hubungan tersebut membuat berbagai kerajaan dan bandar di Nusantara menjadi bagian dari jaringan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai jalur dan bandar perdagangan untuk memperoleh rempah. Spanyol juga ingin memperoleh rempah dan memperluas wilayah pengaruhnya, tetapi kemudian memusatkan kegiatan di Filipina. VOC berbeda karena berusaha mengontrol langsung sumber rempah melalui monopoli dan tindakan militer. Inggris lebih banyak mengandalkan jaringan pos dagang dan perdagangan lada, terutama di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan-kerajaan seperti Ternate dan Tidore menjadi sasaran perebutan pengaruh. Campur tangan bangsa Eropa mengurangi kebebasan kerajaan dalam menentukan perdagangan dan hubungan dengan pihak luar. Peristiwa ini masih relevan karena Indonesia mempunyai banyak kekayaan alam yang berharga. Jika tidak dikelola dengan baik, kekayaan tersebut dapat menimbulkan konflik dan ketimpangan, sehingga diperlukan pengelolaan yang adil dan berkelanjutan.', '2026-08-14T07:14:52Z', '2026-08-14T07:14:52Z'),
  (3, 55, 6, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah sebelum kedatangan Eropa menunjukkan adanya pembagian peran antara saudagar dan penguasa. Saudagar melakukan aktivitas jual beli dan distribusi rempah, sedangkan penguasa menyediakan keamanan serta mengatur pelabuhan. Kerja sama ini membuat Nusantara memiliki bandar-bandar yang ramai dan terhubung dengan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama ingin mendapatkan rempah-rempah, tetapi keduanya bersaing menentukan wilayah kekuasaan. Persaingan tersebut kemudian diatur melalui Perjanjian Tordesillas dan Saragosa. VOC menggunakan monopoli, perjanjian, serta kekuatan militer untuk mengendalikan rempah. Inggris melalui EIC lebih mengembangkan jaringan perdagangan dan akhirnya berfokus pada Bengkulu untuk mendapatkan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal semakin sulit mengendalikan perdagangan sendiri. Monopoli VOC bahkan memengaruhi jumlah tanaman rempah yang boleh ditanam dan kepada siapa hasilnya dapat dijual. Akibatnya masyarakat kehilangan sebagian sumber penghidupannya dan muncul berbagai perlawanan. Hal ini relevan dengan pengelolaan sumber daya alam Indonesia karena masyarakat lokal harus dilibatkan dan memperoleh manfaat dari kekayaan alam di wilayahnya.', '2026-08-14T07:15:07Z', '2026-08-14T07:15:07Z'),
  (3, 52, 8, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum kedatangan bangsa Eropa, perdagangan rempah telah berkembang melalui kerja sama antara saudagar dan penguasa lokal. Saudagar mengumpulkan serta menjual rempah ke berbagai daerah, sedangkan penguasa menjaga keamanan dan mengatur perdagangan di pelabuhan. Sistem tersebut membuat rempah Nusantara dapat diperdagangkan hingga ke berbagai wilayah dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama berusaha memperoleh keuntungan dari perdagangan rempah dan memperluas pengaruhnya. Persaingan keduanya menghasilkan Perjanjian Tordesillas dan Saragosa. VOC menggunakan strategi monopoli yang didukung kekuatan militer sehingga dapat mengontrol perdagangan dan produksi rempah. Inggris melalui EIC mengembangkan jaringan perdagangan dan pos dagang, terutama di Bengkulu setelah mengurangi aktivitasnya di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan lokal seperti Ternate dan Tidore menghadapi tekanan politik, ekonomi, dan militer. Perdagangan yang sebelumnya dapat dilakukan secara lebih bebas berubah menjadi perdagangan yang dikendalikan oleh kekuatan asing. Peristiwa tersebut penting bagi kehidupan sekarang karena mengajarkan bahwa sumber daya alam merupakan aset strategis. Indonesia perlu menjaga kedaulatan, mengelola sumber daya secara berkelanjutan, dan memastikan hasilnya dapat dirasakan masyarakat.', '2026-08-14T07:15:29Z', '2026-08-14T07:15:29Z'),
  (3, 50, 1, '1. Hubungan Saudagar dan Penguasa Lokal
Sebelum bangsa Eropa datang, saudagar dan penguasa lokal memiliki hubungan yang saling menguntungkan. Saudagar bertugas mengumpulkan dan mendistribusikan rempah-rempah melalui jalur perdagangan laut, sedangkan penguasa lokal menjaga keamanan pelabuhan dan mengatur kegiatan perdagangan. Hubungan tersebut membuat bandar-bandar di Nusantara berkembang menjadi pusat perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis datang untuk memperoleh rempah-rempah dan memperluas pengaruhnya dengan menguasai jalur serta bandar perdagangan. Spanyol memiliki kepentingan yang sama dalam mencari rempah dan wilayah pengaruh, tetapi lebih banyak bergerak melalui jalur barat dan kemudian berpusat di Filipina. VOC memiliki strategi yang lebih kuat dalam menerapkan monopoli dengan kekuatan militer serta mengendalikan produksi rempah dari sumbernya. Sementara itu, Inggris melalui EIC berusaha membangun jaringan perdagangan dan pos dagang, terutama di Banten, Maluku, dan kemudian Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan kerajaan seperti Ternate dan Tidore berada dalam tekanan dan harus menghadapi campur tangan asing dalam perdagangan. Kebebasan kerajaan untuk menentukan perdagangan rempah semakin berkurang karena bangsa Eropa berusaha menguasai sumber rempah. Peristiwa ini masih relevan karena Indonesia hingga sekarang memiliki banyak sumber daya alam yang bernilai tinggi sehingga harus dikelola untuk kepentingan masyarakat Indonesia, bukan hanya untuk kepentingan pihak yang memiliki kekuatan ekonomi.', '2026-08-14T07:15:53Z', '2026-08-14T07:15:53Z'),
  (3, 12, 2, '1. Hubungan Saudagar dan Penguasa Lokal
Perdagangan rempah di Nusantara berkembang karena adanya kerja sama antara saudagar dan penguasa lokal. Saudagar membawa rempah dari daerah penghasil menuju berbagai bandar, sedangkan penguasa memberikan perlindungan dan mengatur aktivitas perdagangan. Dengan adanya kerja sama tersebut, perdagangan cengkih, pala, dan lada dapat berkembang hingga menjangkau pedagang dari Arab, India, Cina, dan Eropa.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai perdagangan melalui pelabuhan dan jalur pelayaran menuju sumber rempah. Spanyol juga mencari rempah melalui jalur pelayaran barat sehingga kemudian terjadi persaingan dengan Portugis di Maluku. VOC menggunakan monopoli perdagangan yang didukung kekuatan militer dan bahkan mengatur jumlah tanaman rempah yang boleh ditanam. Inggris melalui EIC lebih mengandalkan jaringan pos perdagangan dan akhirnya menjadikan Bengkulu sebagai salah satu pusat perdagangan lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Kerajaan Ternate dan Tidore menjadi bagian dari persaingan bangsa Eropa karena wilayah mereka menghasilkan cengkih yang sangat bernilai. Campur tangan bangsa Eropa menyebabkan kerajaan lokal tidak lagi sepenuhnya bebas mengatur perdagangan. Hal ini relevan dengan kondisi Indonesia saat ini karena kekayaan alam seperti minyak, gas, mineral, dan hasil perkebunan juga dapat menjadi sumber persaingan. Oleh sebab itu, sumber daya alam harus dikelola secara bijaksana dan memberikan manfaat bagi masyarakat.', '2026-08-14T07:16:22Z', '2026-08-14T07:16:22Z'),
  (3, 51, 5, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar memiliki peranan penting sebagai penghubung antara daerah penghasil rempah dengan pasar di berbagai wilayah. Penguasa lokal memberikan perlindungan terhadap kegiatan perdagangan dan mengatur pelabuhan. Hubungan tersebut menciptakan kondisi yang mendukung berkembangnya perdagangan cengkih, pala, dan lada di Nusantara.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha mendapatkan rempah sekaligus memperluas pengaruhnya melalui penguasaan pelabuhan dan jalur perdagangan. Spanyol juga mengejar rempah tetapi akhirnya memusatkan kegiatan di Filipina setelah Perjanjian Saragosa. VOC memiliki kepentingan mempertahankan monopoli dan menggunakan kekuatan militer untuk mengontrol sumber rempah. Inggris melalui EIC mengembangkan pos-pos dagang dan kemudian mempertahankan kepentingannya di Bengkulu sebagai daerah penghasil lada.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan Eropa membuat kerajaan lokal sulit mempertahankan kebebasan perdagangan. Ternate dan Tidore menjadi wilayah penting karena menghasilkan cengkih sehingga menjadi sasaran kepentingan Portugis, Spanyol, dan kemudian Belanda. Peristiwa tersebut relevan dengan Indonesia sekarang karena sumber daya alam yang bernilai tinggi dapat menarik kepentingan ekonomi dari berbagai pihak. Pengelolaannya harus memperhatikan kesejahteraan masyarakat dan kepentingan nasional.', '2026-08-14T07:16:55Z', '2026-08-14T07:16:55Z'),
  (3, 56, 7, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan yang saling membutuhkan. Saudagar membutuhkan perlindungan dan tempat berdagang, sementara kerajaan memperoleh keuntungan dari aktivitas perdagangan yang berlangsung di wilayahnya. Hubungan tersebut membuat berbagai kerajaan dan bandar di Nusantara menjadi bagian dari jaringan perdagangan internasional.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha menguasai jalur dan bandar perdagangan untuk memperoleh rempah. Spanyol juga ingin memperoleh rempah dan memperluas wilayah pengaruhnya, tetapi kemudian memusatkan kegiatan di Filipina. VOC berbeda karena berusaha mengontrol langsung sumber rempah melalui monopoli dan tindakan militer. Inggris lebih banyak mengandalkan jaringan pos dagang dan perdagangan lada, terutama di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan-kerajaan seperti Ternate dan Tidore menjadi sasaran perebutan pengaruh. Campur tangan bangsa Eropa mengurangi kebebasan kerajaan dalam menentukan perdagangan dan hubungan dengan pihak luar. Peristiwa ini masih relevan karena Indonesia mempunyai banyak kekayaan alam yang berharga. Jika tidak dikelola dengan baik, kekayaan tersebut dapat menimbulkan konflik dan ketimpangan, sehingga diperlukan pengelolaan yang adil dan berkelanjutan.', '2026-08-14T07:17:03Z', '2026-08-14T07:17:03Z'),
  (3, 22, 3, '1. Hubungan Saudagar dan Penguasa Lokal
Saudagar dan penguasa lokal memiliki hubungan ekonomi dan politik yang saling mendukung. Saudagar memperoleh kesempatan untuk melakukan perdagangan di wilayah kerajaan, sedangkan penguasa lokal mendapatkan keuntungan dari berkembangnya aktivitas perdagangan di pelabuhan. Penguasa juga bertanggung jawab menjaga keamanan sehingga para saudagar dapat melakukan kegiatan perdagangan dengan lebih aman.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis berusaha memperoleh rempah dan menguasai jalur perdagangan dari Eropa menuju Asia. Spanyol melakukan pelayaran melalui arah barat dan kemudian bersaing dengan Portugis untuk mendapatkan pengaruh di Maluku. VOC menggunakan hak istimewanya untuk membangun monopoli dan mempertahankannya dengan kekuatan militer. Inggris melalui EIC juga mencari keuntungan dari perdagangan rempah, tetapi setelah mengalami persaingan dengan Belanda di Maluku, Inggris lebih memusatkan perdagangannya di India dan tetap mempertahankan pos di Bengkulu.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa membuat kerajaan lokal kehilangan sebagian kebebasan dalam perdagangan. Ternate dan Tidore harus menghadapi kepentingan Portugis dan Spanyol yang ingin memperoleh pengaruh di Maluku. Kemudian VOC juga memperkuat monopoli sehingga masyarakat dan kerajaan lokal mengalami tekanan. Peristiwa tersebut relevan karena menunjukkan bahwa kekayaan alam yang besar dapat menjadi sumber konflik apabila tidak dikelola dengan kedaulatan dan kepentingan masyarakat.', '2026-08-14T07:17:39Z', '2026-08-14T07:17:39Z'),
  (3, 32, 4, '1. Hubungan Saudagar dan Penguasa Lokal
Hubungan saudagar dan penguasa lokal dapat dikatakan sebagai hubungan kerja sama dalam kegiatan ekonomi. Saudagar membutuhkan keamanan dan akses terhadap pelabuhan, sedangkan penguasa lokal membutuhkan aktivitas perdagangan untuk meningkatkan kemakmuran kerajaan. Karena itu, perdagangan rempah dapat berkembang dan menjadikan Nusantara sebagai salah satu pusat perdagangan dunia.

2. Perbandingan Kepentingan dan Strategi Bangsa Eropa
Portugis dan Spanyol sama-sama mencari keuntungan dari perdagangan rempah, tetapi menggunakan jalur pelayaran yang berbeda. Portugis bergerak ke arah timur melalui Afrika dan India, sedangkan Spanyol bergerak ke arah barat. VOC kemudian menggunakan strategi monopoli yang lebih ketat dengan mengendalikan perdagangan dan produksi rempah. Inggris melalui EIC menggunakan jaringan pos dagang dan menjadikan Bengkulu sebagai salah satu pusat perdagangan lada setelah mengurangi persaingan di Maluku.

3. Dampak Persaingan terhadap Kerajaan Lokal
Persaingan bangsa Eropa menyebabkan wilayah kerajaan lokal menjadi sasaran kepentingan asing. Ternate dan Tidore tidak hanya menghadapi persaingan perdagangan, tetapi juga tekanan politik dan militer. Pengalaman tersebut penting untuk dipahami saat ini karena sumber daya alam Indonesia memiliki nilai ekonomi tinggi. Indonesia perlu memastikan bahwa pengelolaan sumber daya alam tidak menyebabkan ketergantungan dan kerugian bagi masyarakat lokal.', '2026-08-14T07:18:24Z', '2026-08-14T07:18:24Z');

-- Pertanyaan antarkelompok. Rotasi sama seperti Pertemuan 1 & 2:
-- ketua kelompok (N+3) bertanya kepada kelompok N. Satu pertanyaan dipin guru.
INSERT INTO presentation_questions (meeting_id, student_id, target_group_id, question, is_selected, selected_at, created_at, updated_at) VALUES
  (3, 2, 1, 'Kalau dulu penguasa lokal yang menjaga keamanan pelabuhan, siapa yang memegang peran itu sekarang, dan apakah polanya masih sama?', false, NULL, '2026-08-14T07:22:36Z', '2026-08-14T07:22:36Z'),
  (3, 19, 2, 'Kelompok kalian menyebut rempah menjangkau pedagang Arab, India, dan Cina. Apakah posisi Indonesia sebagai jalur pelayaran dunia masih seramai itu sampai sekarang?', false, NULL, '2026-08-14T07:24:11Z', '2026-08-14T07:24:11Z'),
  (3, 16, 3, 'Mengapa Inggris memilih pindah ke India dan hanya menyisakan pos di Bengkulu, padahal Maluku penghasil rempah utama?', false, NULL, '2026-08-14T07:23:02Z', '2026-08-14T07:23:02Z'),
  (3, 31, 4, 'Portugis lewat timur dan Spanyol lewat barat, tetapi keduanya bertemu di Maluku. Nilai apa yang bisa kita ambil dari perebutan itu untuk hubungan antarnegara sekarang?', false, NULL, '2026-08-14T07:26:48Z', '2026-08-14T07:26:48Z'),
  (3, 3, 5, 'Setelah Perjanjian Saragosa, Spanyol pindah ke Filipina. Apakah artinya kepentingan asing benar-benar hilang, atau hanya berpindah tempat?', false, NULL, '2026-08-14T07:25:19Z', '2026-08-14T07:25:19Z'),
  (3, 5, 6, 'Kelompok kalian menyebut VOC mengatur jumlah tanaman yang boleh ditanam dan kepada siapa hasilnya dijual. Apakah cara mengendalikan komoditas seperti itu masih ada bentuknya pada masa kini?', true, '2026-08-14T11:04:12Z', '2026-08-14T07:27:33Z', '2026-08-14T07:27:33Z'),  -- dipin guru
  (3, 14, 7, 'Kalian menyebut kekayaan alam bisa menimbulkan ketimpangan. Menurut kalian, apa yang membedakan pengelolaan yang adil dengan yang tidak?', false, NULL, '2026-08-14T07:28:57Z', '2026-08-14T07:28:57Z'),
  (3, 28, 8, 'Kalian menyebut sumber daya alam sebagai aset strategis. Bagaimana caranya agar aset itu tidak berakhir seperti rempah pada masa VOC?', false, NULL, '2026-08-14T07:29:41Z', '2026-08-14T07:29:41Z');

-- Apresiasi antarkelompok. Rotasi sama seperti Pertemuan 1 & 2:
-- ketua kelompok (N+5) mengapresiasi kelompok N. Satu apresiasi dipin guru.
INSERT INTO presentation_appreciations (meeting_id, student_id, target_group_id, message, is_selected, selected_at, created_at, updated_at) VALUES
  (3, 16, 1, 'Penjelasan kalian tentang pembagian peran saudagar dan penguasa paling mudah diikuti.', false, NULL, '2026-08-14T07:30:22Z', '2026-08-14T07:30:22Z'),
  (3, 31, 2, 'Kalian menyebut komoditasnya satu per satu, cengkih, pala, dan lada, jadi terasa nyata.', false, NULL, '2026-08-14T07:31:47Z', '2026-08-14T07:31:47Z'),
  (3, 3, 3, 'Bagian tentang Inggris yang berpindah ke India dan tetap bertahan di Bengkulu jarang dibahas kelompok lain.', false, NULL, '2026-08-14T07:32:15Z', '2026-08-14T07:32:15Z'),
  (3, 5, 4, 'Perbandingan jalur timur Portugis dan jalur barat Spanyol kalian jelaskan dengan rapi.', false, NULL, '2026-08-14T07:33:04Z', '2026-08-14T07:33:04Z'),
  (3, 14, 5, 'Kalian satu-satunya yang menyebut Perjanjian Saragosa sebagai alasan Spanyol pindah ke Filipina.', false, NULL, '2026-08-14T07:34:29Z', '2026-08-14T07:34:29Z'),
  (3, 28, 6, 'Kelompok kalian berani melanjutkan sampai rakyat kehilangan penghidupan dan muncul perlawanan. Itu bagian yang paling membuat kami berpikir.', true, '2026-08-14T11:04:31Z', '2026-08-14T07:29:58Z', '2026-08-14T07:29:58Z'),  -- dipin guru
  (3, 2, 7, 'Kalimat penutup kalian tentang pengelolaan yang adil dan berkelanjutan terasa pas.', false, NULL, '2026-08-14T07:35:33Z', '2026-08-14T07:35:33Z'),
  (3, 19, 8, 'Kalian menutup dengan tiga hal sekaligus, kedaulatan, keberlanjutan, dan manfaat bagi masyarakat.', false, NULL, '2026-08-14T07:36:07Z', '2026-08-14T07:36:07Z');

-- Penghargaan kelompok. Kelompok 6 dipin sebagai kelompok terbaik.
INSERT INTO group_awards (meeting_id, group_id, message, is_best, best_note, created_at, updated_at) VALUES
  (3, 1, 'Kalian membuka tanggapan dengan menyebut hubungan saudagar dan penguasa sebagai hubungan yang saling menguntungkan, lalu konsisten memakai kerangka itu sampai bagian terakhir. Keempat kekuatan Eropa kalian bedakan satu per satu, termasuk menyebut Banten dan Maluku sebelum Inggris berpindah ke Bengkulu. Bagian relevansinya juga tegas, bahwa kekayaan alam harus dikelola untuk kepentingan masyarakat Indonesia, bukan untuk pihak yang memiliki kekuatan ekonomi. Lain kali, coba tambahkan satu contoh nyata masa kini supaya kalimat penutup itu makin berpijak.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),
  (3, 2, 'Yang membedakan kelompok kalian adalah keberanian menyebut hal-hal yang konkret. Di bagian pertama kalian tidak berhenti pada kata rempah, tetapi menyebut cengkih, pala, dan lada, lalu melanjutkan sampai pedagang Arab, India, Cina, dan Eropa. Di bagian relevansi kalian juga menyebut minyak, gas, mineral, dan hasil perkebunan. Cara seperti ini membuat argumen kalian sulit dibantah karena jelas apa yang sedang dibicarakan. Pertahankan, dan berikutnya coba jelaskan juga mengapa VOC merasa perlu mengatur jumlah tanaman.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),
  (3, 3, 'Kalian satu-satunya kelompok yang menjelaskan mengapa Inggris berpindah ke India, yaitu setelah mengalami persaingan dengan Belanda di Maluku, sambil tetap mempertahankan pos di Bengkulu. Detail itu penting karena menunjukkan kepentingan asing tidak lenyap, hanya berpindah bentuk dan tempat. Kalian juga tepat menempatkan hak istimewa sebagai dasar monopoli VOC. Catatan untuk berikutnya, bagian pertama kalian masih berhenti pada keuntungan ekonomi, padahal kalian sudah menyebut hubungan itu bersifat politik juga.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),
  (3, 4, 'Perbandingan jalur kalian paling jelas di antara semua kelompok. Portugis ke timur melalui Afrika dan India, Spanyol ke barat, dua arah berbeda yang berakhir bertemu di tempat yang sama. Kalian juga menutup dengan peringatan yang jarang muncul di kelompok lain, yaitu soal ketergantungan dan kerugian bagi masyarakat lokal. Yang perlu diperkuat, bagian kedua kalian menyebut Inggris mengurangi persaingan di Maluku tanpa menjelaskan apa yang menyebabkannya.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),
  (3, 5, 'Kalian satu-satunya yang menyebut Perjanjian Saragosa sebagai sebab Spanyol memusatkan kegiatan di Filipina. Menghubungkan sebuah kesepakatan dengan akibatnya di lapangan adalah cara berpikir sejarah yang benar, bukan sekadar mengingat nama perjanjian. Bagian pertama kalian juga tepat menempatkan saudagar sebagai penghubung antara daerah penghasil dan pasar. Untuk berikutnya, bagian relevansi kalian masih terasa umum dan bisa diperkuat dengan satu contoh yang spesifik.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),
  (3, 6, 'Kelompok kalian adalah satu-satunya yang meneruskan rantai penjelasan sampai ke ujungnya. Kelompok lain berhenti pada kerajaan yang kehilangan kebebasan berdagang, sedangkan kalian melanjutkan bahwa monopoli VOC mengatur jumlah tanaman yang boleh ditanam dan kepada siapa hasilnya dijual, lalu masyarakat kehilangan sebagian sumber penghidupannya, dan akhirnya muncul berbagai perlawanan. Empat mata rantai, tidak ada yang dilompati, dan sampai ke orang biasa yang terkena dampaknya. Bagian relevansinya pun paling tajam karena kalian tidak berhenti pada kalimat sumber daya alam harus dikelola dengan baik, melainkan menyebut siapa yang harus dilibatkan, yaitu masyarakat lokal di wilayah tempat kekayaan itu berada. Dengan empat anggota, hasil kalian melampaui kelompok yang lebih besar.', true, 'Satu-satunya kelompok yang meneruskan rantai penjelasan sampai ke rakyat biasa, dari monopoli VOC yang mengatur jumlah tanaman, ke hilangnya sumber penghidupan, sampai munculnya perlawanan. Bagian relevansinya juga paling tajam karena menyebut siapa yang harus dilibatkan, bukan sekadar mengatakan sumber daya alam harus dikelola dengan baik.', '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),  -- kelompok terbaik
  (3, 7, 'Bagian penutup kalian paling matang. Kalian menyebut bahwa kekayaan alam yang tidak dikelola dengan baik dapat menimbulkan konflik dan ketimpangan, dua akibat sekaligus, lalu menutupnya dengan syarat pengelolaan yang adil dan berkelanjutan. Kalian juga tepat menangkap bahwa campur tangan Eropa mengurangi kebebasan kerajaan bukan hanya dalam berdagang, tetapi juga dalam menjalin hubungan dengan pihak luar. Yang bisa ditingkatkan, bagian kedua kalian paling ringkas di antara semua kelompok dan masih bisa diberi contoh.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z'),
  (3, 8, 'Kalimat penutup kalian merangkum tiga hal sekaligus, yaitu menjaga kedaulatan, mengelola secara berkelanjutan, dan memastikan hasilnya dirasakan masyarakat. Itu rangkuman yang utuh dan tidak ada kelompok lain yang menyusunnya selengkap itu. Kalian juga menempatkan Tordesillas dan Saragosa sebagai hasil dari persaingan Portugis dan Spanyol, bukan sekadar dua nama perjanjian yang dihafal. Catatan kecil, bagian pertama kalian bisa lebih kuat kalau menyebut bandar atau komoditas tertentu, bukan hanya berbagai daerah.', false, NULL, '2026-08-14T11:06:24Z', '2026-08-14T11:06:24Z');

-- Refleksi siswa, 38 baris. Tahap Evaluasi menanamkan Indikator 3 (nilai & makna).
INSERT INTO reflections (meeting_id, student_id, content, created_at, updated_at) VALUES
  (3, 36, 'Saya belajar menghargai peran saudagar yang menghubungkan daerah penghasil dengan pasar dunia.', '2026-08-14T07:30:33Z', '2026-08-14T07:30:33Z'),
  (3, 11, 'Nilai yang saya ambil adalah pentingnya menjaga posisi tawar sejak awal dalam setiap kerja sama.', '2026-08-14T07:30:49Z', '2026-08-14T07:30:49Z'),
  (3, 50, 'Dari kisah Banda saya belajar bahwa keuntungan tidak boleh dicari dengan mengorbankan orang lain.', '2026-08-14T07:31:02Z', '2026-08-14T07:31:02Z'),
  (3, 2, 'Kerja sama yang setara bisa berubah menjadi penguasaan kalau salah satu pihak jauh lebih kuat.', '2026-08-14T07:31:18Z', '2026-08-14T07:31:18Z'),
  (3, 25, 'Hubungan dagang yang adil perlu dijaga supaya tidak berubah menjadi penguasaan.', '2026-08-14T07:31:55Z', '2026-08-14T07:31:55Z'),
  (3, 5, 'Kekayaan alam ternyata bisa menjadi berkah sekaligus mengundang pihak lain untuk menguasainya.', '2026-08-14T07:32:07Z', '2026-08-14T07:32:07Z'),
  (3, 49, 'Nilai yang saya ambil, keberanian bersuara itu penting agar tidak ditentukan pihak lain.', '2026-08-14T07:32:28Z', '2026-08-14T07:32:28Z'),
  (3, 19, 'Pelajaran hari ini, perpecahan di antara sesama membuat pihak luar mudah masuk.', '2026-08-14T07:32:44Z', '2026-08-14T07:32:44Z'),
  (3, 28, 'Saya sadar rempah bukan sekadar bumbu, melainkan alasan bangsa Eropa berlayar sejauh itu.', '2026-08-14T07:33:19Z', '2026-08-14T07:33:19Z'),
  (3, 3, 'Saya belajar bahwa ramainya sebuah pelabuhan lahir dari peran yang saling melengkapi, bukan dari satu pihak saja.', '2026-08-14T07:33:42Z', '2026-08-14T07:33:42Z'),
  (3, 53, 'Yang saya bawa pulang, kesetaraan dalam kerja sama perlu dijaga sejak awal, bukan setelah timpang.', '2026-08-14T07:33:57Z', '2026-08-14T07:33:57Z'),
  (3, 21, 'Kepentingan pihak asing tidak hilang ketika satu jalur tertutup, tetapi berpindah ke jalur lain.', '2026-08-14T07:34:08Z', '2026-08-14T07:34:08Z'),
  (3, 48, 'Saya belajar bahwa Inggris tidak benar-benar pergi, hanya berpindah dari Maluku ke Bengkulu.', '2026-08-14T07:34:37Z', '2026-08-14T07:34:37Z'),
  (3, 6, 'Portugis dan Spanyol berangkat dari arah yang berlawanan tetapi berebut tempat yang sama, yaitu Maluku.', '2026-08-14T07:34:55Z', '2026-08-14T07:34:55Z'),
  (3, 31, 'Nilai yang saya petik, kekayaan harus memberi manfaat bagi masyarakat di sekitarnya.', '2026-08-14T07:35:11Z', '2026-08-14T07:35:11Z'),
  (3, 14, 'Saya belajar bahwa monopoli merugikan bukan hanya kerajaan, tetapi juga rakyat yang menanam rempahnya.', '2026-08-14T07:35:33Z', '2026-08-14T07:35:33Z'),
  (3, 57, 'Nilai yang saya petik, kekayaan alam adalah aset strategis yang harus dijaga kedaulatannya.', '2026-08-14T07:35:48Z', '2026-08-14T07:35:48Z'),
  (3, 55, 'Pelajaran hari ini, pengawasan terhadap kekuatan ekonomi besar tetap dibutuhkan sampai sekarang.', '2026-08-14T07:36:14Z', '2026-08-14T07:36:14Z'),
  (3, 9, 'Dari perjalanan pala Banda saya sadar barang kecil bisa mengubah arah sejarah dunia.', '2026-08-14T07:36:20Z', '2026-08-14T07:36:20Z'),
  (3, 34, 'Yang paling berkesan, rakyat Maluku kehilangan penghidupan hanya karena aturan tanam dari VOC.', '2026-08-14T07:36:52Z', '2026-08-14T07:36:52Z'),
  (3, 16, 'Kelompok kecil pun bisa menghasilkan pekerjaan yang lengkap kalau semua anggotanya ikut berpikir.', '2026-08-14T07:37:02Z', '2026-08-14T07:37:02Z'),
  (3, 59, 'Yang paling membekas, VOC mengatur sampai ke jumlah pohon yang boleh ditanam.', '2026-08-14T07:37:29Z', '2026-08-14T07:37:29Z'),
  (3, 41, 'Hak istimewa yang terlalu besar pada satu kongsi dagang ternyata bisa mengancam kedaulatan.', '2026-08-14T07:37:46Z', '2026-08-14T07:37:46Z'),
  (3, 12, 'Ternyata perjanjian yang dibuat di Eropa bisa menentukan nasib wilayah yang tidak pernah diajak bicara.', '2026-08-14T07:38:11Z', '2026-08-14T07:38:11Z'),
  (3, 45, 'Pelajaran hari ini, bangsa yang bersatu lebih sulit dipecah oleh kepentingan dari luar.', '2026-08-14T07:38:59Z', '2026-08-14T07:38:59Z'),
  (3, 18, 'VOC bertindak seperti negara padahal hanya kongsi dagang, dan itu berbahaya.', '2026-08-14T07:39:26Z', '2026-08-14T07:39:26Z'),
  (3, 52, 'Saya belajar bahwa menguasai pengolahan lebih menentukan daripada sekadar memiliki bahan mentahnya.', '2026-08-14T07:39:52Z', '2026-08-14T07:39:52Z'),
  (3, 20, 'Saya jadi paham mengapa Ternate dan Tidore begitu diperebutkan, karena cengkihnya bernilai tinggi.', '2026-08-14T07:40:15Z', '2026-08-14T07:40:15Z'),
  (3, 46, 'Saya jadi mengerti bahwa penguasa dulu tidak hanya memerintah, tetapi juga menjamin keamanan berdagang.', '2026-08-14T07:40:41Z', '2026-08-14T07:40:41Z'),
  (3, 47, 'Kekayaan alam yang melimpah tidak otomatis membuat pemiliknya sejahtera.', '2026-08-14T07:41:09Z', '2026-08-14T07:41:09Z'),
  (3, 22, 'Menjaga kekayaan alam ternyata bukan hanya soal memilikinya, tetapi soal siapa yang mengolahnya.', '2026-08-14T07:41:37Z', '2026-08-14T07:41:37Z'),
  (3, 58, 'Saya belajar bahwa perlawanan rakyat Maluku muncul karena penghidupan mereka diambil.', '2026-08-14T07:41:58Z', '2026-08-14T07:41:58Z'),
  (3, 35, 'Persaingan antarbangsa Eropa membuat kerajaan lokal terseret meski tidak menginginkannya.', '2026-08-14T07:42:24Z', '2026-08-14T07:42:24Z'),
  (3, 54, 'Saya jadi paham bahwa bandar Nusantara ramai karena ada aturan dan keamanan, bukan kebetulan.', '2026-08-14T07:42:51Z', '2026-08-14T07:42:51Z'),
  (3, 24, 'Saya belajar bahwa sejarah bukan sekadar hafalan tahun, tetapi sebab dan akibat yang saling terkait.', '2026-08-14T07:43:02Z', '2026-08-14T07:43:02Z'),
  (3, 51, 'Ternyata satu perjanjian di Eropa bisa memicu perebutan di kepulauan yang sangat jauh.', '2026-08-14T07:43:33Z', '2026-08-14T07:43:33Z'),
  (3, 56, 'Saya baru sadar Indonesia masih berada di posisi silang jalur pelayaran dunia sampai hari ini.', '2026-08-14T07:44:05Z', '2026-08-14T07:44:05Z'),
  (3, 32, 'Saya baru tahu Bengkulu pernah menjadi pusat perdagangan lada milik Inggris.', '2026-08-14T07:44:48Z', '2026-08-14T07:44:48Z');

COMMIT;
