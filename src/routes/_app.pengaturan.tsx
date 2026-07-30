import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { requireGuru } from "@/lib/route-guards";

export const Route = createFileRoute("/_app/pengaturan")({
  beforeLoad: requireGuru,
  component: () => {
    const [className, setClassName] = useState("");
    const [schoolYear, setSchoolYear] = useState("");
    const [autoPublish, setAutoPublish] = useState(false);

    useEffect(() => {
  async function loadSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setClassName(data.class_name);
    setSchoolYear(data.school_year);
    setAutoPublish(data.auto_publish);
  }

  loadSettings();
  }, []);

  async function saveSettings() {
  const { error } = await supabase
    .from("settings")
    .update({
      class_name: className,
      school_year: schoolYear,
      auto_publish: autoPublish,
    })
    .eq("id", 1);

  if (error) {
    console.error(error);
    alert("Gagal menyimpan");
    return;
  }

  alert("Berhasil disimpan");
}

  return (
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
            <Input
              value={className}
             onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Tahun Ajaran</Label>
            <Input
              value={schoolYear}
               onChange={(e) => setSchoolYear(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Auto-publish materi</div>
              <div className="text-xs text-muted-foreground">Publikasikan otomatis saat siap</div>
            </div>
            <Switch
               checked={autoPublish}
               onCheckedChange={setAutoPublish}
            />
          </div>
          <Button onClick={saveSettings}>
  Simpan
</Button>
        </CardContent>
        </Card>
  </div>
  );
},
});
