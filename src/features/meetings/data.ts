import type { Meeting } from "./types";

const topics: Array<Pick<Meeting, "title" | "subtitle" | "reading">> = [
  {
    title: "Kedatangan Bangsa Eropa ke Indonesia",
    subtitle: "Motif 3G: Gold, Glory, Gospel",
    reading:
      "Kedatangan bangsa Eropa ke Nusantara pada abad ke-16 didorong oleh tiga motif utama yang dikenal dengan 3G: Gold (kekayaan), Glory (kejayaan), dan Gospel (penyebaran agama). Portugis menjadi bangsa Eropa pertama yang tiba di Malaka pada 1511, disusul Spanyol, Belanda, dan Inggris.",
  },
  {
    title: "VOC dan Monopoli Perdagangan",
    subtitle: "Berdirinya kongsi dagang Belanda 1602",
    reading:
      "Vereenigde Oostindische Compagnie (VOC) didirikan pada 20 Maret 1602 sebagai kongsi dagang Belanda dengan hak-hak istimewa (hak oktroi). VOC menerapkan monopoli perdagangan rempah-rempah dan sistem pelayaran hongi yang menindas rakyat Maluku.",
  },
  {
    title: "Perlawanan Rakyat terhadap Kolonialisme",
    subtitle: "Dari Sultan Hasanuddin sampai Pattimura",
    reading:
      "Berbagai perlawanan muncul di seluruh Nusantara: Sultan Hasanuddin di Makassar, Pattimura di Maluku, Pangeran Diponegoro di Jawa, Tuanku Imam Bonjol di Sumatera Barat, dan Sisingamangaraja XII di Tapanuli. Meskipun bersifat kedaerahan, perlawanan ini menjadi cikal-bakal kesadaran nasional.",
  },
  {
    title: "Politik Etis dan Pergerakan Nasional",
    subtitle: "Edukasi, Irigasi, dan Emigrasi",
    reading:
      "Politik Etis (1901) yang digagas Van Deventer melahirkan generasi terpelajar pribumi. Dari sinilah lahir organisasi Budi Utomo (1908), Sarekat Islam (1911), dan Indische Partij (1912) yang menandai era pergerakan nasional Indonesia.",
  },
  {
    title: "Sumpah Pemuda dan Kesadaran Kebangsaan",
    subtitle: "Kongres Pemuda II, 28 Oktober 1928",
    reading:
      "Kongres Pemuda II di Jakarta menghasilkan Sumpah Pemuda: satu tanah air, satu bangsa, dan satu bahasa Indonesia. Momentum ini menyatukan berbagai organisasi pemuda kedaerahan menjadi satu identitas nasional.",
  },
  {
    title: "Pendudukan Jepang di Indonesia",
    subtitle: "Romusha dan janji kemerdekaan",
    reading:
      "Jepang menduduki Indonesia dari 1942 hingga 1945. Meskipun menjanjikan kemerdekaan melalui BPUPKI dan PPKI, rakyat mengalami penderitaan berat akibat sistem kerja paksa (romusha) dan penyerahan hasil bumi.",
  },
  {
    title: "Proklamasi Kemerdekaan Indonesia",
    subtitle: "17 Agustus 1945",
    reading:
      "Setelah peristiwa Rengasdengklok, Soekarno dan Hatta memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945 di Jalan Pegangsaan Timur 56, Jakarta. Teks proklamasi diketik oleh Sayuti Melik dan dibacakan pukul 10.00 WIB.",
  },
  {
    title: "Perjuangan Mempertahankan Kemerdekaan",
    subtitle: "Agresi Militer & diplomasi 1945-1949",
    reading:
      "Belanda melancarkan Agresi Militer I (1947) dan II (1948) untuk merebut kembali Indonesia. Perjuangan dilakukan lewat pertempuran (Surabaya, Ambarawa, Bandung Lautan Api) dan diplomasi (Linggarjati, Renville, Roem-Royen, hingga KMB 1949).",
  },
];

export const MEETINGS: Meeting[] = topics.map((t, i) => ({
  id: i + 1,
  title: t.title,
  subtitle: t.subtitle,
  status: i < 5 ? "published" : "draft",
  pendahuluan: `Pada pertemuan ke-${i + 1}, kita akan mempelajari "${t.title}". Tujuan pembelajaran: memahami latar belakang, tokoh, dan dampak dari peristiwa ini terhadap perjalanan sejarah Indonesia. Aktivitas mengikuti model CIRC (Cooperative Integrated Reading and Composition).`,
  reading: t.reading,
  discussion: [
    "Diskusikan dalam kelompok: apa faktor utama yang melatarbelakangi peristiwa ini?",
    "Bagaimana peran tokoh-tokoh kunci memengaruhi jalannya sejarah?",
    "Nilai-nilai apa yang dapat kita ambil untuk konteks Indonesia hari ini?",
  ],
  writing: `LKPD Pertemuan ${i + 1}: Susun ringkasan bacaan dalam 150-200 kata. Kemudian buat peta konsep yang menghubungkan tokoh, tempat, waktu, dan dampak dari "${t.title}".`,
  presentation: `Setiap kelompok mempresentasikan hasil LKPD selama 5-7 menit. Kelompok lain memberi tanggapan minimal 1 pertanyaan dan 1 apresiasi.`,
  reflection: [
    "Apa hal baru yang kamu pelajari hari ini?",
    "Bagian mana yang masih membingungkan?",
    "Bagaimana kamu akan menerapkan pembelajaran ini?",
  ],
  quiz: [
    {
      question: `Pertanyaan 1 - Tema utama pertemuan ${i + 1} adalah?`,
      options: [t.title, "Revolusi Industri", "Perang Dunia II", "Zaman Prasejarah"],
      answerIndex: 0,
    },
    {
      question: "Model pembelajaran yang digunakan adalah?",
      options: ["CIRC", "PBL", "Jigsaw", "Direct Instruction"],
      answerIndex: 0,
    },
    {
      question: "Tahap CIRC yang menekankan menulis adalah?",
      options: ["Reading", "Writing (LKPD)", "Discussion", "Reflection"],
      answerIndex: 1,
    },
  ],
}));

export function getMeeting(id: number): Meeting | undefined {
  return MEETINGS.find((m) => m.id === id);
}
