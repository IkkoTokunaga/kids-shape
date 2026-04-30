"use client";

import dynamic from "next/dynamic";

const ShapeStage = dynamic(() => import("./shape-stage"), {
  ssr: false
});

type ShapeStageClientProps = {
  mode: "free" | "quiz-easy" | "quiz-medium" | "quiz-hard" | "quiz-oni";
  onQuizComplete?: () => void;
};

export default function ShapeStageClient({ mode, onQuizComplete }: ShapeStageClientProps) {
  return <ShapeStage mode={mode} onQuizComplete={onQuizComplete} />;
}
