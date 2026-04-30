"use client";

import dynamic from "next/dynamic";

const ShapeStage = dynamic(() => import("./shape-stage"), {
  ssr: false
});

type ShapeStageClientProps = {
  mode: "free" | "quiz-easy" | "quiz-medium" | "quiz-hard" | "quiz-oni";
  onQuizComplete?: () => void;
  onQuestionProgressChange?: (current: number, total: number) => void;
  clearRequestKey?: number;
};

export default function ShapeStageClient({
  mode,
  onQuizComplete,
  onQuestionProgressChange,
  clearRequestKey
}: ShapeStageClientProps) {
  return (
    <ShapeStage
      mode={mode}
      onQuizComplete={onQuizComplete}
      onQuestionProgressChange={onQuestionProgressChange}
      clearRequestKey={clearRequestKey}
    />
  );
}
