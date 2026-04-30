"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import ShapeStageClient from "./shape-stage-client";

type QuizDifficulty = "easy" | "medium" | "hard" | "oni";
type StageMode = "free" | "quiz-easy" | "quiz-medium" | "quiz-hard" | "quiz-oni";
type MenuColorTheme = {
  border: string;
  background: string;
  title: string;
  desc: string;
  star: string;
};

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<StageMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>("easy");
  const [questionProgress, setQuestionProgress] = useState({ current: 0, total: 0 });
  const [clearRequestKey, setClearRequestKey] = useState(0);
  const difficultyLabelMap: Record<QuizDifficulty, string> = {
    easy: "易",
    medium: "中",
    hard: "難",
    oni: "鬼"
  };
  const difficultyStarsMap: Record<QuizDifficulty, string> = {
    easy: "★",
    medium: "★★",
    hard: "★★★",
    oni: "★★★★"
  };
  const menuColorThemeByDifficulty: Record<QuizDifficulty, MenuColorTheme> = {
    easy: {
      border: "#7cb3ff",
      background: "#eef5ff",
      title: "#234991",
      desc: "#3f64a5",
      star: "#2f56a5"
    },
    medium: {
      border: "#66cfa6",
      background: "#ecfff6",
      title: "#1c6a4e",
      desc: "#2f7f62",
      star: "#2b765d"
    },
    hard: {
      border: "#ffb567",
      background: "#fff6ea",
      title: "#9a4b11",
      desc: "#a85e29",
      star: "#8b4b17"
    },
    oni: {
      border: "#e07a6a",
      background: "#fff6f4",
      title: "#a6281b",
      desc: "#a64b41",
      star: "#b33a2c"
    }
  };
  const handleQuestionProgressChange = useCallback((current: number, total: number) => {
    setQuestionProgress((prev) => {
      if (prev.current === current && prev.total === total) return prev;
      return { current, total };
    });
  }, []);
  const handleQuizComplete = () => {
    if (selectedMode === "free") return;
    if (selectedDifficulty === "oni") {
      setSelectedMode(null);
      setSelectedDifficulty("easy");
      setQuestionProgress({ current: 0, total: 0 });
      return;
    }

    const nextDifficulty: Record<Exclude<QuizDifficulty, "oni">, QuizDifficulty> = {
      easy: "medium",
      medium: "hard",
      hard: "oni"
    };
    const next = nextDifficulty[selectedDifficulty];
    setSelectedDifficulty(next);
    setSelectedMode(`quiz-${next}`);
    setQuestionProgress({ current: 1, total: 5 });
  };

  return (
    <main
      style={{
        height: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "clamp(6px, 2vw, 16px)",
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "clamp(10px, 2.5vw, 20px)",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
          width: "min(980px, 100%)",
          maxWidth: "100%",
          boxSizing: "border-box"
        }}
      >
        {!selectedMode ? (
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Image
                src="/logo.png"
                alt="かたち ロゴ"
                width={180}
                height={98}
                priority
                style={{ width: "clamp(120px, 32vw, 220px)", height: "auto" }}
              />
            </div>
            <p style={{ margin: 0, color: "#44506b", fontWeight: 700 }}>
              モードを選んでスタートしよう
            </p>
            <div style={{ display: "grid", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setSelectedMode("free")}
                style={{
                  border: "1px solid #a3b4ff",
                  background: "linear-gradient(135deg, #eaf0ff 0%, #f7f9ff 100%)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <strong style={{ display: "block", marginBottom: "6px", color: "#2c3d8f" }}>
                  好きに遊ぶモード
                </strong>
                <span style={{ color: "#43568f" }}>自由に図形を置いて動かせる</span>
              </button>
              {([
                { key: "easy", label: "易", desc: "はじめてでも安心" },
                { key: "medium", label: "中", desc: "ちょっとチャレンジ" },
                { key: "hard", label: "難", desc: "しっかり頭をつかう" },
                { key: "oni", label: "鬼", desc: "最強レベルに挑戦" }
              ] as const).map((item) => {
                const isOni = item.key === "oni";
                const colorTheme = menuColorThemeByDifficulty[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedDifficulty(item.key);
                      setSelectedMode(`quiz-${item.key}`);
                      setQuestionProgress({ current: 1, total: 5 });
                    }}
                    style={{
                      border: `1px solid ${colorTheme.border}`,
                      background: colorTheme.background,
                      borderRadius: "12px",
                      padding: "14px 16px",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      color: colorTheme.title
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: "6px" }}>
                      {`問題モード（${item.label}）`}
                    </strong>
                    <span style={{ display: "block", color: colorTheme.desc }}>
                      {item.desc}
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color: colorTheme.star,
                        fontWeight: 700
                      }}
                    >
                      {`星 ${difficultyStarsMap[item.key]}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                padding: "10px",
                borderRadius: "12px",
                background: "#f4f6ff"
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedMode(null);
                  setSelectedDifficulty("easy");
                  setQuestionProgress({ current: 0, total: 0 });
                }}
                style={{
                  width: "fit-content",
                  border: "none",
                  background: "transparent",
                  borderRadius: "10px",
                  padding: 0,
                  cursor: "pointer",
                  lineHeight: 0
                }}
                aria-label="TOPへ戻る"
              >
                <Image
                  src="/logo.png"
                  alt="かたち ロゴ"
                  width={180}
                  height={98}
                  priority
                  style={{ width: "clamp(84px, 24vw, 160px)", height: "auto" }}
                />
              </button>
              {selectedMode !== "free" && (
                <span
                  style={{
                    marginLeft: "auto",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #c6cce0",
                    background: "#ffffff",
                    fontWeight: 700,
                    color: "#44506b"
                  }}
                >
                  {`難易度：${difficultyLabelMap[selectedDifficulty]} ${difficultyStarsMap[selectedDifficulty]}`}
                </span>
              )}
              {selectedMode !== "free" && (
                <span
                  style={{
                    marginLeft: "4px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #c6cce0",
                    background: "#ffffff",
                    fontWeight: 700,
                    color: "#44506b"
                  }}
                >
                  {`第${questionProgress.current}/${questionProgress.total}問`}
                </span>
              )}
              <button
                type="button"
                onClick={() => setClearRequestKey((current) => current + 1)}
                style={{
                  marginLeft: "auto",
                  border: "1px solid #c6cce0",
                  background: "#ffffff",
                  color: "#36405f",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                リセット
              </button>
            </div>
            <ShapeStageClient
              key={`${selectedMode}-${selectedDifficulty}`}
              mode={selectedMode}
              onQuizComplete={handleQuizComplete}
              onQuestionProgressChange={handleQuestionProgressChange}
              clearRequestKey={clearRequestKey}
            />
          </div>
        )}
      </section>
    </main>
  );
}
