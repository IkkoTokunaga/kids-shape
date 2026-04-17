"use client";

import { useEffect, useState } from "react";
import Konva from "konva";
import { Layer, Stage, Circle, Rect, RegularPolygon, Line } from "react-konva";

type ShapeType = "circle" | "square" | "triangle" | "trapezoid" | "parallelogram" | "diamond";
type StageMode = "free" | "quiz";

type ShapeItem = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number;
  isLocked: boolean;
  color: string;
};

type TargetSlot = {
  type: ShapeType;
  x: number;
  y: number;
};

type QuestionSetting = {
  targets: TargetSlot[];
  snapDistance: number;
  snapRotationTolerance: number;
  judgeDistance: number;
  rotationTolerance: number;
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

const QUESTION_SETTINGS: QuestionSetting[] = [
  {
    targets: [{ type: "square", x: 700, y: 250 }],
    snapDistance: 18,
    snapRotationTolerance: 18,
    judgeDistance: 28,
    rotationTolerance: 12
  },
  {
    targets: [
      { type: "square", x: 650, y: 220 },
      { type: "circle", x: 770, y: 220 }
    ],
    snapDistance: 16,
    snapRotationTolerance: 16,
    judgeDistance: 24,
    rotationTolerance: 10
  },
  {
    targets: [
      { type: "triangle", x: 620, y: 230 },
      { type: "square", x: 740, y: 230 },
      { type: "circle", x: 680, y: 340 }
    ],
    snapDistance: 14,
    snapRotationTolerance: 14,
    judgeDistance: 20,
    rotationTolerance: 8
  },
  {
    targets: [
      { type: "trapezoid", x: 600, y: 220 },
      { type: "parallelogram", x: 740, y: 220 },
      { type: "diamond", x: 660, y: 330 },
      { type: "circle", x: 800, y: 330 }
    ],
    snapDistance: 12,
    snapRotationTolerance: 12,
    judgeDistance: 16,
    rotationTolerance: 6
  },
  {
    targets: [
      { type: "triangle", x: 580, y: 210 },
      { type: "square", x: 700, y: 210 },
      { type: "circle", x: 820, y: 210 },
      { type: "parallelogram", x: 640, y: 330 },
      { type: "diamond", x: 780, y: 330 }
    ],
    snapDistance: 10,
    snapRotationTolerance: 10,
    judgeDistance: 12,
    rotationTolerance: 4
  }
];

const getNormalizedRotation = (rotation: number) => {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const getEquivalentAngles = (type: ShapeType, rotation: number) => {
  const normalized = getNormalizedRotation(rotation);

  if (type === "circle") return [0];
  if (type === "square" || type === "diamond") return [0, 90, 180, 270];
  if (type === "parallelogram") return [0, 180];
  return [normalized];
};

const getMinRotationError = (type: ShapeType, rotation: number) => {
  const equivalentAngles = getEquivalentAngles(type, rotation);
  return equivalentAngles.reduce((minError, angle) => {
    const error = Math.min(angle, 360 - angle);
    return Math.min(minError, error);
  }, Number.POSITIVE_INFINITY);
};

const isCloseToSlot = (shape: ShapeItem, target: TargetSlot, setting: QuestionSetting) => {
  if (shape.type !== target.type) return false;

  const deltaX = shape.x - target.x;
  const deltaY = shape.y - target.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance > setting.judgeDistance) return false;

  const minRotationError = getMinRotationError(shape.type, shape.rotation);
  return minRotationError <= setting.rotationTolerance;
};

const findNearestSlot = (
  shape: ShapeItem,
  targets: TargetSlot[],
  setting: QuestionSetting
): TargetSlot | null => {
  const rotationError = getMinRotationError(shape.type, shape.rotation);
  if (rotationError > setting.snapRotationTolerance) return null;

  const sameTypeTargets = targets.filter((target) => target.type === shape.type);
  if (sameTypeTargets.length === 0) return null;

  let nearest: TargetSlot | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const target of sameTypeTargets) {
    const deltaX = shape.x - target.x;
    const deltaY = shape.y - target.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = target;
    }
  }

  if (!nearest || nearestDistance > setting.snapDistance) return null;
  return nearest;
};

