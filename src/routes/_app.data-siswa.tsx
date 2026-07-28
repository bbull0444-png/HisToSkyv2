import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const students = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: ["Aisyah", "Budi", "Citra", "Dimas", "Eka", "Fajar", "Gita", "Hana", "Iqbal", "Joko"][i],
  kelas: "XI IPS 1",
  progress: 20 + ((i * 9) % 80),
  status: i % 3 === 0 ? "Aktif" : "Normal",
}));

export const Route = createFileRoute("/_app/data-siswa")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Siswa</h1>
        <p className="text-sm text-muted-foreground">Daftar siswa dan progres pembelajarannya.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Kelas XI IPS 1</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Progres</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.kelas}</TableCell>
                  <TableCell className="text-right">{s.progress}%</TableCell>
                  <TableCell>{s.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  ),
});
