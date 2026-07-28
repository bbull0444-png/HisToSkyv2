export type LearningStage =
  "pendahuluan" | "reading" | "discussion" | "writing" | "presentation" | "reflection" | "quiz";

export interface QuizItem {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Meeting {
  id: number;
  title: string;
  subtitle: string;
  status: "published" | "draft";
  pendahuluan: string;
  reading: string;
  discussion: string[];
  writing: string;
  presentation: string;
  reflection: string[];
  quiz: QuizItem[];
}

export const STAGES: { key: LearningStage; label: string }[] = [
  { key: "pendahuluan", label: "Pendahuluan" },
  { key: "reading", label: "Reading" },
  { key: "discussion", label: "Discussion" },
  { key: "writing", label: "Writing (LKPD)" },
  { key: "presentation", label: "Presentation" },
  { key: "reflection", label: "Reflection" },
  { key: "quiz", label: "Quiz" },
];
