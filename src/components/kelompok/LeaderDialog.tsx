import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

interface Student {
  id: number;
  full_name: string;
}

interface LeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  groupId: number;

  leaderId: number | null;

  members: Student[];

  onSaved: () => void;
}

export default function LeaderDialog({
  open,
  onOpenChange,
  groupId,
  leaderId,
  members,
  onSaved,
}: LeaderDialogProps) {
  const [selected, setSelected] = useState(
    leaderId?.toString() ?? ""
  );

  useEffect(() => {
  setSelected(leaderId?.toString() ?? "");
}, [leaderId, open]);

  async function saveLeader() {
  const loading = toast.loading("Menyimpan ketua kelompok...");

  const { error } = await supabase
    .from("groups")
    .update({
      leader_student_id:
        selected === "" ? null : Number(selected),
    })
    .eq("id", groupId);

  if (error) {
    console.error(error);

    toast.error("Gagal memperbarui ketua kelompok", {
      id: loading,
    });

    return;
  }

  toast.success("Ketua kelompok berhasil diperbarui", {
    id: loading,
  });

  onSaved();
  onOpenChange(false);
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Pilih Ketua Kelompok
          </DialogTitle>
        </DialogHeader>

        <Select
          value={selected}
          onValueChange={setSelected}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Ketua" />
          </SelectTrigger>

          <SelectContent>

            {members.map((student) => (
              <SelectItem
                key={student.id}
                value={student.id.toString()}
              >
                {student.full_name}
              </SelectItem>
            ))}

          </SelectContent>
        </Select>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>

          <Button onClick={saveLeader}>
            Simpan
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}