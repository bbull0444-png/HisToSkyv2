import { supabase } from "@/lib/supabase";

export interface Student {
  id: number;
  full_name: string;
  class_name: string;
}

export interface Group {
  id: number;
  group_name: string;
  leader_student_id: number | null;
}

export interface GroupMember {
  id: number;
  group_id: number;
  student_id: number;
}

export async function getGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("id");

  if (error) throw error;

  return data;
}

export async function getStudents(className: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("class_name", className)
    .order("full_name");

  if (error) throw error;

  return data;
}

export async function getGroupMembers() {
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      id,
      group_id,
      student_id,
      students (
        id,
        full_name,
        class_name
      )
    `);

  if (error) throw error;

  return data;
}

export async function addMember(
  groupId: number,
  studentId: number
) {
  const { error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      student_id: studentId,
    });

  if (error) throw error;
}

export async function removeMember(
  groupId: number,
  studentId: number
) {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("student_id", studentId);

  if (error) throw error;
}

export async function setLeader(
  groupId: number,
  studentId: number | null
) {
  const { error } = await supabase
    .from("groups")
    .update({
      leader_student_id: studentId,
    })
    .eq("id", groupId);

  if (error) throw error;
}

export async function shuffleGroups() {
  const { error } = await supabase.rpc("shuffle_groups");

  if (error) throw error;
}