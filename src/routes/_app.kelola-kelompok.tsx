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

  // Ambil semua kelompok
  const { data: allGroups, error: groupError } = await supabase
    .from("groups")
    .select("id")
    .order("id");

  if (groupError || !allGroups) {
    toast.error("Gagal mengambil data kelompok.", {
      id: loadingToast,
    });
    return;
  }

  // Ambil semua siswa
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id")
    .order("id");

  if (studentError || !students) {
    toast.error("Gagal mengambil data siswa.", {
      id: loadingToast,
    });
    return;
  }

  // Reset ketua
  await supabase
    .from("groups")
    .update({
      leader_student_id: null,
    })
    .neq("id", 0);

  // Hapus seluruh anggota
  await supabase
    .from("group_members")
    .delete()
    .neq("group_id", 0);

  // Fisher-Yates Shuffle
  const shuffled = [...students];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  const inserts = shuffled.map((student, index) => ({
    group_id: allGroups[index % allGroups.length].id,
    student_id: student.id,
  }));

  const { error: insertError } = await supabase
    .from("group_members")
    .insert(inserts);

  if (insertError) {
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