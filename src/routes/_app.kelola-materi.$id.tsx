import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CircTabs } from "@/components/kelola-materi/CircTabs";
import { CircEditorPlaceholder } from "@/components/kelola-materi/CircEditorPlaceholder";
import { STAGES, type LearningStage } from "@/features/meetings/types";
import {
  fetchMateriKonten,
  saveMateriKontenStep,
  type MateriKontenMap,
} from "@/lib/materi-konten";

export const Route = createFileRoute("/_app/kelola-materi/$id")({
  loader: async ({ params }) => {
    const meetingId = Number(params.id);
    const content = await fetchMateriKonten(meetingId);
    return { meetingId, content };
  },
  component: EditMateriPage,
});

// deskripsi singkat tiap tahap (label lengkap ambil dari STAGES di types.ts)
const STAGE_DESCRIPTIONS: Record<LearningStage, string> = {
  pembentukanKelompok: "Bagi siswa ke dalam kelompok kecil secara heterogen.",
  pemberianTeks: "Sediakan teks bacaan yang akan dipelajari kelompok.",
  membaca: "Siswa membaca dan memahami teks secara berpasangan.",
  diskusi: "Diskusi kelompok mengenai isi bacaan.",
  menulisTanggapan: "Kelompok menulis rangkuman atau tanggapan tertulis.",
  presentasi: "Perwakilan kelompok mempresentasikan hasil diskusi.",
  evaluasi: "Evaluasi/refleksi pemahaman siswa terhadap materi.",
  penghargaan: "Pemberian penghargaan/apresiasi untuk kelompok.",
};

function EditMateriPage() {
  const { meetingId, content: initialContent } = Route.useLoaderData();

  const [activeTab, setActiveTab] = useState<LearningStage>(STAGES[0].key);
  const [content, setContent] = useState<MateriKontenMap>(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const activeMeta = {
    title: STAGES.find((s) => s.key === activeTab)!.label,
    description: STAGE_DESCRIPTIONS[activeTab],
  };

  const handleContentChange = (value: string) => {
    setContent((prev) => ({ ...prev, [activeTab]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMateriKontenStep(meetingId, activeTab, content[activeTab]);
      toast.success(`${activeMeta.title} berhasil disimpan.`);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Materi #{meetingId}</h1>
        <p className="text-sm text-muted-foreground">
          Pilih sintaks CIRC di bawah, lalu isi kontennya.
        </p>
      </div>

      <CircTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <CircEditorPlaceholder
        key={activeTab}
        title={activeMeta.title}
        description={activeMeta.description}
        value={content[activeTab]}
        onChange={handleContentChange}
        placeholder={`Tulis konten untuk ${activeMeta.title.toLowerCase()}...`}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}
