import ShapeStageClient from "./shape-stage-client";

export default function HomePage() {
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
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.08)"
        }}
      >
        <h1 style={{ margin: "0 0 16px", fontSize: "1.25rem" }}>
          Draggable Shapes
        </h1>
        <ShapeStageClient />
      </section>
    </main>
  );
}
