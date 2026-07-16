import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001").replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);
  try {
    const response = await fetch(`${base}/health`, { cache: "no-store", signal: controller.signal });
    return new NextResponse(null, {
      status: response.ok ? 204 : 503,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } finally {
    clearTimeout(timeout);
  }
}
