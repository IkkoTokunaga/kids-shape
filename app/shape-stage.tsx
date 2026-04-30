"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Konva from "konva";
import { Layer, Stage, Circle, Rect, RegularPolygon, Line, Path } from "react-konva";

type ShapeType = "circle" | "square" | "triangle" | "heart" | "star" | "rectangle";
type StageMode = "free" | "quiz-easy" | "quiz-medium" | "quiz-hard" | "quiz-oni";
type QuizDifficulty = "easy" | "medium" | "hard" | "oni";

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
  rotation?: number;
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
  heart: "#CDB4DB",
  star: "#B8E1DD",
  rectangle: "#FFD166"
};

const COLOR_OPTIONS = [
  "#A8D8EA",
  "#FFF3B0",
  "#FFB7B2",
  "#CDB4DB",
  "#B8E1DD",
  "#FFD166"
];

const PALETTE_SHAPES: ShapeType[] = [
  "square",
  "triangle",
  "circle",
  "heart",
  "star",
  "rectangle"
];

const EASY_QUESTION_SETTINGS: QuestionSetting[] = [
  {
    targets: [{ type: "square", x: 700, y: 250 }],
    snapDistance: 18,
    snapRotationTolerance: 18,
    judgeDistance: 28,
    rotationTolerance: 12
  },
  {
    targets: [{ type: "circle", x: 700, y: 250 }],
    snapDistance: 16,
    snapRotationTolerance: 16,
    judgeDistance: 24,
    rotationTolerance: 10
  },
  {
    targets: [{ type: "triangle", x: 700, y: 250 }],
    snapDistance: 14,
    snapRotationTolerance: 14,
    judgeDistance: 20,
    rotationTolerance: 8
  },
  {
    targets: [{ type: "heart", x: 700, y: 250 }],
    snapDistance: 12,
    snapRotationTolerance: 12,
    judgeDistance: 16,
    rotationTolerance: 6
  },
  {
    targets: [{ type: "star", x: 700, y: 250 }],
    snapDistance: 10,
    snapRotationTolerance: 10,
    judgeDistance: 12,
    rotationTolerance: 4
  }
];

const MEDIUM_QUESTION_SETTINGS: QuestionSetting[] = [
  {
    targets: [{ type: "triangle", x: 700, y: 250, rotation: 180 }],
    snapDistance: 18,
    snapRotationTolerance: 18,
    judgeDistance: 28,
    rotationTolerance: 12
  },
  {
    targets: [
      { type: "triangle", x: 650, y: 220, rotation: 180 },
      { type: "square", x: 770, y: 220, rotation: 0 }
    ],
    snapDistance: 16,
    snapRotationTolerance: 16,
    judgeDistance: 24,
    rotationTolerance: 10
  },
  {
    targets: [
      { type: "heart", x: 620, y: 230, rotation: 180 },
      { type: "triangle", x: 740, y: 230, rotation: 180 },
      { type: "circle", x: 680, y: 340, rotation: 0 }
    ],
    snapDistance: 14,
    snapRotationTolerance: 14,
    judgeDistance: 20,
    rotationTolerance: 8
  },
  {
    targets: [
      { type: "heart", x: 600, y: 220, rotation: 180 },
      { type: "star", x: 740, y: 220, rotation: 180 },
      { type: "triangle", x: 660, y: 330, rotation: 180 },
      { type: "circle", x: 800, y: 330, rotation: 0 }
    ],
    snapDistance: 12,
    snapRotationTolerance: 12,
    judgeDistance: 16,
    rotationTolerance: 6
  },
  {
    targets: [
      { type: "triangle", x: 580, y: 210, rotation: 180 },
      { type: "heart", x: 700, y: 210, rotation: 180 },
      { type: "circle", x: 820, y: 210, rotation: 0 },
      { type: "star", x: 640, y: 330, rotation: 180 },
      { type: "triangle", x: 780, y: 330, rotation: 180 }
    ],
    snapDistance: 10,
    snapRotationTolerance: 10,
    judgeDistance: 12,
    rotationTolerance: 4
  }
];

const HARD_QUESTION_SETTINGS: QuestionSetting[] = [
  {
    targets: [
      { type: "triangle", x: 600, y: 220, rotation: 180 },
      { type: "square", x: 740, y: 220, rotation: 90 },
      { type: "circle", x: 670, y: 340, rotation: 0 }
    ],
    snapDistance: 18,
    snapRotationTolerance: 18,
    judgeDistance: 16,
    rotationTolerance: 6
  },
  {
    targets: [
      { type: "heart", x: 560, y: 210, rotation: 180 },
      { type: "star", x: 690, y: 210, rotation: 180 },
      { type: "rectangle", x: 820, y: 210, rotation: 90 },
      { type: "square", x: 620, y: 330, rotation: 90 },
      { type: "triangle", x: 760, y: 330, rotation: 180 }
    ],
    snapDistance: 16,
    snapRotationTolerance: 16,
    judgeDistance: 14,
    rotationTolerance: 5
  },
  {
    targets: [
      { type: "circle", x: 500, y: 210, rotation: 0 },
      { type: "square", x: 620, y: 210, rotation: 90 },
      { type: "rectangle", x: 740, y: 210, rotation: 90 },
      { type: "triangle", x: 820, y: 210, rotation: 180 },
      { type: "star", x: 600, y: 330, rotation: 180 },
      { type: "heart", x: 760, y: 330, rotation: 180 }
    ],
    snapDistance: 14,
    snapRotationTolerance: 14,
    judgeDistance: 12,
    rotationTolerance: 4
  },
  {
    targets: [
      { type: "triangle", x: 490, y: 200, rotation: 180 },
      { type: "square", x: 600, y: 200, rotation: 90 },
      { type: "circle", x: 710, y: 200, rotation: 0 },
      { type: "rectangle", x: 820, y: 200, rotation: 90 },
      { type: "star", x: 570, y: 330, rotation: 180 },
      { type: "heart", x: 700, y: 330, rotation: 180 },
      { type: "square", x: 820, y: 330, rotation: 90 }
    ],
    snapDistance: 12,
    snapRotationTolerance: 12,
    judgeDistance: 10,
    rotationTolerance: 4
  },
  {
    targets: [
      { type: "circle", x: 420, y: 190, rotation: 0 },
      { type: "triangle", x: 520, y: 190, rotation: 180 },
      { type: "square", x: 620, y: 190, rotation: 90 },
      { type: "rectangle", x: 720, y: 190, rotation: 90 },
      { type: "heart", x: 820, y: 190, rotation: 180 },
      { type: "star", x: 540, y: 320, rotation: 180 },
      { type: "square", x: 660, y: 320, rotation: 90 },
      { type: "triangle", x: 780, y: 320, rotation: 180 }
    ],
    snapDistance: 10,
    snapRotationTolerance: 10,
    judgeDistance: 9,
    rotationTolerance: 3
  }
];

