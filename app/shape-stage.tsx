"use client";

import Konva from "konva";
import { Layer, Stage, Circle, Rect, RegularPolygon } from "react-konva";

export default function ShapeStage() {
  const animateDragging = (target: Konva.Shape, active: boolean) => {
    target.to({
      scaleX: active ? 1.15 : 1,
      scaleY: active ? 1.15 : 1,
      shadowColor: "rgba(0, 0, 0, 0.35)",
      shadowBlur: active ? 20 : 0,
      shadowOffsetX: active ? 8 : 0,
      shadowOffsetY: active ? 8 : 0,
      shadowOpacity: active ? 0.7 : 0,
      duration: 0.2
    });
  };

  return (
    <Stage width={900} height={500}>
      <Layer>
        <Circle
          x={150}
          y={220}
          radius={60}
          fill="#A8D8EA"
          draggable
          onDragStart={(e) => {
            if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
          }}
          onDragEnd={(e) => {
            if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
          }}
        />
        <Rect
          x={360}
          y={160}
          width={120}
          height={120}
          cornerRadius={10}
          fill="#FFF3B0"
          draggable
          onDragStart={(e) => {
            if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
          }}
          onDragEnd={(e) => {
            if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
          }}
        />
        <RegularPolygon
          x={650}
          y={220}
          sides={3}
          radius={75}
          fill="#FFB7B2"
          draggable
          onDragStart={(e) => {
            if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
          }}
          onDragEnd={(e) => {
            if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
          }}
        />
      </Layer>
    </Stage>
  );
}
