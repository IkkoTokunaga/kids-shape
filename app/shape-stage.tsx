"use client";

import { useState } from "react";
import Konva from "konva";
import { Layer, Stage, Circle, Rect, RegularPolygon, Line } from "react-konva";

type ShapeType = "circle" | "square" | "triangle" | "trapezoid" | "parallelogram" | "diamond";

type ShapeItem = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  color: string;
};

const SHAPE_COLORS: Record<ShapeType, string> = {
  circle: "#A8D8EA",
  square: "#FFF3B0",
  triangle: "#FFB7B2",
  trapezoid: "#CDB4DB",
  parallelogram: "#B8E1DD",
  diamond: "#FFD166"
};

const PALETTE_SHAPES: ShapeType[] = [
  "square",
  "triangle",
  "circle",
  "trapezoid",
  "parallelogram",
  "diamond"
];

export default function ShapeStage() {
  const [selectedShape, setSelectedShape] = useState<ShapeType>("circle");
  const [shapes, setShapes] = useState<ShapeItem[]>([]);

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

  const addShape = (type: ShapeType) => {
    setShapes((currentShapes) => {
      const nextIndex = currentShapes.filter((shape) => shape.type === type).length;
      const newShape: ShapeItem = {
        id: `${type}-${nextIndex}`,
        type,
        x: 120 + ((nextIndex * 85) % 620),
        y: 120 + ((nextIndex * 60) % 260),
        color: SHAPE_COLORS[type]
      };

      return [...currentShapes, newShape];
    });
  };

  const renderPaletteShape = (type: ShapeType) => {
    const color = SHAPE_COLORS[type];

    if (type === "circle") {
      return (
        <span
          aria-hidden
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "999px",
            background: color,
            display: "inline-block"
          }}
        />
      );
    }

    if (type === "square") {
      return (
        <span
          aria-hidden
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            background: color,
            display: "inline-block"
          }}
        />
      );
    }

    if (type === "trapezoid") {
      return <svg width="24" height="24" viewBox="0 0 100 100" aria-hidden><polygon points="20,76 80,76 66,30 34,30" fill={color} /></svg>;
    }

    if (type === "parallelogram") {
      return <svg width="24" height="24" viewBox="0 0 100 100" aria-hidden><polygon points="30,24 84,24 70,76 16,76" fill={color} /></svg>;
    }

    if (type === "diamond") {
      return <svg width="24" height="24" viewBox="0 0 100 100" aria-hidden><polygon points="50,14 84,50 50,86 16,50" fill={color} /></svg>;
    }

    return <svg width="24" height="24" viewBox="0 0 100 100" aria-hidden><polygon points="50,16 84,76 16,76" fill={color} /></svg>;
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px",
          borderRadius: "12px",
          background: "#f4f6ff"
        }}
      >
        {PALETTE_SHAPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setSelectedShape(type);
              addShape(type);
            }}
            aria-label={`${type} を選択`}
            style={{
              border: selectedShape === type ? "2px solid #5470ff" : "1px solid #c6cce0",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "10px",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px"
            }}
          >
            {renderPaletteShape(type)}
          </button>
        ))}
      </div>
      <Stage width={900} height={500}>
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={60}
                  fill={shape.color}
                  draggable
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
                  }}
                />
              );
            }

            if (shape.type === "square") {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x - 60}
                  y={shape.y - 60}
                  width={120}
                  height={120}
                  cornerRadius={10}
                  fill={shape.color}
                  draggable
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
                  }}
                />
              );
            }

            if (shape.type === "trapezoid") {
              return (
                <Line
                  key={shape.id}
                  points={[
                    shape.x - 60,
                    shape.y + 48,
                    shape.x + 60,
                    shape.y + 48,
                    shape.x + 36,
                    shape.y - 48,
                    shape.x - 36,
                    shape.y - 48
                  ]}
                  fill={shape.color}
                  closed
                  draggable
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
                  }}
                />
              );
            }

            if (shape.type === "parallelogram") {
              return (
                <Line
                  key={shape.id}
                  points={[
                    shape.x - 45,
                    shape.y - 48,
                    shape.x + 75,
                    shape.y - 48,
                    shape.x + 45,
                    shape.y + 48,
                    shape.x - 75,
                    shape.y + 48
                  ]}
                  fill={shape.color}
                  closed
                  draggable
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
                  }}
                />
              );
            }

            if (shape.type === "diamond") {
              return (
                <Line
                  key={shape.id}
                  points={[
                    shape.x,
                    shape.y - 66,
                    shape.x + 58,
                    shape.y,
                    shape.x,
                    shape.y + 66,
                    shape.x - 58,
                    shape.y
                  ]}
                  fill={shape.color}
                  closed
                  draggable
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
                  }}
                />
              );
            }

            return (
              <RegularPolygon
                key={shape.id}
                x={shape.x}
                y={shape.y}
                sides={3}
                radius={75}
                fill={shape.color}
                draggable
                onDragStart={(e) => {
                  if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                }}
                onDragEnd={(e) => {
                  if (e.target instanceof Konva.Shape) animateDragging(e.target, false);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