type ShapeStageProps = {
  mode: StageMode;
};

const BASE_STAGE_WIDTH = 900;
const BASE_STAGE_HEIGHT = 500;

export default function ShapeStage({ mode }: ShapeStageProps) {
  const [selectedShape, setSelectedShape] = useState<ShapeType>("circle");
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [matchedTargetIndices, setMatchedTargetIndices] = useState<number[]>([]);
  const [isAllSolved, setIsAllSolved] = useState(false);
  const [judgeResult, setJudgeResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [viewportSize, setViewportSize] = useState({ width: 1280, height: 720 });
  const isQuizMode = mode === "quiz";
  const currentQuestion = QUESTION_SETTINGS[questionIndex];

  const unmatchedTargets = currentQuestion.targets.filter((_, idx) => !matchedTargetIndices.includes(idx));
  const availableWidth = Math.max(360, viewportSize.width - 80);
  const availableHeight = Math.max(220, viewportSize.height - 360);
  const stageScale = Math.min(1, availableWidth / BASE_STAGE_WIDTH, availableHeight / BASE_STAGE_HEIGHT);
  const scaledStageWidth = Math.round(BASE_STAGE_WIDTH * stageScale);
  const scaledStageHeight = Math.round(BASE_STAGE_HEIGHT * stageScale);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  const animateDragging = (target: Konva.Shape, active: boolean) => {
    target.to({
      scaleX: active ? 1.04 : 1,
      scaleY: active ? 1.04 : 1,
      shadowColor: "rgba(0, 0, 0, 0.35)",
      shadowBlur: active ? 12 : 0,
      shadowOffsetX: active ? 4 : 0,
      shadowOffsetY: active ? 4 : 0,
      shadowOpacity: active ? 0.45 : 0,
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
        rotation: 0,
        isLocked: false,
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

  const renderTargetSlot = (target: TargetSlot, isMatched: boolean, key: string) => {
    const sharedProps = {
      fill: isMatched ? "rgba(47, 158, 68, 0.2)" : "rgba(27, 40, 83, 0.08)",
      stroke: isMatched ? "rgba(47, 158, 68, 0.6)" : "rgba(27, 40, 83, 0.24)",
      strokeWidth: 2,
      shadowColor: "rgba(0, 0, 0, 0.18)",
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      listening: false
    };

    if (target.type === "circle") {
      return <Circle key={key} x={target.x} y={target.y} radius={60} {...sharedProps} />;
    }

    if (target.type === "square") {
      return <Rect key={key} x={target.x - 60} y={target.y - 60} width={120} height={120} cornerRadius={10} {...sharedProps} />;
    }

    if (target.type === "trapezoid") {
      return (
        <Line
          key={key}
          x={target.x}
          y={target.y}
          points={[-60, 48, 60, 48, 36, -48, -36, -48]}
          closed
          {...sharedProps}
        />
      );
    }

    if (target.type === "parallelogram") {
      return (
        <Line
          key={key}
          x={target.x}
          y={target.y}
          points={[-45, -48, 75, -48, 45, 48, -75, 48]}
          closed
          {...sharedProps}
        />
      );
    }

    if (target.type === "diamond") {
      return (
        <Line
          key={key}
          x={target.x}
          y={target.y}
          points={[0, -66, 58, 0, 0, 66, -58, 0]}
          closed
          {...sharedProps}
        />
      );
    }

    return <RegularPolygon key={key} x={target.x} y={target.y} sides={3} radius={75} {...sharedProps} />;
  };

  const rotateShapeById = (id: string) => {
    if (isQuizMode && judgeResult === "wrong") setJudgeResult("idle");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        if (shape.id !== id || shape.isLocked) return shape;
        return { ...shape, rotation: shape.rotation + 90 };
      })
    );
  };

  const handleDragEndById = (id: string, x: number, y: number) => {
    if (isQuizMode && judgeResult === "wrong") setJudgeResult("idle");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        if (shape.id !== id || shape.isLocked) return shape;
        const movedShape = { ...shape, x, y };

        if (isQuizMode) {
          const nearestTarget = findNearestSlot(movedShape, unmatchedTargets, currentQuestion);
          if (!nearestTarget) return movedShape;

          return {
            ...movedShape,
            x: nearestTarget.x,
            y: nearestTarget.y
          };
        }

        return movedShape;
      })
    );
  };

  const judgeByOkButton = () => {
    if (!isQuizMode) return;
    if (isAllSolved) return;

    const usedShapeIds = new Set<string>();
    const nextMatchedIndices: number[] = [];

    currentQuestion.targets.forEach((target, targetIndex) => {
      if (matchedTargetIndices.includes(targetIndex)) return;

      const matchedShape = shapes.find((shape) => {
        if (shape.isLocked) return false;
        if (usedShapeIds.has(shape.id)) return false;
        return isCloseToSlot(shape, target, currentQuestion);
      });

      if (!matchedShape) return;
      usedShapeIds.add(matchedShape.id);
      nextMatchedIndices.push(targetIndex);
    });

    if (nextMatchedIndices.length === 0) {
      setJudgeResult("wrong");
      return;
    }

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        const matchedEntry = currentQuestion.targets.find((target, targetIndex) => {
          if (!nextMatchedIndices.includes(targetIndex)) return false;
          return isCloseToSlot(shape, target, currentQuestion);
        });
        if (!matchedEntry || shape.isLocked) return shape;

        return { ...shape, x: matchedEntry.x, y: matchedEntry.y, rotation: 0, isLocked: true };
      })
    );

    const updatedMatchedIndices = [...matchedTargetIndices, ...nextMatchedIndices];
    setMatchedTargetIndices(updatedMatchedIndices);
    setJudgeResult("correct");

    const isQuestionSolved = updatedMatchedIndices.length === currentQuestion.targets.length;
    if (isQuestionSolved) {
      const isLastQuestion = questionIndex === QUESTION_SETTINGS.length - 1;
      if (isLastQuestion) {
        setIsAllSolved(true);
        return;
      }

      window.setTimeout(() => {
        setQuestionIndex((current) => current + 1);
        setShapes([]);
        setMatchedTargetIndices([]);
        setJudgeResult("idle");
      }, 700);
      return;
    }

    window.setTimeout(() => {
      setJudgeResult("idle");
    }, 700);
  };

  const clearScreen = () => {
    setShapes([]);
    if (isQuizMode && !isAllSolved) {
      setMatchedTargetIndices([]);
      setJudgeResult("idle");
    }
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
        {isQuizMode && (
          <span style={{ fontWeight: 700, color: "#44506b", minWidth: "68px" }}>
            {`第${questionIndex + 1}問`}
          </span>
        )}
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
        <button
          type="button"
          onClick={clearScreen}
          style={{
            border: "1px solid #c6cce0",
            background: "#ffffff",
            color: "#36405f",
            borderRadius: "10px",
            padding: "10px 12px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          画面をクリア
        </button>
      </div>
      <p
        style={{
          margin: 0,
          minHeight: "1.6em",
          color: !isQuizMode ? "#44506b" : judgeResult === "correct" ? "#2f9e44" : judgeResult === "wrong" ? "#cc3344" : "#44506b",
          fontWeight: 700
        }}
      >
        {!isQuizMode
          ? "好きな形を置いて、ドラッグや回転で自由に遊ぼう"
          : isAllSolved
            ? "5問クリア！ぜんぶせいかい！すごい 🎊"
            : judgeResult === "correct"
              ? "せいかい！ ぴったりはまったね 🎉"
              : judgeResult === "wrong"
                ? "まだちがうよ。位置と向きをもう少し合わせてみよう"
                : `くぼみに合う形を置いて、OKを押して判定しよう（難易度 ${questionIndex + 1}/5・残り${currentQuestion.targets.length - matchedTargetIndices.length}こ）`}
      </p>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: scaledStageWidth, height: scaledStageHeight }}>
          <div
            style={{
              width: BASE_STAGE_WIDTH,
              height: BASE_STAGE_HEIGHT,
              transform: `scale(${stageScale})`,
              transformOrigin: "top left"
            }}
          >
            <Stage width={BASE_STAGE_WIDTH} height={BASE_STAGE_HEIGHT}>
              <Layer>
                {isQuizMode &&
                  currentQuestion.targets.map((target, idx) =>
                    renderTargetSlot(target, matchedTargetIndices.includes(idx), `target-slot-${idx}`)
                  )}
                {shapes.map((shape) => {
            if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={60}
                  rotation={shape.rotation}
                  fill={shape.color}
                  draggable={!shape.isLocked}
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => rotateShapeById(shape.id)}
                  onTap={() => rotateShapeById(shape.id)}
                />
              );
            }

            if (shape.type === "square") {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={120}
                  height={120}
                  offsetX={60}
                  offsetY={60}
                  rotation={shape.rotation}
                  cornerRadius={10}
                  fill={shape.color}
                  draggable={!shape.isLocked}
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => rotateShapeById(shape.id)}
                  onTap={() => rotateShapeById(shape.id)}
                />
              );
            }

            if (shape.type === "trapezoid") {
              return (
                <Line
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  points={[
                    -60,
                    48,
                    60,
                    48,
                    36,
                    -48,
                    -36,
                    -48
                  ]}
                  rotation={shape.rotation}
                  fill={shape.color}
                  closed
                  draggable={!shape.isLocked}
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => rotateShapeById(shape.id)}
                  onTap={() => rotateShapeById(shape.id)}
                />
              );
            }

            if (shape.type === "parallelogram") {
              return (
                <Line
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  points={[
                    -45,
                    -48,
                    75,
                    -48,
                    45,
                    48,
                    -75,
                    48
                  ]}
                  rotation={shape.rotation}
                  fill={shape.color}
                  closed
                  draggable={!shape.isLocked}
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => rotateShapeById(shape.id)}
                  onTap={() => rotateShapeById(shape.id)}
                />
              );
            }

            if (shape.type === "diamond") {
              return (
                <Line
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  points={[
                    0,
                    -66,
                    58,
                    0,
                    0,
                    66,
                    -58,
                    0
                  ]}
                  rotation={shape.rotation}
                  fill={shape.color}
                  closed
                  draggable={!shape.isLocked}
                  onDragStart={(e) => {
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => rotateShapeById(shape.id)}
                  onTap={() => rotateShapeById(shape.id)}
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
                rotation={shape.rotation}
                fill={shape.color}
                draggable={!shape.isLocked}
                onDragStart={(e) => {
                  if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                }}
                onDragEnd={(e) => {
                  if (e.target instanceof Konva.Shape) {
                    animateDragging(e.target, false);
                    handleDragEndById(shape.id, e.target.x(), e.target.y());
                  }
                }}
                onClick={() => rotateShapeById(shape.id)}
                onTap={() => rotateShapeById(shape.id)}
              />
            );
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      {isQuizMode && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={judgeByOkButton}
            disabled={judgeResult === "correct" || isAllSolved}
            style={{
              border: "none",
              background: judgeResult === "correct" || isAllSolved ? "#a9b2d1" : "#3853ff",
              color: "#ffffff",
              borderRadius: "12px",
              padding: "12px 26px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: judgeResult === "correct" || isAllSolved ? "default" : "pointer"
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
