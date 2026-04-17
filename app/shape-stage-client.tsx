"use client";

import dynamic from "next/dynamic";

const ShapeStage = dynamic(() => import("./shape-stage"), {
  ssr: false
});

type ShapeStageClientProps = {
  mode: "free" | "quiz-easy" | "quiz-medium" | "quiz-hard";
};

export default function ShapeStageClient({ mode }: ShapeStageClientProps) {
  return <ShapeStage mode={mode} />;
}
