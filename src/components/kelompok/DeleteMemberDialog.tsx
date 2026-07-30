import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  studentName: string;

  onConfirm: () => void;
}

export default function DeleteMemberDialog({
  open,
  onOpenChange,
  studentName,
  onConfirm,
}: DeleteMemberDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus Anggota
          </AlertDialogTitle>

          <AlertDialogDescription>
            Yakin ingin menghapus{" "}
            <strong>{studentName}</strong> dari
            kelompok ini?

            <br />
            <br />

            Tindakan ini dapat dibatalkan dengan
            menambahkan siswa kembali ke kelompok.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}