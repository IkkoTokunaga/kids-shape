"use client";

import dynamic from "next/dynamic";

const ShapeStage = dynamic(() => import("./shape-stage"), {
  ssr: false
});

export default function ShapeStageClient() {
  return <ShapeStage />;
}
