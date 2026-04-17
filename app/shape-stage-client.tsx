"use client";

import dynamic from "next/dynamic";

const ShapeStage = dynamic(() => import("./shape-stage"), {
  ssr: false
});

type ShapeStageClientProps = {
  mode: "free" | "quiz";
};

export default function ShapeStageClient({ mode }: ShapeStageClientProps) {
  return <ShapeStage mode={mode} />;
}
