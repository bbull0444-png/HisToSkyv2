import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";

export const Route = createFileRoute("/")({
  component: () => (
    <AuthProvider>
      <Redirector />
    </AuthProvider>
  ),
});

function Redirector() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    navigate({ to: user ? "/dashboard" : "/login", replace: true });
  }, [user, loading, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Memuat HisToSky…
    </div>
  );
}
