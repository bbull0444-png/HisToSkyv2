import type { Meeting } from "./types";

const topics: Array<Pick<Meeting, "title" | "subtitle" | "pemberianTeks">> = [
  {
    title: "JALUR REMPAH & INTERKONEKSI NUSANTARA ",
    subtitle: "Nusantara Sebagai Melting Pot Kebudayaan",
    pemberianTeks:
      "JALUR REMPAH & INTERKONEKSI NUSANTARA.",
  },
  {
    title: "JATUHNYA KONSTANTINOPEL",
    subtitle: "Great Reset Sejarah Global",
    pemberianTeks:
      "JATUHNYA KONSTANTINOPEL.",
  },
  {
    title: "SAUDAGAR & PENGUASA LOKAL NUSANTARA + PERSAINGAN VOC-PORTUGIS-SPANUYOL-INGGRIS",
    subtitle: "Gejolak kalangan Elit",
    pemberianTeks:
      "SAUDAGAR & PENGUASA LOKAL NUSANTARA + PERSAINGAN VOC-PORTUGIS-SPANUYOL-INGGRIS.",
  },
  {
    title: "PERLAWANAN DAERAH SEBELUM DAN SESUDAH ABAD KE-19",
    subtitle: "Mempertahankan Kekuasaan dan Patriotisme",
    pemberianTeks:
      "PERLAWANAN DAERAH SEBELUM DAN SESUDAH ABAD KE-19.",
  },
  {
    title: "DAMPAK EKONOMI, URBANISASI & PERTUMBUHAN KOTA, DAMPAK SOSIAL-BUDAYA",
    subtitle: "Ekonomi, Urbanisasi dan dampak lainnya",
    pemberianTeks:
      "DAMPAK EKONOMI, URBANISASI & PERTUMBUHAN KOTA, DAMPAK SOSIAL-BUDAYA.",
  },
  {
    title: "KESEHATAN & HIGIENITAS, MOBILITAS SOSIAL, SENTIMEN RASIAL, DAMPAK POLITIK ",
    subtitle: "Stratifikasi Sosial.",
    pemberianTeks:
      "KESEHATAN & HIGIENITAS, MOBILITAS SOSIAL, SENTIMEN RASIAL, DAMPAK POLITIK.",
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