// 鬼モード: くぼみを大量に配置し、さらに形同士が重なり合うようにした最難関。
// 可動範囲: x ∈ [85, 815], y ∈ [85, 415] に収まるよう全てのターゲットを内側に配置する。
// 同一タイプかつ同一回転のターゲット間は judgeDistance の数倍以上離して配置する。
const ONI_QUESTION_SETTINGS: QuestionSetting[] = [
  {
    targets: [
      { type: "triangle", x: 170, y: 120, rotation: 180 },
      { type: "square", x: 355, y: 165, rotation: 90 },
      { type: "circle", x: 610, y: 115, rotation: 0 },
      { type: "rectangle", x: 770, y: 215, rotation: 90 },
      { type: "heart", x: 520, y: 330, rotation: 180 },
      { type: "star", x: 290, y: 360, rotation: 0 },
      { type: "square", x: 130, y: 265, rotation: 0 },
      { type: "star", x: 700, y: 360, rotation: 180 },
      { type: "circle", x: 430, y: 250, rotation: 0 },
      { type: "triangle", x: 230, y: 220, rotation: 0 },
      { type: "rectangle", x: 650, y: 255, rotation: 0 },
      { type: "heart", x: 800, y: 110, rotation: 0 },
      { type: "triangle", x: 460, y: 110, rotation: 180 }
    ],
    snapDistance: 16,
    snapRotationTolerance: 16,
    judgeDistance: 13,
    rotationTolerance: 5
  },
  {
    targets: [
      { type: "triangle", x: 130, y: 125, rotation: 180 },
      { type: "square", x: 280, y: 205, rotation: 90 },
      { type: "circle", x: 505, y: 135, rotation: 0 },
      { type: "rectangle", x: 705, y: 165, rotation: 90 },
      { type: "heart", x: 385, y: 340, rotation: 180 },
      { type: "star", x: 210, y: 300, rotation: 0 },
      { type: "circle", x: 780, y: 320, rotation: 0 },
      { type: "square", x: 620, y: 365, rotation: 0 },
      { type: "star", x: 720, y: 95, rotation: 180 },
      { type: "circle", x: 420, y: 245, rotation: 0 },
      { type: "triangle", x: 260, y: 380, rotation: 0 },
      { type: "square", x: 125, y: 235, rotation: 90 },
      { type: "rectangle", x: 560, y: 255, rotation: 0 },
      { type: "heart", x: 815, y: 200, rotation: 0 },
      { type: "triangle", x: 640, y: 105, rotation: 180 }
    ],
    snapDistance: 14,
    snapRotationTolerance: 14,
    judgeDistance: 12,
    rotationTolerance: 5
  },
  {
    targets: [
      { type: "triangle", x: 120, y: 110, rotation: 180 },
      { type: "square", x: 255, y: 175, rotation: 90 },
      { type: "circle", x: 430, y: 105, rotation: 0 },
      { type: "rectangle", x: 595, y: 145, rotation: 90 },
      { type: "heart", x: 760, y: 115, rotation: 180 },
      { type: "star", x: 705, y: 235, rotation: 0 },
      { type: "star", x: 165, y: 305, rotation: 180 },
      { type: "triangle", x: 315, y: 265, rotation: 0 },
      { type: "square", x: 490, y: 225, rotation: 0 },
      { type: "rectangle", x: 660, y: 330, rotation: 0 },
      { type: "circle", x: 810, y: 285, rotation: 0 },
      { type: "heart", x: 520, y: 370, rotation: 180 },
      { type: "triangle", x: 360, y: 355, rotation: 180 },
      { type: "circle", x: 95, y: 390, rotation: 0 },
      { type: "square", x: 225, y: 390, rotation: 90 },
      { type: "star", x: 390, y: 390, rotation: 0 },
      { type: "rectangle", x: 600, y: 250, rotation: 90 },
      { type: "heart", x: 785, y: 390, rotation: 0 },
      { type: "triangle", x: 95, y: 200, rotation: 0 }
    ],
    snapDistance: 12,
    snapRotationTolerance: 12,
    judgeDistance: 11,
    rotationTolerance: 4
  },
  {
    targets: [
      { type: "triangle", x: 95, y: 95, rotation: 180 },
      { type: "square", x: 220, y: 150, rotation: 90 },
      { type: "circle", x: 370, y: 95, rotation: 0 },
      { type: "rectangle", x: 545, y: 110, rotation: 90 },
      { type: "heart", x: 705, y: 95, rotation: 180 },
      { type: "star", x: 815, y: 155, rotation: 0 },
      { type: "circle", x: 645, y: 220, rotation: 0 },
      { type: "triangle", x: 460, y: 185, rotation: 0 },
      { type: "star", x: 120, y: 245, rotation: 180 },
      { type: "triangle", x: 285, y: 245, rotation: 0 },
      { type: "square", x: 410, y: 265, rotation: 0 },
      { type: "rectangle", x: 565, y: 305, rotation: 0 },
      { type: "heart", x: 760, y: 270, rotation: 180 },
      { type: "triangle", x: 95, y: 355, rotation: 180 },
      { type: "square", x: 230, y: 390, rotation: 90 },
      { type: "circle", x: 365, y: 355, rotation: 0 },
      { type: "star", x: 500, y: 390, rotation: 0 },
      { type: "rectangle", x: 675, y: 385, rotation: 90 },
      { type: "heart", x: 810, y: 365, rotation: 0 },
      { type: "triangle", x: 340, y: 205, rotation: 180 },
      { type: "square", x: 510, y: 235, rotation: 0 },
      { type: "circle", x: 130, y: 165, rotation: 0 }
    ],
    snapDistance: 11,
    snapRotationTolerance: 11,
    judgeDistance: 10,
    rotationTolerance: 4
  },
  {
    targets: [
      { type: "triangle", x: 95, y: 90, rotation: 180 },
      { type: "square", x: 210, y: 130, rotation: 90 },
      { type: "circle", x: 340, y: 95, rotation: 0 },
      { type: "rectangle", x: 475, y: 135, rotation: 90 },
      { type: "heart", x: 625, y: 95, rotation: 180 },
      { type: "star", x: 770, y: 110, rotation: 0 },
      { type: "circle", x: 810, y: 215, rotation: 0 },
      { type: "square", x: 690, y: 250, rotation: 0 },
      { type: "star", x: 520, y: 215, rotation: 180 },
      { type: "circle", x: 360, y: 230, rotation: 0 },
      { type: "triangle", x: 235, y: 260, rotation: 0 },
      { type: "square", x: 115, y: 235, rotation: 90 },
      { type: "rectangle", x: 95, y: 340, rotation: 0 },
      { type: "heart", x: 250, y: 380, rotation: 180 },
      { type: "triangle", x: 430, y: 370, rotation: 180 },
      { type: "star", x: 575, y: 390, rotation: 0 },
      { type: "square", x: 730, y: 380, rotation: 0 },
      { type: "star", x: 815, y: 320, rotation: 180 },
      { type: "rectangle", x: 620, y: 320, rotation: 90 },
      { type: "heart", x: 470, y: 315, rotation: 0 },
      { type: "triangle", x: 335, y: 330, rotation: 180 },
      { type: "square", x: 210, y: 320, rotation: 90 },
      { type: "rectangle", x: 770, y: 250, rotation: 0 },
      { type: "circle", x: 620, y: 180, rotation: 0 }
    ],
    snapDistance: 10,
    snapRotationTolerance: 10,
    judgeDistance: 9,
    rotationTolerance: 3
  }
];

