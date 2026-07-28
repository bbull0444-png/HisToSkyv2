import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/pengaturan")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">Konfigurasi kelas dan preferensi aplikasi.</p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Kelas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nama Kelas</Label>
            <Input defaultValue="XI IPS 1" />
          </div>
          <div className="grid gap-2">
            <Label>Tahun Ajaran</Label>
            <Input defaultValue="2025/2026" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Auto-publish materi</div>
              <div className="text-xs text-muted-foreground">Publikasikan otomatis saat siap</div>
            </div>
            <Switch />
          </div>
          <Button>Simpan</Button>
        </CardContent>
      </Card>
    </div>
  ),
});
