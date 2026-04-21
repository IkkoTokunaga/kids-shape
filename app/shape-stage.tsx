"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Konva from "konva";
import { Layer, Stage, Circle, Rect, RegularPolygon, Line } from "react-konva";

type ShapeType = "circle" | "square" | "triangle" | "trapezoid" | "parallelogram" | "diamond";
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
  trapezoid: "#CDB4DB",
  parallelogram: "#B8E1DD",
  diamond: "#FFD166"
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
  "trapezoid",
  "parallelogram",
  "diamond"
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
      { type: "trapezoid", x: 620, y: 230, rotation: 180 },
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
      { type: "trapezoid", x: 600, y: 220, rotation: 180 },
      { type: "parallelogram", x: 740, y: 220, rotation: 180 },
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
      { type: "trapezoid", x: 700, y: 210, rotation: 180 },
      { type: "circle", x: 820, y: 210, rotation: 0 },
      { type: "parallelogram", x: 640, y: 330, rotation: 180 },
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
      { type: "trapezoid", x: 560, y: 210, rotation: 180 },
      { type: "parallelogram", x: 690, y: 210, rotation: 180 },
      { type: "diamond", x: 820, y: 210, rotation: 90 },
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
      { type: "diamond", x: 740, y: 210, rotation: 90 },
      { type: "triangle", x: 820, y: 210, rotation: 180 },
      { type: "parallelogram", x: 600, y: 330, rotation: 180 },
      { type: "trapezoid", x: 760, y: 330, rotation: 180 }
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
      { type: "diamond", x: 820, y: 200, rotation: 90 },
      { type: "parallelogram", x: 570, y: 330, rotation: 180 },
      { type: "trapezoid", x: 700, y: 330, rotation: 180 },
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
      { type: "diamond", x: 720, y: 190, rotation: 90 },
      { type: "trapezoid", x: 820, y: 190, rotation: 180 },
      { type: "parallelogram", x: 540, y: 320, rotation: 180 },
      { type: "square", x: 660, y: 320, rotation: 90 },
      { type: "triangle", x: 780, y: 320, rotation: 180 }
    ],
    snapDistance: 10,
    snapRotationTolerance: 10,
    judgeDistance: 9,
    rotationTolerance: 3
  }
];

