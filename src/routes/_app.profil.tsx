import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthContext";

export const Route = createFileRoute("/_app/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  const { user, logout } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi akunmu.</p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold">{user?.name}</div>
              <div className="text-sm text-muted-foreground capitalize">Mode: {user?.role}</div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Username</Label>
            <Input defaultValue={user?.username} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Nama tampilan</Label>
            <Input defaultValue={user?.name} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button>Simpan Perubahan</Button>
            <Button variant="outline" onClick={logout}>
              Keluar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
