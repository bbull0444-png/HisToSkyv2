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
import { MEETINGS } from "@/features/meetings/data";

export const Route = createFileRoute("/_app/nilai")({
  component: NilaiPage,
});

const dummyScores = MEETINGS.map((m, i) => ({
  meeting: m,
  lkpd: 70 + ((i * 7) % 25),
  quiz: 60 + ((i * 11) % 35),
}));

function NilaiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nilai Saya</h1>
        <p className="text-sm text-muted-foreground">
          Rekap nilai LKPD dan Quiz dari setiap pertemuan.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Rekap Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pertemuan</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead className="text-right">LKPD</TableHead>
                <TableHead className="text-right">Quiz</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyScores.map(({ meeting, lkpd, quiz }) => (
                <TableRow key={meeting.id}>
                  <TableCell>#{meeting.id}</TableCell>
                  <TableCell>{meeting.title}</TableCell>
                  <TableCell className="text-right">{lkpd}</TableCell>
                  <TableCell className="text-right">{quiz}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {Math.round((lkpd + quiz) / 2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