// 鬼モード: くぼみを大量に配置する最難関。
// 可動範囲: x ∈ [85, 815], y ∈ [85, 415] に収まるよう全てのターゲットを内側に配置する。
const ONI_QUESTION_SETTINGS: QuestionSetting[] = [
  {
    targets: [
      { type: "triangle", x: 160, y: 200, rotation: 180 },
      { type: "square", x: 300, y: 200, rotation: 90 },
      { type: "circle", x: 440, y: 200, rotation: 0 },
      { type: "diamond", x: 580, y: 200, rotation: 90 },
      { type: "trapezoid", x: 720, y: 200, rotation: 180 },
      { type: "parallelogram", x: 200, y: 350, rotation: 0 },
      { type: "square", x: 340, y: 350, rotation: 0 },
      { type: "triangle", x: 480, y: 350, rotation: 0 },
      { type: "circle", x: 620, y: 350, rotation: 0 },
      { type: "diamond", x: 760, y: 350, rotation: 0 }
    ],
    snapDistance: 18,
    snapRotationTolerance: 18,
    judgeDistance: 14,
    rotationTolerance: 5
  },
  {
    targets: [
      { type: "triangle", x: 150, y: 160, rotation: 180 },
      { type: "square", x: 290, y: 160, rotation: 90 },
      { type: "circle", x: 430, y: 160, rotation: 0 },
      { type: "diamond", x: 570, y: 160, rotation: 90 },
      { type: "trapezoid", x: 710, y: 160, rotation: 180 },
      { type: "parallelogram", x: 220, y: 310, rotation: 180 },
      { type: "triangle", x: 360, y: 310, rotation: 0 },
      { type: "square", x: 500, y: 310, rotation: 0 },
      { type: "circle", x: 640, y: 310, rotation: 0 },
      { type: "diamond", x: 780, y: 310, rotation: 0 },
      { type: "trapezoid", x: 290, y: 400, rotation: 0 },
      { type: "parallelogram", x: 600, y: 400, rotation: 0 }
    ],
    snapDistance: 16,
    snapRotationTolerance: 16,
    judgeDistance: 12,
    rotationTolerance: 4
  },
  {
    targets: [
      { type: "triangle", x: 150, y: 150, rotation: 180 },
      { type: "square", x: 290, y: 150, rotation: 90 },
      { type: "circle", x: 430, y: 150, rotation: 0 },
      { type: "diamond", x: 570, y: 150, rotation: 90 },
      { type: "trapezoid", x: 710, y: 150, rotation: 180 },
      { type: "parallelogram", x: 180, y: 280, rotation: 0 },
      { type: "triangle", x: 320, y: 280, rotation: 0 },
      { type: "square", x: 460, y: 280, rotation: 0 },
      { type: "circle", x: 600, y: 280, rotation: 0 },
      { type: "diamond", x: 740, y: 280, rotation: 0 },
      { type: "trapezoid", x: 220, y: 400, rotation: 0 },
      { type: "parallelogram", x: 400, y: 400, rotation: 180 },
      { type: "square", x: 560, y: 400, rotation: 90 },
      { type: "triangle", x: 720, y: 400, rotation: 180 }
    ],
    snapDistance: 14,
    snapRotationTolerance: 14,
    judgeDistance: 11,
    rotationTolerance: 4
  },
  {
    targets: [
      { type: "circle", x: 140, y: 150, rotation: 0 },
      { type: "triangle", x: 280, y: 150, rotation: 180 },
      { type: "square", x: 420, y: 150, rotation: 90 },
      { type: "diamond", x: 560, y: 150, rotation: 90 },
      { type: "trapezoid", x: 700, y: 150, rotation: 180 },
      { type: "parallelogram", x: 180, y: 280, rotation: 180 },
      { type: "square", x: 320, y: 280, rotation: 0 },
      { type: "triangle", x: 460, y: 280, rotation: 0 },
      { type: "diamond", x: 600, y: 280, rotation: 0 },
      { type: "circle", x: 740, y: 280, rotation: 0 },
      { type: "triangle", x: 160, y: 400, rotation: 180 },
      { type: "trapezoid", x: 300, y: 400, rotation: 0 },
      { type: "parallelogram", x: 450, y: 400, rotation: 0 },
      { type: "square", x: 600, y: 400, rotation: 90 },
      { type: "diamond", x: 720, y: 400, rotation: 90 },
      { type: "circle", x: 800, y: 280, rotation: 0 }
    ],
    snapDistance: 12,
    snapRotationTolerance: 12,
    judgeDistance: 10,
    rotationTolerance: 3
  },
  {
    targets: [
      { type: "circle", x: 130, y: 150, rotation: 0 },
      { type: "triangle", x: 260, y: 150, rotation: 180 },
      { type: "square", x: 390, y: 150, rotation: 90 },
      { type: "diamond", x: 520, y: 150, rotation: 90 },
      { type: "trapezoid", x: 660, y: 150, rotation: 180 },
      { type: "parallelogram", x: 790, y: 150, rotation: 180 },
      { type: "parallelogram", x: 160, y: 280, rotation: 0 },
      { type: "square", x: 290, y: 280, rotation: 0 },
      { type: "triangle", x: 420, y: 280, rotation: 0 },
      { type: "circle", x: 550, y: 280, rotation: 0 },
      { type: "diamond", x: 680, y: 280, rotation: 0 },
      { type: "trapezoid", x: 790, y: 280, rotation: 0 },
      { type: "triangle", x: 130, y: 400, rotation: 180 },
      { type: "diamond", x: 260, y: 400, rotation: 90 },
      { type: "square", x: 390, y: 400, rotation: 0 },
      { type: "parallelogram", x: 530, y: 400, rotation: 180 },
      { type: "circle", x: 670, y: 400, rotation: 0 },
      { type: "triangle", x: 790, y: 400, rotation: 0 }
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
  if (type === "square" || type === "diamond") return 90;
  if (type === "parallelogram") return 180;
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
};

const BASE_STAGE_WIDTH = 900;
const BASE_STAGE_HEIGHT = 500;
const NEXT_QUESTION_DELAY_MS = 1300;
const EDGE_SAFE_PADDING = 10;
const SNAP_SOUND_FILE_URL = "/sounds/peta.mp3";
const SHAPE_OUTLINE_STROKE = "rgba(27, 40, 83, 0.28)";
const SHAPE_OUTLINE_STROKE_WIDTH = 1.5;
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
const TRAPEZOID_POINTS: [number, number][] = [
  [-60, 48],
  [60, 48],
  [36, -48],
  [-36, -48]
];
const PARALLELOGRAM_POINTS: [number, number][] = [
  [-45, -48],
  [75, -48],
  [45, 48],
  [-75, 48]
];
const DIAMOND_POINTS: [number, number][] = [
  [0, -66],
  [58, 0],
  [0, 66],
  [-58, 0]
];

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

const getShapeHalfExtents = (type: ShapeType, rotation: number) => {
  if (type === "circle") return { halfWidth: 60, halfHeight: 60 };
  if (type === "square") return getRotatedHalfExtents(SQUARE_POINTS, rotation);
  if (type === "triangle") return getRotatedHalfExtents(TRIANGLE_POINTS, rotation);
  if (type === "trapezoid") return getRotatedHalfExtents(TRAPEZOID_POINTS, rotation);
  if (type === "parallelogram") return getRotatedHalfExtents(PARALLELOGRAM_POINTS, rotation);
  return getRotatedHalfExtents(DIAMOND_POINTS, rotation);
};

export default function ShapeStage({ mode }: ShapeStageProps) {
  const [selectedShape, setSelectedShape] = useState<ShapeType>("circle");
  const [selectedColor, setSelectedColor] = useState<string>(SHAPE_COLORS.circle);
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [matchedTargetIndices, setMatchedTargetIndices] = useState<number[]>([]);
  const [isAllSolved, setIsAllSolved] = useState(false);
  const [judgeResult, setJudgeResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [celebrationLevel, setCelebrationLevel] = useState<0 | 1 | 2>(0);
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
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

  const unmatchedTargets = currentQuestion.targets.filter((_, idx) => !matchedTargetIndices.includes(idx));
  const visualStageWidth = Math.max(200, stageHostWidth);
  const reservedHeight = isNarrowScreen ? (isQuizMode ? 280 : 240) : (isQuizMode ? 340 : 300);
  const maxStageVisualHeight = Math.max(200, viewportHeight - reservedHeight);
  const widthScale = visualStageWidth / BASE_STAGE_WIDTH;
  const heightScale = maxStageVisualHeight / BASE_STAGE_HEIGHT;
  const stageScale = Math.min(1, widthScale, heightScale);
  const internalStageWidth = BASE_STAGE_WIDTH;
  const scaledStageWidth = Math.ceil(BASE_STAGE_WIDTH * stageScale);
  const scaledStageHeight = Math.ceil(BASE_STAGE_HEIGHT * stageScale);
  const visibleInternalWidth = scaledStageWidth / Math.max(stageScale, 0.01);
  const visibleInternalHeight = scaledStageHeight / Math.max(stageScale, 0.01);
  const boundedStageWidth = Math.min(internalStageWidth, visibleInternalWidth);
  const boundedStageHeight = Math.min(BASE_STAGE_HEIGHT, visibleInternalHeight);

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
    setCelebrationLevel(0);
    setShowCorrectPopup(false);
  }, [questionIndex]);

  useEffect(() => {
    setQuestionIndex(0);
    setShapes([]);
    setMatchedTargetIndices([]);
    setIsAllSolved(false);
    setJudgeResult("idle");
  }, [difficulty]);

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

  const getOrCreateAudio = async () => {
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
  };

  const playSuccessSound = async (level: 1 | 2) => {
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
  };

  const playSnapSynth = () => {
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
  };

  const playSnapSound = () => {
    const snapAudio = snapAudioRef.current;
    if (snapAudio) {
      snapAudio.currentTime = 0;
      void snapAudio.play().catch(() => {
        playSnapSynth();
      });
      return;
    }

    playSnapSynth();
  };

  const animateDragging = (target: Konva.Shape, active: boolean) => {
    if (active) {
      // Prime / resume audio on user gesture to remove first-play latency.
      void getOrCreateAudio().catch(() => undefined);
    }
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

  const getDragBoundPosition = (shape: ShapeItem, absPos: { x: number; y: number }) => {
    // Konva's dragBoundFunc gives and expects ABSOLUTE (pixel) coordinates.
    // Convert to internal (layer) coordinates, clamp there with fixed internal
    // padding, then convert back so bounds are independent of stageScale.
    const safeScale = Math.max(stageScale, 0.01);
    const internalX = absPos.x / safeScale;
    const internalY = absPos.y / safeScale;

    const { halfWidth, halfHeight } = getShapeHalfExtents(shape.type, shape.rotation);
    const minX = halfWidth + EDGE_SAFE_PADDING;
    const maxX = boundedStageWidth - halfWidth - EDGE_SAFE_PADDING;
    const minY = halfHeight + EDGE_SAFE_PADDING;
    const maxY = boundedStageHeight - halfHeight - EDGE_SAFE_PADDING;

    const clampedInternalX = Math.min(maxX, Math.max(minX, internalX));
    const clampedInternalY = Math.min(maxY, Math.max(minY, internalY));

    return {
      x: clampedInternalX * safeScale,
      y: clampedInternalY * safeScale
    };
  };

  const addShape = (type: ShapeType, color: string) => {
    setShapes((currentShapes) => {
      const nextIndex = currentShapes.filter((shape) => shape.type === type).length;
      const newShape: ShapeItem = {
        id: `${type}-${nextIndex}`,
        type,
        x: 120 + ((nextIndex * 85) % 620),
        y: 120 + ((nextIndex * 60) % 260),
        rotation: 0,
        isLocked: false,
        color
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
      listening: false,
      rotation: target.rotation ?? 0
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

  const isShapeInSlot = (shape: ShapeItem) => {
    if (shape.isLocked) return true;
    if (!isQuizMode) return false;
    return unmatchedTargets.some((target) => isCloseToSlot(shape, target, currentQuestion));
  };

  const handleShapeTap = (id: string) => {
    if (isDeleteMode) {
      const target = shapes.find((shape) => shape.id === id);
      if (!target || isShapeInSlot(target)) return;
      setShapes((currentShapes) => currentShapes.filter((shape) => shape.id !== id));
      setIsDeleteMode(false);
      return;
    }
    rotateShapeById(id);
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
      // Partial match: lock the correctly placed pieces but keep the question going.
      // Avoid the full "correct" celebration until every slot is filled.
      playSnapSound();
      setJudgeResult("idle");
      return;
    }

    setJudgeResult("correct");
    const soundLevel: 1 | 2 = isLastQuestion ? 2 : 1;
    void playSuccessSound(soundLevel).catch(() => undefined);

    if (isLastQuestion) {
      setIsAllSolved(true);
      return;
    }

    setShowCorrectPopup(true);
    window.setTimeout(() => {
      setShowCorrectPopup(false);
      setQuestionIndex((current) => current + 1);
      setShapes([]);
      setMatchedTargetIndices([]);
      setJudgeResult("idle");
    }, NEXT_QUESTION_DELAY_MS);
  };

  const clearScreen = () => {
    setShapes([]);
    setIsDeleteMode(false);
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
          flexWrap: "wrap",
          gap: isNarrowScreen ? "6px" : "10px",
          rowGap: "8px",
          padding: isNarrowScreen ? "8px" : "10px",
          borderRadius: "12px",
          background: "#f4f6ff"
        }}
      >
        {isQuizMode && (
          <span
            style={{
              fontWeight: 700,
              color: "#44506b",
              minWidth: isNarrowScreen ? "52px" : "68px",
              fontSize: isNarrowScreen ? "0.85rem" : "1rem"
            }}
          >
            {`第${questionIndex + 1}問`}
          </span>
        )}
        {PALETTE_SHAPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setSelectedShape(type);
              addShape(type, selectedColor);
            }}
            aria-label={`${type} を選択`}
            style={{
              border: selectedShape === type ? "2px solid #5470ff" : "1px solid #c6cce0",
              background: "#ffffff",
              borderRadius: "12px",
              padding: isNarrowScreen ? "6px" : "10px",
              fontSize: "0.9rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: isNarrowScreen ? "38px" : "48px",
              height: isNarrowScreen ? "38px" : "48px"
            }}
          >
            {renderPaletteShape(type)}
          </button>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isNarrowScreen ? "4px" : "8px",
            marginLeft: isNarrowScreen ? "0" : "4px",
            flexWrap: "wrap"
          }}
        >
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              aria-label={`色 ${color} を選択`}
              style={{
                width: isNarrowScreen ? "24px" : "28px",
                height: isNarrowScreen ? "24px" : "28px",
                borderRadius: "999px",
                border: selectedColor === color ? "3px solid #1f2b52" : "1px solid #8a93b2",
                background: color,
                cursor: "pointer",
                boxSizing: "border-box",
                padding: 0
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsDeleteMode((current) => !current)}
          aria-pressed={isDeleteMode}
          style={{
            border: isDeleteMode ? "2px solid #cc3344" : "1px solid #c6cce0",
            background: isDeleteMode ? "#ffe3e6" : "#ffffff",
            color: isDeleteMode ? "#a52033" : "#36405f",
            borderRadius: "10px",
            padding: isNarrowScreen ? "6px 10px" : "10px 12px",
            fontWeight: 700,
            fontSize: isNarrowScreen ? "0.8rem" : "0.95rem",
            cursor: "pointer"
          }}
        >
          {isDeleteMode ? "削除モード中" : "削除"}
        </button>
        <button
          type="button"
          onClick={clearScreen}
          style={{
            border: "1px solid #c6cce0",
            background: "#ffffff",
            color: "#36405f",
            borderRadius: "10px",
            padding: isNarrowScreen ? "6px 10px" : "10px 12px",
            fontWeight: 700,
            fontSize: isNarrowScreen ? "0.8rem" : "0.95rem",
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
          fontWeight: 700,
          fontSize: isNarrowScreen ? "0.85rem" : "1rem",
          lineHeight: 1.4,
          wordBreak: "break-word"
        }}
      >
        {isDeleteMode
          ? "削除モード: 消したい形をタップしてね（くぼみにはまった形は消せません）"
          : !isQuizMode
          ? "好きな形を置いて、ドラッグや回転で自由に遊ぼう"
          : isAllSolved
            ? `${questionSettings.length}問クリア！ぜんぶせいかい！すごい 🎊`
            : judgeResult === "correct"
              ? "せいかい！ ぴったりはまったね 🎉"
              : judgeResult === "wrong"
                ? "まだちがうよ。位置と向きをもう少し合わせてみよう"
                : `くぼみに合う形を置いて、OKを押して判定しよう（${difficulty === "easy" ? "易" : difficulty === "medium" ? "中" : difficulty === "hard" ? "難" : "鬼"} ${questionIndex + 1}/${questionSettings.length}・残り${currentQuestion.targets.length - matchedTargetIndices.length}こ）`}
      </p>
      <div ref={stageHostRef} style={{ display: "flex", justifyContent: "center", width: "100%", minWidth: 0 }}>
        <div style={{ width: scaledStageWidth, height: scaledStageHeight, position: "relative", overflow: "hidden", borderRadius: "16px", touchAction: "none" }}>
          {showCorrectPopup && (
            <div className="correct-popup" role="status" aria-live="polite">
              <div className="correct-popup-stars" aria-hidden>✨ 🌟 ✨</div>
              <div className="correct-popup-main">せいかい！</div>
              <div className="correct-popup-sub">つぎのもんだいへ しゅっぱつ！</div>
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
          >
            <Layer>
                {isQuizMode &&
                  currentQuestion.targets.map((target, idx) =>
                    renderTargetSlot(target, matchedTargetIndices.includes(idx), `target-slot-${idx}`)
                  )}
                {shapes.map((shape) => {
            const inSlot = isShapeInSlot(shape);
            const highlightAsDeletable = isDeleteMode && !inSlot;
            const shapeStroke = highlightAsDeletable ? "#cc3344" : SHAPE_OUTLINE_STROKE;
            const shapeStrokeWidth = highlightAsDeletable ? 3 : SHAPE_OUTLINE_STROKE_WIDTH;
            const shapeOpacity = isDeleteMode && inSlot ? 0.55 : 1;
            const isDraggable = !shape.isLocked && !isDeleteMode;
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
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
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
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
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
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
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
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
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
                  stroke={shapeStroke}
                  strokeWidth={shapeStrokeWidth}
                  opacity={shapeOpacity}
                  draggable={isDraggable}
                  dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                  onDragStart={(e) => {
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
                draggable={isDraggable}
                dragBoundFunc={(pos) => getDragBoundPosition(shape, pos)}
                onDragStart={(e) => {
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
