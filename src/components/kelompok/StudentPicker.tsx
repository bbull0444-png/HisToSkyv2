import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Student {
  id: number;
  full_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  groupId: number;

  onAdded: () => void;
}

export default function StudentPicker({
  open,
  onOpenChange,
  groupId,
  onAdded,
}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) loadStudents();
  }, [open]);

  async function loadStudents() {
    // semua siswa yang BELUM punya kelompok
    const { data, error } = await supabase.rpc(
      "available_students"
    );

    if (error) {
      console.error(error);
      return;
    }

    setStudents(data ?? []);
  }

  async function addStudent(studentId: number) {
  const loading = toast.loading("Menambahkan anggota...");

  const { error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      student_id: studentId,
    });

  if (error) {
    toast.error("Gagal menambahkan anggota", {
      id: loading,
    });
    return;
  }

  toast.success("Anggota berhasil ditambahkan", {
      id: loading,
  });

  onOpenChange(false);
  onAdded();
}

  const filtered = useMemo(() => {
    return students.filter((s) =>
      s.full_name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">

        <DialogHeader>
          <DialogTitle>
            Tambah Anggota
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Cari siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">

          {filtered.map((student) => (
            <Button
              key={student.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => addStudent(student.id)}
            >
              {student.full_name}
            </Button>
          ))}

        </div>

      </DialogContent>
    </Dialog>
  );
}