const getNormalizedRotation = (rotation: number) => {
  const normalized = rotation % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const getSymmetryStep = (type: ShapeType) => {
  if (type === "circle") return 360;
  if (type === "square") return 90;
  if (type === "rectangle") return 180;
  if (type === "star") return 180;
  return 360;
};

const getMinRotationError = (type: ShapeType, rotation: number, targetRotation = 0) => {
  if (type === "circle") return 0;

  const normalizedRotation = getNormalizedRotation(rotation);
  const normalizedTarget = getNormalizedRotation(targetRotation);
  const rawDelta = Math.abs(normalizedRotation - normalizedTarget);
  const baseDelta = Math.min(rawDelta, 360 - rawDelta);
  const symmetryStep = getSymmetryStep(type);

  if (symmetryStep === 360) return baseDelta;

  const mod = baseDelta % symmetryStep;
  return Math.min(mod, symmetryStep - mod);
};

const isCloseToSlot = (shape: ShapeItem, target: TargetSlot, setting: QuestionSetting) => {
  if (shape.type !== target.type) return false;

  const deltaX = shape.x - target.x;
  const deltaY = shape.y - target.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance > setting.judgeDistance) return false;

  const minRotationError = getMinRotationError(shape.type, shape.rotation, target.rotation ?? 0);
  return minRotationError <= setting.rotationTolerance;
};

const findNearestSlot = (
  shape: ShapeItem,
  targets: TargetSlot[],
  setting: QuestionSetting
): TargetSlot | null => {
  const sameTypeTargets = targets.filter((target) => target.type === shape.type);
  if (sameTypeTargets.length === 0) return null;

  let nearest: TargetSlot | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const target of sameTypeTargets) {
    const rotationError = getMinRotationError(shape.type, shape.rotation, target.rotation ?? 0);
    if (rotationError > setting.snapRotationTolerance) continue;

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
  onQuizComplete?: () => void;
  onQuestionProgressChange?: (current: number, total: number) => void;
  clearRequestKey?: number;
};

const BASE_STAGE_WIDTH = 900;
const BASE_STAGE_HEIGHT = 500;
const NARROW_STAGE_HEIGHT = 620;
const CORRECT_POPUP_DELAY_MS = 500;
const NEXT_QUESTION_DELAY_MS = 1300;
const EDGE_SAFE_PADDING = 10;
// スマホ表示ではタップしやすいように図形とくぼみをすこし大きく見せる。
// 既存のターゲット座標が可動領域からはみ出さない限界まで拡大（特に HARD Q4 の rectangle rot90 x=820 がタイト）。
const NARROW_SHAPE_SCALE = 1.2;
const NARROW_EDGE_SAFE_PADDING = 0;
const SNAP_SOUND_FILE_URL = "/sounds/peta.mp3";
const TRIANGLE_POINTS: [number, number][] = [
  [0, -75],
  [64.95, 37.5],
  [-64.95, 37.5]
];
const SQUARE_POINTS: [number, number][] = [
  [-60, -60],
  [60, -60],
  [60, 60],
  [-60, 60]
];
const HEART_POINTS: [number, number][] = [
  [0, 64],
  [52, 10],
  [46, -28],
  [22, -52],
  [0, -34],
  [-22, -52],
  [-46, -28],
  [-52, 10]
];
const STAR_POINTS: [number, number][] = [
  [0, -66],
  [15, -20],
  [58, -20],
  [24, 6],
  [36, 52],
  [0, 24],
  [-36, 52],
  [-24, 6],
  [-58, -20],
  [-15, -20]
];
const RECTANGLE_POINTS: [number, number][] = [
  [-72, -44],
  [72, -44],
  [72, 44],
  [-72, 44]
];
const HEART_PATH_DATA =
  "M 0 60 C -18 40 -68 8 -68 -26 C -68 -48 -52 -64 -32 -64 C -20 -64 -8 -58 0 -46 C 8 -58 20 -64 32 -64 C 52 -64 68 -48 68 -26 C 68 8 18 40 0 60 Z";

const shuffleShapeTypes = (types: ShapeType[]) => {
  const next = [...types];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [next[i], next[randomIndex]] = [next[randomIndex], next[i]];
  }
  return next;
};

