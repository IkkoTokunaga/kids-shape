"use client";

import { useState } from "react";
import ShapeStageClient from "./shape-stage-client";

type Mode = "free" | "quiz";

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px"
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)",
          width: "min(980px, 100%)"
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
                  minWidth: "220px",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                <strong style={{ display: "block", marginBottom: "6px" }}>好きに遊ぶモード</strong>
                <span style={{ color: "#5b6685" }}>自由に図形を置いて動かせる</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode("quiz")}
                style={{
                  border: "1px solid #c6cce0",
                  background: "#f7f9ff",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  minWidth: "220px",
                  textAlign: "left",
                  cursor: "pointer"
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
              onClick={() => setSelectedMode(null)}
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
            <ShapeStageClient key={selectedMode} mode={selectedMode} />
          </div>
        )}
      </section>
    </main>
  );
}
