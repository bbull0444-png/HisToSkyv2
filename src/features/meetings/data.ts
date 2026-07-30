import type { Meeting } from "./types";

const topics: Array<Pick<Meeting, "title" | "subtitle" | "pemberianTeks">> = [
  {
    title: "JALUR REMPAH & INTERKONEKSI NUSANTARA ",
    subtitle: "Nusantara Sebagai Melting Pot Kebudayaan",
    pemberianTeks:
      "JALUR REMPAH & INTERKONEKSI NUSANTARA.",
  },
  {
    title: "VOC dan Monopoli Perdagangan",
    subtitle: "Berdirinya kongsi dagang Belanda 1602",
    pemberianTeks:
      "Vereenigde Oostindische Compagnie (VOC) didirikan pada 20 Maret 1602 sebagai kongsi dagang Belanda dengan hak-hak istimewa (hak oktroi). VOC menerapkan monopoli perdagangan rempah-rempah dan sistem pelayaran hongi yang menindas rakyat Maluku.",
  },
  {
    title: "Perlawanan Rakyat terhadap Kolonialisme",
    subtitle: "Dari Sultan Hasanuddin sampai Pattimura",
    pemberianTeks:
      "Berbagai perlawanan muncul di seluruh Nusantara: Sultan Hasanuddin di Makassar, Pattimura di Maluku, Pangeran Diponegoro di Jawa, Tuanku Imam Bonjol di Sumatera Barat, dan Sisingamangaraja XII di Tapanuli. Meskipun bersifat kedaerahan, perlawanan ini menjadi cikal-bakal kesadaran nasional.",
  },
  {
    title: "Politik Etis dan Pergerakan Nasional",
    subtitle: "Edukasi, Irigasi, dan Emigrasi",
    pemberianTeks:
      "Politik Etis (1901) yang digagas Van Deventer melahirkan generasi terpelajar pribumi. Dari sinilah lahir organisasi Budi Utomo (1908), Sarekat Islam (1911), dan Indische Partij (1912) yang menandai era pergerakan nasional Indonesia.",
  },
  {
    title: "Sumpah Pemuda dan Kesadaran Kebangsaan",
    subtitle: "Kongres Pemuda II, 28 Oktober 1928",
    pemberianTeks:
      "Kongres Pemuda II di Jakarta menghasilkan Sumpah Pemuda: satu tanah air, satu bangsa, dan satu bahasa Indonesia. Momentum ini menyatukan berbagai organisasi pemuda kedaerahan menjadi satu identitas nasional.",
  },
  {
    title: "Pendudukan Jepang di Indonesia",
    subtitle: "Romusha dan janji kemerdekaan",
    pemberianTeks:
      "Jepang menduduki Indonesia dari 1942 hingga 1945. Meskipun menjanjikan kemerdekaan melalui BPUPKI dan PPKI, rakyat mengalami penderitaan berat akibat sistem kerja paksa (romusha) dan penyerahan hasil bumi.",
  },
  {
    title: "Proklamasi Kemerdekaan Indonesia",
    subtitle: "17 Agustus 1945",
    pemberianTeks:
      "Setelah peristiwa Rengasdengklok, Soekarno dan Hatta memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945 di Jalan Pegangsaan Timur 56, Jakarta. Teks proklamasi diketik oleh Sayuti Melik dan dibacakan pukul 10.00 WIB.",
  },
  {
    title: "Perjuangan Mempertahankan Kemerdekaan",
    subtitle: "Agresi Militer & diplomasi 1945-1949",
    pemberianTeks:
      "Belanda melancarkan Agresi Militer I (1947) dan II (1948) untuk merebut kembali Indonesia. Perjuangan dilakukan lewat pertempuran (Surabaya, Ambarawa, Bandung Lautan Api) dan diplomasi (Linggarjati, Renville, Roem-Royen, hingga KMB 1949).",
  },
];

export const MEETINGS: Meeting[] = topics.map((t, i) => ({
  id: i + 1,
  title: t.title,
  subtitle: t.subtitle,
  status: i < 5 ? "published" : "draft",

  pembentukanKelompok: `Pada pertemuan ke-${i + 1}, kita akan mempelajari "${t.title}". Bagi siswa ke dalam kelompok kecil secara heterogen (4-5 orang per kelompok), memperhatikan kemampuan akademik yang beragam dalam tiap kelompok.`,

  pemberianTeks: t.pemberianTeks,

  membaca: `Setiap anggota kelompok membaca teks bacaan "${t.title}" secara mandiri atau berpasangan, lalu mencatat poin-poin penting yang ditemukan.`,

  diskusi: [
    "Diskusikan dalam kelompok: apa faktor utama yang melatarbelakangi peristiwa ini?",
    "Bagaimana peran tokoh-tokoh kunci memengaruhi jalannya sejarah?",
    "Nilai-nilai apa yang dapat kita ambil untuk konteks Indonesia hari ini?",
  ],

  menulisTanggapan: `LKPD Pertemuan ${i + 1}: Susun ringkasan bacaan dalam 150-200 kata. Kemudian buat peta konsep yang menghubungkan tokoh, tempat, waktu, dan dampak dari "${t.title}".`,

  presentasi: `Setiap kelompok mempresentasikan hasil LKPD selama 5-7 menit. Kelompok lain memberi tanggapan minimal 1 pertanyaan dan 1 apresiasi.`,

  evaluasi: [
    `Apa hal baru yang kamu pelajari dari materi "${t.title}"?`,
    "Bagian mana yang masih membingungkan dan perlu penjelasan lebih lanjut?",
    "Bagaimana kamu akan menerapkan pembelajaran ini dalam memahami sejarah Indonesia secara keseluruhan?",
  ],

  penghargaan: `Kelompok dengan hasil diskusi dan presentasi terbaik pada pertemuan ${i + 1} akan mendapat apresiasi. Penilaian mempertimbangkan keaktifan, kerja sama, dan kualitas jawaban tertulis.`,
}));

export function getMeeting(id: number): Meeting | undefined {
  return MEETINGS.find((m) => m.id === id);
}