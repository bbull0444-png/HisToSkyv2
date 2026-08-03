import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";

import GroupCard from "@/components/kelompok/GroupCard";
import ShuffleDialog from "@/components/kelompok/ShuffleDialog";
import { requireGuru } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/kelola-kelompok")({
  beforeLoad: requireGuru,
  component: KelolaKelompokPage,
});

type Student = {
  id: number;
  full_name: string;
};

type Group = {
  id: number;
  group_name: string;
  leader_student_id: number | null;
  group_members: {
    students: Student | null;
  }[];
};

function KelolaKelompokPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [shuffleOpen, setShuffleOpen] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const { data, error } = await supabase
      .from("groups")
      .select(`
        id,
        group_name,
        leader_student_id,
        group_members (
          students (
            id,
            full_name
          )
        )
      `)
      .order("id");

    if (error) {
      console.error(error);
    } else {
      setGroups(data as Group[]);
    }

    setLoading(false);
  }
async function shuffleGroups() {
  const loadingToast = toast.loading("Mengacak kelompok...");

  // Seluruh proses (reset ketua, hapus anggota lama, isi anggota baru)
  // dijalankan sebagai satu transaksi atomik di database lewat RPC
  // `shuffle_groups`, sehingga tidak ada lagi jendela waktu di mana
  // group_members kosong untuk siswa yang sedang membuka halaman materi.
  const { error } = await supabase.rpc("shuffle_groups");

  if (error) {
    toast.error("Gagal mengacak kelompok.", {
      id: loadingToast,
    });
    return;
  }

  await loadGroups();

  toast.success("Kelompok berhasil diacak.", {
    id: loadingToast,
  });

  setShuffleOpen(false);
}

  if (loading) {
    return <p>Memuat kelompok...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold">
      Kelola Kelompok
    </h1>

    <p className="text-muted-foreground">
      Daftar kelompok belajar CIRC kelas XI-12.
    </p>
  </div>

  <Button onClick={() => setShuffleOpen(true)}>
    🔀 Acak Ulang
  </Button>
</div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
  <GroupCard
    key={group.id}
    id={group.id}
    groupName={group.group_name}
    leaderId={group.leader_student_id}
    members={group.group_members
      .map((m) => m.students)
      .filter((s): s is Student => s !== null)}
    onRemove={async (studentId) => {
      const loading = toast.loading("Menghapus anggota...");

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("student_id", studentId);

      if (error) {
        toast.error("Gagal menghapus anggota", {
          id: loading,
        });
        return;
      }

      await loadGroups();

      toast.success("Anggota berhasil dihapus", {
        id: loading,
      });
    }}
    onLeaderSaved={loadGroups}
  />
))}
      </div>
      <ShuffleDialog
  open={shuffleOpen}
  onOpenChange={setShuffleOpen}
  onConfirm={shuffleGroups}
/>
    </div>
  );
}