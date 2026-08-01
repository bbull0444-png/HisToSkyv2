import { supabase } from "@/lib/supabase";
import { fetchPublishStatusMap, type PublishStatusMap } from "@/features/meetings/publishStatus";
import { fetchAllReflectionsForTeacher, type ReflectionWithStudent } from "@/features/reflections/reflections";

export interface TeacherDashboardStats {
  totalSiswa: number;
  publishStatusMap: PublishStatusMap;
  refleksiBaru24Jam: number;
  aktivitasTerbaru: ReflectionWithStudent[];
}

export async function fetchTeacherDashboardStats(): Promise<TeacherDashboardStats> {
  const [{ count: totalSiswa }, publishStatusMap, allReflections] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    fetchPublishStatusMap(),
    fetchAllReflectionsForTeacher(),
  ]);

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const refleksiBaru24Jam = allReflections.filter(
    (r) => new Date(r.created_at).getTime() >= oneDayAgo
  ).length;

  return {
    totalSiswa: totalSiswa ?? 0,
    publishStatusMap,
    refleksiBaru24Jam,
    aktivitasTerbaru: allReflections.slice(0, 3),
  };
}