import { createFileRoute } from "@tanstack/react-router";
import { requireSiswa } from "@/lib/route-guards";
import { TestTaker } from "@/features/tests/TestTaker";

// Tanpa `loader`: TestTaker sengaja mengambil soal & attempt-nya sendiri di
// useEffect, karena identitas siswa cuma ada di localStorage yang tidak bisa
// dibaca saat SSR (lihat catatan di TestTaker.tsx).
export const Route = createFileRoute("/_app/pretest")({
  beforeLoad: requireSiswa,
  component: () => (
    <TestTaker
      title="Pretest"
      description="Uji pemahaman awalmu sebelum memulai rangkaian pembelajaran CIRC."
      testType="pretest"
    />
  ),
});
