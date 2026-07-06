import { ImageResponse } from "next/og";

export const alt = "Sanjay Gandhi — Tech Lead, Distributed Systems and AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#f3f1ea", color: "#161714", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "72px 82px", width: "100%" }}>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>SM<span style={{ color: "#5368bf" }}>.</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ color: "#5368bf", display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>Tech Lead · Distributed Systems · AI</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -4, lineHeight: 1.02 }}>I build reliable systems<br />for real-world scale.</div>
      </div>
      <div style={{ borderTop: "2px solid #c9c6bb", display: "flex", fontSize: 25, justifyContent: "space-between", paddingTop: 22 }}>
        <span>Sanjay Gandhi</span><span style={{ color: "#59699f" }}>Oracle · Google · Amazon</span>
      </div>
    </div>,
    size,
  );
}
