export type LearningStage =
  | "pembentukanKelompok"
  | "pemberianTeks"
  | "membaca"
  | "diskusi"
  | "menulisTanggapan"
  | "presentasi"
  | "evaluasi"
  | "penghargaan";

/**
 * Status progres pengerjaan pertemuan DARI SUDUT PANDANG SISWA.
 * Berbeda dari `Meeting.status` ("published"/"draft") yang dikontrol guru.
 */
export type MeetingProgressStatus = "locked" | "not-started" | "in-progress" | "completed";

export interface Meeting {
  id: number;
  title: string;
  subtitle: string;
  status: "published" | "draft";

  pembentukanKelompok: string;
  pemberianTeks: string;
  membaca: string;
  diskusi: string[];
  menulisTanggapan: string;
  presentasi: string;
  evaluasi: string[];
  penghargaan: string;
}

export const STAGES: { key: LearningStage; label: string }[] = [
  {
    key: "pembentukanKelompok",
    label: "Pembentukan Kelompok Belajar",
  },
  {
    key: "pemberianTeks",
    label: "Pemberian Teks Bacaan",
  },
  {
    key: "membaca",
    label: "Membaca dan Memahami Teks",
  },
  {
    key: "diskusi",
    label: "Diskusi Isi Bacaan",
  },
  {
    key: "menulisTanggapan",
    label: "Menulis Tanggapan",
  },
  {
    key: "presentasi",
    label: "Presentasi Hasil Kelompok",
  },
  {
    key: "evaluasi",
    label: "Evaluasi Pembelajaran",
  },
  {
    key: "penghargaan",
    label: "Penghargaan Kelompok",
  },
];