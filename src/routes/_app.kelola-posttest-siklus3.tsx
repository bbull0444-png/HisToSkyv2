import { createFileRoute } from "@tanstack/react-router";
import { requireGuru } from "@/lib/route-guards";
import { KelolaTestPage } from "@/features/tests/KelolaTestPage";

export const Route = createFileRoute("/_app/kelola-posttest-siklus3")({
  beforeLoad: requireGuru,
  component: () => <KelolaTestPage title="Posttest Siklus 3" testType="posttest_siklus_3" />,
});