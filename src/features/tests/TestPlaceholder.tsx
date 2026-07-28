import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export function TestPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" /> Siap memulai?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {title} berisi 20 soal pilihan ganda seputar sejarah Indonesia. Kerjakan dengan jujur —
            hasil ini digunakan sebagai data penelitian pembelajaran CIRC.
          </p>
          <Button>Mulai {title}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
