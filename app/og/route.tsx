import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020817",
          border: "2px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "10px",
            backgroundColor: "#3b82f6",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px",
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "30px",
            boxShadow: "0 0 50px rgba(59, 130, 246, 0.2)",
          }}
        >
          {/* Nagy ikon */}
          <div
            style={{
              fontSize: 100,
              marginBottom: "40px",
              display: "flex",
            }}
          >
            ⚽
          </div>

          <h1
            style={{
              fontSize: 70,
              fontWeight: 900,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "8px",
              margin: 0,
              textAlign: "center",
              display: "flex",
            }}
          >
            <span style={{ color: "#3b82f6", marginRight: "5px" }}>WC</span>2026
          </h1>

          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#94a3b8",
              marginTop: "15px",
              textTransform: "uppercase",
              letterSpacing: "3px",
              display: "flex",
            }}
          >
            Predict. Win. Lead.
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "30px",
            fontSize: 24,
            color: "#94a3b8",
            display: "flex",
            gap: "15px",
            fontWeight: 600,
          }}
        >
          🇺🇸 USA 🇨🇦 CAN 🇲🇽 MEX
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error: any) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