const getRotatedHalfExtents = (points: [number, number][], rotation: number) => {
  const angle = (rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  let maxAbsX = 0;
  let maxAbsY = 0;

  points.forEach(([x, y]) => {
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;
    maxAbsX = Math.max(maxAbsX, Math.abs(rotatedX));
    maxAbsY = Math.max(maxAbsY, Math.abs(rotatedY));
  });

  return { halfWidth: maxAbsX, halfHeight: maxAbsY };
};

const getShapeHalfExtents = (type: ShapeType, rotation: number, scale = 1) => {
  const base =
    type === "circle"
      ? { halfWidth: 60, halfHeight: 60 }
      : type === "square"
        ? getRotatedHalfExtents(SQUARE_POINTS, rotation)
        : type === "triangle"
          ? getRotatedHalfExtents(TRIANGLE_POINTS, rotation)
          : type === "heart"
            ? getRotatedHalfExtents(HEART_POINTS, rotation)
            : type === "star"
              ? getRotatedHalfExtents(STAR_POINTS, rotation)
              : getRotatedHalfExtents(RECTANGLE_POINTS, rotation);
  return { halfWidth: base.halfWidth * scale, halfHeight: base.halfHeight * scale };
};

export default function ShapeStage({
  mode,
  onQuizComplete,
  onQuestionProgressChange,
  clearRequestKey
}: ShapeStageProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [recentlyAddedShape, setRecentlyAddedShape] = useState<ShapeType | null>(null);
  const recentlyAddedShapeTimerRef = useRef<number | null>(null);
  const shapeIdSerialRef = useRef(0);
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [matchedTargetIndices, setMatchedTargetIndices] = useState<number[]>([]);
  const [isAllSolved, setIsAllSolved] = useState(false);
  const [judgeResult, setJudgeResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [celebrationLevel, setCelebrationLevel] = useState<0 | 1 | 2>(0);
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
  const [isFinalClearPopup, setIsFinalClearPopup] = useState(false);
  const popupDelayTimerRef = useRef<number | null>(null);
  const nextQuestionTimerRef = useRef<number | null>(null);
  const stageHostRef = useRef<HTMLDivElement | null>(null);
  const [stageHostWidth, setStageHostWidth] = useState(320);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [viewportWidth, setViewportWidth] = useState(800);
  const isNarrowScreen = viewportWidth < 520;
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const snapAudioRef = useRef<HTMLAudioElement | null>(null);
  const isQuizMode = mode !== "free";
  const difficulty: QuizDifficulty =
    mode === "quiz-medium"
      ? "medium"
      : mode === "quiz-hard"
        ? "hard"
        : mode === "quiz-oni"
          ? "oni"
          : "easy";
  const questionSettingsByDifficulty: Record<QuizDifficulty, QuestionSetting[]> = {
    easy: EASY_QUESTION_SETTINGS,
    medium: MEDIUM_QUESTION_SETTINGS,
    hard: HARD_QUESTION_SETTINGS,
    oni: ONI_QUESTION_SETTINGS
  };
  const questionSettings = questionSettingsByDifficulty[difficulty];
  const currentQuestion = questionSettings[questionIndex];
  const shapeScale = isNarrowScreen ? NARROW_SHAPE_SCALE : 1;
  const edgeSafePadding = isNarrowScreen ? NARROW_EDGE_SAFE_PADDING : EDGE_SAFE_PADDING;
  // 図形とくぼみを拡大しても同じ相対感覚で吸着/判定できるよう距離系だけスケールする。
  const scaledCurrentQuestion: QuestionSetting = useMemo(
    () => ({
      ...currentQuestion,
      snapDistance: currentQuestion.snapDistance * shapeScale,
      judgeDistance: currentQuestion.judgeDistance * shapeScale
    }),
    [currentQuestion, shapeScale]
  );
  const paletteShapesForCurrentMode = useMemo(() => {
    if (!isQuizMode || difficulty !== "oni") return PALETTE_SHAPES;
    // Questionが切り替わるたびに並びを再抽選するためのシード。
    const seed = questionIndex;
    void seed;
    return shuffleShapeTypes(PALETTE_SHAPES);
  }, [isQuizMode, difficulty, questionIndex]);

  const unmatchedTargets = currentQuestion.targets.filter((_, idx) => !matchedTargetIndices.includes(idx));
  const selectedShapeData = selectedShapeId
    ? shapes.find((shape) => shape.id === selectedShapeId) ?? null
    : null;
  const isShapeSelected = selectedShapeData !== null && !selectedShapeData.isLocked;
  const visualStageWidth = Math.max(200, stageHostWidth);
  const reservedHeight = isNarrowScreen ? (isQuizMode ? 400 : 350) : (isQuizMode ? 340 : 300);
  const maxStageVisualHeight = Math.max(200, viewportHeight - reservedHeight);
  const internalStageHeight = isNarrowScreen ? NARROW_STAGE_HEIGHT : BASE_STAGE_HEIGHT;
  const widthScale = visualStageWidth / BASE_STAGE_WIDTH;
  const heightScale = maxStageVisualHeight / internalStageHeight;
  const stageScale = Math.min(1, widthScale, heightScale);
  const internalStageWidth = BASE_STAGE_WIDTH;
  const scaledStageWidth = Math.ceil(BASE_STAGE_WIDTH * stageScale);
  const scaledStageHeight = Math.ceil(internalStageHeight * stageScale);
  const visibleInternalWidth = scaledStageWidth / Math.max(stageScale, 0.01);
  const visibleInternalHeight = scaledStageHeight / Math.max(stageScale, 0.01);
  const boundedStageWidth = Math.min(internalStageWidth, visibleInternalWidth);
  const boundedStageHeight = Math.min(internalStageHeight, visibleInternalHeight);

  useEffect(() => {
    if (!stageHostRef.current) return;

    const updateHostWidth = () => {
      if (!stageHostRef.current) return;
      setStageHostWidth(Math.max(200, Math.floor(stageHostRef.current.clientWidth)));
    };

    updateHostWidth();
    const observer = new ResizeObserver(updateHostWidth);
    observer.observe(stageHostRef.current);
    window.addEventListener("resize", updateHostWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHostWidth);
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!isQuizMode) return;
    if (judgeResult !== "correct" && !isAllSolved) return;

    const level: 1 | 2 = isAllSolved ? 2 : 1;
    setCelebrationLevel(level);

    const timeoutId = window.setTimeout(() => {
      setCelebrationLevel(0);
    }, level === 2 ? 1400 : 900);

    return () => window.clearTimeout(timeoutId);
  }, [isQuizMode, judgeResult, isAllSolved]);

  useEffect(() => {
    // Ensure celebration effect does not remain on next question.
    if (popupDelayTimerRef.current !== null) {
      window.clearTimeout(popupDelayTimerRef.current);
      popupDelayTimerRef.current = null;
    }
    if (nextQuestionTimerRef.current !== null) {
      window.clearTimeout(nextQuestionTimerRef.current);
      nextQuestionTimerRef.current = null;
    }
    setCelebrationLevel(0);
    setShowCorrectPopup(false);
    setIsFinalClearPopup(false);
  }, [questionIndex]);

  useEffect(() => {
    setQuestionIndex(0);
    setShapes([]);
    setMatchedTargetIndices([]);
    setIsAllSolved(false);
    setJudgeResult("idle");
    setSelectedShapeId(null);
    setIsFinalClearPopup(false);
  }, [difficulty]);

  useEffect(() => {
    setSelectedShapeId(null);
  }, [questionIndex]);

  useEffect(() => {
    if (!isQuizMode) {
      onQuestionProgressChange?.(0, 0);
      return;
    }
    onQuestionProgressChange?.(questionIndex + 1, questionSettings.length);
  }, [isQuizMode, onQuestionProgressChange, questionIndex, questionSettings.length]);

  useEffect(() => {
    if (clearRequestKey === undefined) return;
    setShapes([]);
    setSelectedShapeId(null);
    if (isQuizMode && !isAllSolved) {
      setMatchedTargetIndices([]);
      setJudgeResult("idle");
    }
  }, [clearRequestKey, isAllSolved, isQuizMode]);

  useEffect(() => {
    if (!selectedShapeId) return;
    const target = shapes.find((shape) => shape.id === selectedShapeId);
    if (!target || target.isLocked) setSelectedShapeId(null);
  }, [shapes, selectedShapeId]);

  useEffect(() => {
    return () => {
      if (recentlyAddedShapeTimerRef.current !== null) {
        window.clearTimeout(recentlyAddedShapeTimerRef.current);
        recentlyAddedShapeTimerRef.current = null;
      }
      if (popupDelayTimerRef.current !== null) {
        window.clearTimeout(popupDelayTimerRef.current);
        popupDelayTimerRef.current = null;
      }
      if (nextQuestionTimerRef.current !== null) {
        window.clearTimeout(nextQuestionTimerRef.current);
        nextQuestionTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const snapAudio = new Audio(SNAP_SOUND_FILE_URL);
    snapAudio.preload = "auto";
    snapAudio.volume = 0.82;
    snapAudioRef.current = snapAudio;

    return () => {
      if (snapAudioRef.current) {
        snapAudioRef.current.pause();
        snapAudioRef.current.src = "";
        snapAudioRef.current = null;
      }
      if (!audioContextRef.current) return;
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
      masterGainRef.current = null;
    };
  }, []);

  const getOrCreateAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      const context = new AudioCtx();
      const masterGain = context.createGain();
      masterGain.gain.value = 0.22;
      masterGain.connect(context.destination);

      audioContextRef.current = context;
      masterGainRef.current = masterGain;
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    return { context: audioContextRef.current, masterGain: masterGainRef.current };
  }, []);

  const playSuccessSound = useCallback(async (level: 1 | 2) => {
    const audio = await getOrCreateAudio();
    if (!audio || !audio.masterGain) return;
    const { context, masterGain } = audio;
    const now = context.currentTime;
    const notes = level === 2 ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + index * 0.085;
      const stopAt = startAt + 0.2;

      oscillator.type = index === notes.length - 1 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.14, startAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.19);

      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(startAt);
      oscillator.stop(stopAt);
    });
  }, [getOrCreateAudio]);

  const playSnapSynth = useCallback(() => {
    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain) {
      // Audio is primed on drag start. If not ready yet, skip this one quietly.
      return;
    }
    const now = context.currentTime;

    const main = context.createOscillator();
    const mainGain = context.createGain();
    const pop = context.createOscillator();
    const popGain = context.createGain();
    const air = context.createOscillator();
    const airGain = context.createGain();

    // Cute "nyu" feel: soft attack + slight upward pitch glide.
    main.type = "sine";
    main.frequency.setValueAtTime(420, now);
    main.frequency.exponentialRampToValueAtTime(620, now + 0.07);

    pop.type = "triangle";
    pop.frequency.setValueAtTime(320, now);
    pop.frequency.exponentialRampToValueAtTime(520, now + 0.055);

    air.type = "sine";
    air.frequency.setValueAtTime(980, now + 0.01);
    air.frequency.exponentialRampToValueAtTime(760, now + 0.07);

    mainGain.gain.setValueAtTime(0.0001, now);
    mainGain.gain.exponentialRampToValueAtTime(0.04, now + 0.006);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    popGain.gain.setValueAtTime(0.0001, now);
    popGain.gain.exponentialRampToValueAtTime(0.024, now + 0.004);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    airGain.gain.setValueAtTime(0.0001, now + 0.008);
    airGain.gain.exponentialRampToValueAtTime(0.01, now + 0.018);
    airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    main.connect(mainGain);
    mainGain.connect(masterGain);
    pop.connect(popGain);
    popGain.connect(masterGain);
    air.connect(airGain);
    airGain.connect(masterGain);

    main.start(now);
    main.stop(now + 0.16);
    pop.start(now);
    pop.stop(now + 0.115);
    air.start(now + 0.008);
    air.stop(now + 0.1);
  }, []);

  const playSnapSound = useCallback(() => {
    const snapAudio = snapAudioRef.current;
    if (snapAudio) {
      snapAudio.currentTime = 0;
      void snapAudio.play().catch(() => {
        playSnapSynth();
      });
      return;
    }

    playSnapSynth();
  }, [playSnapSynth]);

  const animateDragging = (target: Konva.Shape, active: boolean) => {
    if (active) {
      // Prime / resume audio on user gesture to remove first-play latency.
      void getOrCreateAudio().catch(() => undefined);
    }
    target.to({
      scaleX: active ? shapeScale * 1.04 : shapeScale,
      scaleY: active ? shapeScale * 1.04 : shapeScale,
      shadowColor: "rgba(0, 0, 0, 0.35)",
      shadowBlur: active ? 12 : 0,
      shadowOffsetX: active ? 4 : 0,
      shadowOffsetY: active ? 4 : 0,
      shadowOpacity: active ? 0.45 : 0,
      duration: 0.2
    });
  };

  const getDragBoundPosition = (shape: ShapeItem, absPos: { x: number; y: number }) => {
    // Konva's dragBoundFunc gives and expects ABSOLUTE (pixel) coordinates.
    // Convert to internal (layer) coordinates, clamp there with fixed internal
    // padding, then convert back so bounds are independent of stageScale.
    const safeScale = Math.max(stageScale, 0.01);
    const internalX = absPos.x / safeScale;
    const internalY = absPos.y / safeScale;

    const { halfWidth, halfHeight } = getShapeHalfExtents(shape.type, shape.rotation, shapeScale);
    const minX = halfWidth + edgeSafePadding;
    const maxX = boundedStageWidth - halfWidth - edgeSafePadding;
    const minY = halfHeight + edgeSafePadding;
    const maxY = boundedStageHeight - halfHeight - edgeSafePadding;

    const clampedInternalX = Math.min(maxX, Math.max(minX, internalX));
    const clampedInternalY = Math.min(maxY, Math.max(minY, internalY));

    return {
      x: clampedInternalX * safeScale,
      y: clampedInternalY * safeScale
    };
  };

  const flashRecentlyAddedShape = (type: ShapeType) => {
    if (recentlyAddedShapeTimerRef.current !== null) {
      window.clearTimeout(recentlyAddedShapeTimerRef.current);
    }
    setRecentlyAddedShape(type);
    recentlyAddedShapeTimerRef.current = window.setTimeout(() => {
      setRecentlyAddedShape(null);
      recentlyAddedShapeTimerRef.current = null;
    }, 400);
  };

  const addShape = (type: ShapeType, color: string) => {
    const newShapeId = `shape-${shapeIdSerialRef.current++}`;
    setShapes((currentShapes) => {
      const nextIndex = currentShapes.filter((shape) => shape.type === type).length;
      const newShape: ShapeItem = {
        id: newShapeId,
        type,
        x: 120 + ((nextIndex * 85) % 620),
        y: 120 + ((nextIndex * 60) % 260),
        rotation: 0,
        isLocked: false,
        color
      };
      return [...currentShapes, newShape];
    });
    setSelectedShapeId(newShapeId);
  };

  const paletteIconSize = isNarrowScreen ? 32 : 24;

  const renderPaletteShape = (type: ShapeType) => {
    const color = SHAPE_COLORS[type];
    const iconSize = `${paletteIconSize}px`;

    if (type === "circle") {
      return (
        <span
          aria-hidden
          style={{
            width: iconSize,
            height: iconSize,
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
            width: iconSize,
            height: iconSize,
            borderRadius: "4px",
            background: color,
            display: "inline-block"
          }}
        />
      );
    }

    if (type === "heart") {
      return (
        <svg width={paletteIconSize} height={paletteIconSize} viewBox="0 0 100 100" aria-hidden>
          <path d="M50 86 C38 74 18 59 18 39 C18 25 29 16 40 16 C46 16 52 19 50 26 C48 19 54 16 60 16 C71 16 82 25 82 39 C82 59 62 74 50 86 Z" fill={color} />
        </svg>
      );
    }

    if (type === "star") {
      return (
        <svg width={paletteIconSize} height={paletteIconSize} viewBox="0 0 100 100" aria-hidden>
          <polygon points="50,10 61,38 90,38 67,56 76,86 50,68 24,86 33,56 10,38 39,38" fill={color} />
        </svg>
      );
    }

    if (type === "rectangle") {
      return (
        <svg width={paletteIconSize} height={paletteIconSize} viewBox="0 0 100 100" aria-hidden>
          <rect x="12" y="28" width="76" height="44" rx="6" fill={color} />
        </svg>
      );
    }

    return <svg width={paletteIconSize} height={paletteIconSize} viewBox="0 0 100 100" aria-hidden><polygon points="50,16 84,76 16,76" fill={color} /></svg>;
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
      listening: false,
      rotation: target.rotation ?? 0,
      scaleX: shapeScale,
      scaleY: shapeScale,
      strokeScaleEnabled: false
    };

    if (target.type === "circle") {
      return <Circle key={key} x={target.x} y={target.y} radius={60} {...sharedProps} />;
    }

    if (target.type === "square") {
      return (
        <Rect
          key={key}
          x={target.x}
          y={target.y}
          width={120}
          height={120}
          offsetX={60}
          offsetY={60}
          cornerRadius={10}
          {...sharedProps}
        />
      );
    }

    if (target.type === "heart") {
      return (
        <Path
          key={key}
          x={target.x}
          y={target.y}
          data={HEART_PATH_DATA}
          {...sharedProps}
        />
      );
    }

    if (target.type === "star") {
      return (
        <Line
          key={key}
          x={target.x}
          y={target.y}
          points={STAR_POINTS.flat()}
          closed
          {...sharedProps}
        />
      );
    }

    if (target.type === "rectangle") {
      return (
        <Line
          key={key}
          x={target.x}
          y={target.y}
          points={RECTANGLE_POINTS.flat()}
          closed
          {...sharedProps}
        />
      );
    }

    return <RegularPolygon key={key} x={target.x} y={target.y} sides={3} radius={75} {...sharedProps} />;
  };

  const isShapeInSlot = (shape: ShapeItem) => {
    if (shape.isLocked) return true;
    if (!isQuizMode) return false;
    return unmatchedTargets.some((target) => isCloseToSlot(shape, target, scaledCurrentQuestion));
  };

  const handleShapeTap = (id: string) => {
    const target = shapes.find((shape) => shape.id === id);
    if (!target || target.isLocked) return;
    // くぼみにはまっている形は選択できないようにする（ドラッグで引き出してから選択する想定）。
    if (isShapeInSlot(target)) return;
    setSelectedShapeId((current) => (current === id ? null : id));
  };

  const rotateSelected = () => {
    if (!selectedShapeId) return;
    if (isQuizMode && judgeResult === "wrong") setJudgeResult("idle");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        if (shape.id !== selectedShapeId || shape.isLocked) return shape;
        return { ...shape, rotation: shape.rotation + 90 };
      })
    );
  };

  const deleteSelected = () => {
    if (!selectedShapeId) return;
    const target = shapes.find((shape) => shape.id === selectedShapeId);
    if (!target || target.isLocked) {
      setSelectedShapeId(null);
      return;
    }
    setShapes((currentShapes) => currentShapes.filter((shape) => shape.id !== selectedShapeId));
    setSelectedShapeId(null);
  };

  const applyColorToSelected = (color: string) => {
    if (!selectedShapeId) return false;
    const target = shapes.find((shape) => shape.id === selectedShapeId);
    if (!target || target.isLocked) return false;
    if (isQuizMode && judgeResult === "wrong") setJudgeResult("idle");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => (shape.id === selectedShapeId ? { ...shape, color } : shape))
    );
    return true;
  };

  const applyTypeToSelected = (type: ShapeType) => {
    if (!selectedShapeId) return false;
    const target = shapes.find((shape) => shape.id === selectedShapeId);
    if (!target || target.isLocked) return false;
    if (isQuizMode && judgeResult === "wrong") setJudgeResult("idle");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => (shape.id === selectedShapeId ? { ...shape, type } : shape))
    );
    return true;
  };

  const handleDragEndById = (id: string, x: number, y: number) => {
    if (isQuizMode && judgeResult === "wrong") setJudgeResult("idle");

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        if (shape.id !== id || shape.isLocked) return shape;
        const movedShape = { ...shape, x, y };

        if (isQuizMode) {
          const nearestTarget = findNearestSlot(movedShape, unmatchedTargets, scaledCurrentQuestion);
          if (!nearestTarget) return movedShape;
          playSnapSound();

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

  useEffect(() => {
    if (!isQuizMode) return;
    if (isAllSolved || judgeResult === "correct" || showCorrectPopup) return;

    const usedShapeIds = new Set<string>();
    const nextMatchedIndices: number[] = [];

    currentQuestion.targets.forEach((target, targetIndex) => {
      if (matchedTargetIndices.includes(targetIndex)) return;

      const matchedShape = shapes.find((shape) => {
        if (shape.isLocked) return false;
        if (usedShapeIds.has(shape.id)) return false;
        return isCloseToSlot(shape, target, scaledCurrentQuestion);
      });

      if (!matchedShape) return;
      usedShapeIds.add(matchedShape.id);
      nextMatchedIndices.push(targetIndex);
    });

    if (nextMatchedIndices.length === 0) return;

    setShapes((currentShapes) =>
      currentShapes.map((shape) => {
        const matchedEntry = currentQuestion.targets.find((target, targetIndex) => {
          if (!nextMatchedIndices.includes(targetIndex)) return false;
          return isCloseToSlot(shape, target, scaledCurrentQuestion);
        });
        if (!matchedEntry || shape.isLocked) return shape;

        return {
          ...shape,
          x: matchedEntry.x,
          y: matchedEntry.y,
          rotation: matchedEntry.rotation ?? 0,
          isLocked: true
        };
      })
    );

    const updatedMatchedIndices = [...matchedTargetIndices, ...nextMatchedIndices];
    setMatchedTargetIndices(updatedMatchedIndices);

    const isQuestionSolved = updatedMatchedIndices.length === currentQuestion.targets.length;
    const isLastQuestion = questionIndex === questionSettings.length - 1;

    if (!isQuestionSolved) {
      playSnapSound();
      setJudgeResult("idle");
      return;
    }

    setJudgeResult("correct");
    const soundLevel: 1 | 2 = isLastQuestion ? 2 : 1;
    void playSuccessSound(soundLevel).catch(() => undefined);

    popupDelayTimerRef.current = window.setTimeout(() => {
      setIsFinalClearPopup(isLastQuestion);
      setShowCorrectPopup(true);
      nextQuestionTimerRef.current = window.setTimeout(() => {
        if (isLastQuestion) {
          setIsAllSolved(true);
        } else {
          setShowCorrectPopup(false);
          setIsFinalClearPopup(false);
          setQuestionIndex((current) => current + 1);
          setShapes([]);
          setMatchedTargetIndices([]);
          setJudgeResult("idle");
        }
        nextQuestionTimerRef.current = null;
      }, NEXT_QUESTION_DELAY_MS);
      popupDelayTimerRef.current = null;
    }, CORRECT_POPUP_DELAY_MS);
  }, [
    isQuizMode,
    isAllSolved,
    judgeResult,
    showCorrectPopup,
    shapes,
    currentQuestion.targets,
    matchedTargetIndices,
    scaledCurrentQuestion,
    questionIndex,
    questionSettings.length,
    playSnapSound,
    playSuccessSound
  ]);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <p
        style={{
          margin: 0,
          minHeight: "1.6em",
          color: isShapeSelected
            ? "#3853ff"
            : !isQuizMode
              ? "#44506b"
              : judgeResult === "correct"
                ? "#2f9e44"
                : judgeResult === "wrong"
                  ? "#cc3344"
                  : "#44506b",
          fontWeight: 700,
          fontSize: isNarrowScreen ? "0.85rem" : "1rem",
          lineHeight: 1.4,
          wordBreak: "break-word"
        }}
      >
        {isShapeSelected
          ? "形をえらんだよ！ 回転・削除・色・形を えらぼう（もういちどタップで解除）"
          : !isQuizMode
          ? "好きな形を置いて、ドラッグや回転で自由に遊ぼう"
          : isAllSolved
            ? `${questionSettings.length}問クリア！ぜんぶせいかい！すごい 🎊`
            : judgeResult === "correct"
              ? "せいかい！ ぴったりはまったね 🎉"
              : judgeResult === "wrong"
                ? "まだちがうよ。位置と向きをもう少し合わせてみよう"
                : `くぼみに合う形を置こう（${difficulty === "easy" ? "易" : difficulty === "medium" ? "中" : difficulty === "hard" ? "難" : "鬼"} ${questionIndex + 1}/${questionSettings.length}・残り${currentQuestion.targets.length - matchedTargetIndices.length}こ）`}
      </p>
      <div ref={stageHostRef} style={{ display: "flex", justifyContent: "center", width: "100%", minWidth: 0 }}>
        <div style={{ width: scaledStageWidth, height: scaledStageHeight, position: "relative", overflow: "hidden", borderRadius: "16px", touchAction: "none" }}>
          {showCorrectPopup && (
            <div
              className={`correct-popup${isFinalClearPopup ? " correct-popup-interactive" : ""}`}
              role="status"
              aria-live="polite"
            >
              <div className="correct-popup-stars" aria-hidden>✨ 🌟 ✨</div>
              <div className="correct-popup-main">{isFinalClearPopup ? "全問クリアおめでとう！" : "せいかい！"}</div>
              <div className="correct-popup-sub">
                {isFinalClearPopup
                  ? difficulty === "oni"
                    ? "鬼モード完全クリア！TOPにもどろう！"
                    : "つぎのステージへ すすもう！"
                  : "つぎのもんだいへ しゅっぱつ！"}
              </div>
              {isFinalClearPopup && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCorrectPopup(false);
                    setIsFinalClearPopup(false);
                    onQuizComplete?.();
                  }}
                  style={{
                    marginTop: "8px",
                    border: "none",
                    background: difficulty === "oni" ? "#cc3344" : "#3f63ff",
                    color: "#ffffff",
                    borderRadius: "12px",
                    padding: isNarrowScreen ? "10px 16px" : "10px 18px",
                    fontWeight: 800,
                    fontSize: isNarrowScreen ? "0.95rem" : "1rem",
                    cursor: "pointer",
                    width: "fit-content",
                    justifySelf: "center"
                  }}
                >
                  {difficulty === "oni" ? "TOPにもどる" : "次のステージへ"}
                </button>
              )}
            </div>
          )}
          {celebrationLevel > 0 && (
            <div className={`celebration-overlay celebration-level-${celebrationLevel}`} aria-hidden>
              <div className="celebration-flash" />
              <div className="celebration-rays" />
              <div className="celebration-confetti">
                {Array.from({ length: celebrationLevel === 2 ? 28 : 18 }).map((_, index) => (
                  <span
                    key={`confetti-${index}`}
                    className="celebration-piece"
                    style={
                      {
                        left: `${(index * 31) % 100}%`,
                        animationDelay: `${(index % 8) * 0.05}s`,
                        "--drift": `${(index % 2 === 0 ? -1 : 1) * (12 + (index % 5) * 8)}px`,
                        "--hue-shift": `${index * 11}deg`
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            </div>
          )}
          <Stage
            width={scaledStageWidth}
            height={scaledStageHeight}
            scaleX={stageScale}
            scaleY={stageScale}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) setSelectedShapeId(null);
            }}
            onTouchStart={(e) => {
              if (e.target === e.target.getStage()) setSelectedShapeId(null);
            }}
          >
            <Layer>
                {isQuizMode &&
                  currentQuestion.targets.map((target, idx) =>
                    renderTargetSlot(target, matchedTargetIndices.includes(idx), `target-slot-${idx}`)
                  )}
                {shapes.map((shape) => {
            const isSelected = shape.id === selectedShapeId && !shape.isLocked;
            const shapeStroke = isSelected ? "#3853ff" : undefined;
            const shapeStrokeWidth = isSelected ? 4 : 0;
            const shapeOpacity = 1;
            // くぼみにはまっている形はドラッグで動かせないようにする（ロック済みの形も同様）。
            const isDraggable = !shape.isLocked && !isShapeInSlot(shape);
            const scaleProps = {
              scaleX: shapeScale,
              scaleY: shapeScale,
              strokeScaleEnabled: false
            };
            const selectionShadow = isSelected
              ? {
                  shadowColor: "#3853ff",
                  shadowBlur: 14,
                  shadowOpacity: 0.55,
                  shadowOffsetX: 0,
                  shadowOffsetY: 0
                }
              : {};
            if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={60}
                  rotation={shape.rotation}
                  fill={shape.color}
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  {...scaleProps}
                  {...selectionShadow}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
                    setSelectedShapeId(null);
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => handleShapeTap(shape.id)}
                  onTap={() => handleShapeTap(shape.id)}
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
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  {...scaleProps}
                  {...selectionShadow}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
                    setSelectedShapeId(null);
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => handleShapeTap(shape.id)}
                  onTap={() => handleShapeTap(shape.id)}
                />
              );
            }

            if (shape.type === "heart") {
              return (
                <Path
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  data={HEART_PATH_DATA}
                  rotation={shape.rotation}
                  fill={shape.color}
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  {...scaleProps}
                  {...selectionShadow}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
                    setSelectedShapeId(null);
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => handleShapeTap(shape.id)}
                  onTap={() => handleShapeTap(shape.id)}
                />
              );
            }

            if (shape.type === "star") {
              return (
                <Line
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  points={STAR_POINTS.flat()}
                  rotation={shape.rotation}
                  fill={shape.color}
                  closed
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  {...scaleProps}
                  {...selectionShadow}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
                    setSelectedShapeId(null);
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => handleShapeTap(shape.id)}
                  onTap={() => handleShapeTap(shape.id)}
                />
              );
            }

            if (shape.type === "rectangle") {
              return (
                <Line
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  points={RECTANGLE_POINTS.flat()}
                  rotation={shape.rotation}
                  fill={shape.color}
                  closed
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  {...scaleProps}
                  {...selectionShadow}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
                    setSelectedShapeId(null);
                    if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                  }}
                  onDragEnd={(e) => {
                    if (e.target instanceof Konva.Shape) {
                      animateDragging(e.target, false);
                      handleDragEndById(shape.id, e.target.x(), e.target.y());
                    }
                  }}
                  onClick={() => handleShapeTap(shape.id)}
                  onTap={() => handleShapeTap(shape.id)}
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
                stroke={shapeStroke}
                strokeWidth={shapeStrokeWidth}
                opacity={shapeOpacity}
                {...scaleProps}
                {...selectionShadow}
                draggable={isDraggable}
                dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                onDragStart={(e) => {
                  setSelectedShapeId(null);
                  if (e.target instanceof Konva.Shape) animateDragging(e.target, true);
                }}
                onDragEnd={(e) => {
                  if (e.target instanceof Konva.Shape) {
                    animateDragging(e.target, false);
                    handleDragEndById(shape.id, e.target.x(), e.target.y());
                  }
                }}
                onClick={() => handleShapeTap(shape.id)}
                onTap={() => handleShapeTap(shape.id)}
              />
            );
                })}
            </Layer>
          </Stage>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: isNarrowScreen ? "6px" : "10px",
          rowGap: "8px",
          padding: isNarrowScreen ? "8px" : "10px",
          borderRadius: "12px",
          background: "#f4f6ff"
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            width: isNarrowScreen ? "100%" : "auto",
            justifyContent: isNarrowScreen ? "center" : "flex-start"
          }}
        >
          {paletteShapesForCurrentMode.map((type) => {
            const isActiveForChange = isShapeSelected && selectedShapeData?.type === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  if (applyTypeToSelected(type)) return;
                  const colorToUse =
                    selectedColor ?? COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
                  addShape(type, colorToUse);
                  flashRecentlyAddedShape(type);
                }}
                aria-label={isShapeSelected ? `選択中の形を ${type} に変更` : `${type} を追加`}
                style={{
                  border: isActiveForChange
                    ? "2px solid #3853ff"
                    : recentlyAddedShape === type && !isShapeSelected
                    ? "2px solid #5470ff"
                    : "1px solid #c6cce0",
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: isNarrowScreen ? "8px" : "10px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isNarrowScreen ? "54px" : "48px",
                  height: isNarrowScreen ? "54px" : "48px"
                }}
              >
                {renderPaletteShape(type)}
              </button>
            );
          })}
        </div>
        {isNarrowScreen && (
          <div aria-hidden style={{ flexBasis: "100%", height: 0 }} />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isNarrowScreen ? "4px" : "8px",
            marginLeft: isNarrowScreen ? "0" : "4px",
            flexWrap: "wrap"
          }}
        >
          {COLOR_OPTIONS.map((color) => {
            const isActiveForChange = isShapeSelected && selectedShapeData?.color === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => {
                  if (applyColorToSelected(color)) return;
                  setSelectedColor((current) => (current === color ? null : color));
                }}
                aria-label={isShapeSelected ? `選択中の形の色を変更` : `色 ${color} を選択`}
                style={{
                  width: isNarrowScreen ? "38px" : "28px",
                  height: isNarrowScreen ? "38px" : "28px",
                  borderRadius: "999px",
                  border: isActiveForChange
                    ? "3px solid #3853ff"
                    : selectedColor === color && !isShapeSelected
                    ? "3px solid #1f2b52"
                    : "1px solid #8a93b2",
                  background: color,
                  cursor: "pointer",
                  boxSizing: "border-box",
                  padding: 0
                }}
              />
            );
          })}
        </div>
        {isNarrowScreen && (
          <div aria-hidden style={{ flexBasis: "100%", height: 0 }} />
        )}
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!isShapeSelected}
          aria-label="選択中の形を削除"
          title="削除"
          style={{
            border: "1px solid #c6cce0",
            background: isShapeSelected ? "#ffe3e6" : "#f2f4fb",
            color: isShapeSelected ? "#a52033" : "#a3a9bf",
            borderRadius: "10px",
            padding: isNarrowScreen ? "12px 14px" : "8px 10px",
            fontWeight: 700,
            fontSize: isNarrowScreen ? "0.9rem" : "0.95rem",
            cursor: isShapeSelected ? "pointer" : "not-allowed",
            display: isNarrowScreen ? "none" : "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <svg width={isNarrowScreen ? 26 : 20} height={isNarrowScreen ? 26 : 20} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 7h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M10 7V4h4v3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path
              d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path d="M10 11v7M14 11v7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          {!isNarrowScreen && <span>削除</span>}
        </button>
        <button
          type="button"
          onClick={rotateSelected}
          disabled={!isShapeSelected}
          aria-label="選択中の形を回転"
          title="回転"
          style={{
            border: "1px solid #c6cce0",
            background: isShapeSelected ? "#e8efff" : "#f2f4fb",
            color: isShapeSelected ? "#1f2b52" : "#a3a9bf",
            borderRadius: "10px",
            padding: isNarrowScreen ? "12px 14px" : "8px 10px",
            fontWeight: 700,
            fontSize: isNarrowScreen ? "0.9rem" : "0.95rem",
            cursor: isShapeSelected ? "pointer" : "not-allowed",
            display: isNarrowScreen ? "none" : "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <svg width={isNarrowScreen ? 26 : 20} height={isNarrowScreen ? 26 : 20} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 12a9 9 0 1 1-3.2-6.88"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          {!isNarrowScreen && <span>回転</span>}
        </button>
      </div>
      {isNarrowScreen && (
        <>
          <button
            type="button"
            onClick={deleteSelected}
            disabled={!isShapeSelected}
            aria-label="選択中の形を削除"
            title="削除"
            style={{
              position: "fixed",
              left: "12px",
              bottom: "12px",
              zIndex: 25,
              border: "1px solid #c6cce0",
              background: isShapeSelected ? "#ffe3e6" : "#f2f4fb",
              color: isShapeSelected ? "#a52033" : "#a3a9bf",
              borderRadius: "12px",
              padding: "12px 14px",
              fontWeight: 700,
              cursor: isShapeSelected ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M10 7V4h4v3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path
                d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path d="M10 11v7M14 11v7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={rotateSelected}
            disabled={!isShapeSelected}
            aria-label="選択中の形を回転"
            title="回転"
            style={{
              position: "fixed",
              right: "12px",
              bottom: "12px",
              zIndex: 25,
              border: "1px solid #c6cce0",
              background: isShapeSelected ? "#e8efff" : "#f2f4fb",
              color: isShapeSelected ? "#1f2b52" : "#a3a9bf",
              borderRadius: "12px",
              padding: "12px 14px",
              fontWeight: 700,
              cursor: isShapeSelected ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M21 12a9 9 0 1 1-3.2-6.88"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
