import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const healthPath = process.env.BACKEND_HEALTH_PATH;
  const timeoutMs = Number(process.env.BACKEND_HEALTH_TIMEOUT_MS);
  if (!configuredBase || !healthPath || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }
  const base = configuredBase.replace(/\/$/, "");
  const path = healthPath.startsWith("/") ? healthPath : `/${healthPath}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${base}${path}`, { cache: "no-store", signal: controller.signal });
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
