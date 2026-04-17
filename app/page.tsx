"use client";

import { useState } from "react";
import ShapeStageClient from "./shape-stage-client";

type QuizDifficulty = "easy" | "medium" | "hard";
type StageMode = "free" | "quiz-easy" | "quiz-medium" | "quiz-hard";

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<StageMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>("easy");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "clamp(6px, 2vw, 16px)",
        boxSizing: "border-box",
        overflowX: "hidden"
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
        <h1 style={{ margin: "0 0 16px", fontSize: "1.25rem" }}>
          Shape Playground
        </h1>

        {!selectedMode ? (
          <div style={{ display: "grid", gap: "12px" }}>
            <p style={{ margin: 0, color: "#44506b", fontWeight: 700 }}>
              モードを選んでスタートしよう
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setSelectedMode("free")}
                style={{
                  border: "1px solid #c6cce0",
                  background: "#f7f9ff",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  minWidth: "min(220px, 100%)",
                  flex: "1 1 220px",
                  textAlign: "left",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <strong style={{ display: "block", marginBottom: "6px" }}>好きに遊ぶモード</strong>
                <span style={{ color: "#5b6685" }}>自由に図形を置いて動かせる</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDifficulty("easy");
                  setSelectedMode("quiz-easy");
                }}
                style={{
                  border: "1px solid #c6cce0",
                  background: "#f7f9ff",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  minWidth: "min(220px, 100%)",
                  flex: "1 1 220px",
                  textAlign: "left",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <strong style={{ display: "block", marginBottom: "6px" }}>問題モード</strong>
                <span style={{ color: "#5b6685" }}>5問クリアを目指すチャレンジ</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            <button
              type="button"
              onClick={() => {
                setSelectedMode(null);
                setSelectedDifficulty("easy");
              }}
              style={{
                width: "fit-content",
                border: "1px solid #c6cce0",
                background: "#ffffff",
                borderRadius: "10px",
                padding: "8px 12px",
                cursor: "pointer"
              }}
            >
              ← TOPに戻る
            </button>
            {selectedMode !== "free" && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(["easy", "medium", "hard"] as const).map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => {
                      setSelectedDifficulty(difficulty);
                      setSelectedMode(`quiz-${difficulty}`);
                    }}
                    style={{
                      border: selectedDifficulty === difficulty ? "2px solid #5470ff" : "1px solid #c6cce0",
                      background: "#ffffff",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {difficulty === "easy" ? "易" : difficulty === "medium" ? "中" : "難"}
                  </button>
                ))}
              </div>
            )}
            <ShapeStageClient key={`${selectedMode}-${selectedDifficulty}`} mode={selectedMode} />
          </div>
        )}
      </section>
    </main>
  );
}
