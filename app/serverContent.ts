type SiteRecord = { id: string; data: unknown };

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const siteSlug = process.env.NEXT_PUBLIC_SITE_SLUG ?? "sanjay-portfolio";
const timeoutMs = Number(process.env.BACKEND_CONTENT_TIMEOUT_MS ?? "3000");
const revalidateSeconds = Number(process.env.BACKEND_CONTENT_REVALIDATE_SECONDS ?? "120");

export async function backendFirst<T>(resource: string, fallback: T): Promise<T> {
  if (!apiBase || !siteSlug) return fallback;
  try {
    const legacyPath = siteSlug === "sanjay-portfolio" && resource === "blogs"
      ? "/content/blogs"
      : siteSlug === "sanjay-portfolio" && resource === "projects"
        ? "/content/projects"
        : null;
    const response = await fetch(`${apiBase}${legacyPath ?? `/v1/sites/${siteSlug}/${resource}`}`, {
      next: { revalidate: Number.isFinite(revalidateSeconds) ? revalidateSeconds : 120 },
      signal: AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 3000),
    });
    if (!response.ok) return fallback;
    const payload = await response.json();
    if (legacyPath) {
      return Array.isArray(payload) && payload.length > 0 ? payload as T : fallback;
    }
    const body = payload as { items?: SiteRecord[] };
    if (!Array.isArray(body.items) || body.items.length === 0) return fallback;
    if (Array.isArray(fallback)) return body.items.map((item) => item.data) as T;
    const document = body.items.find((item) => item.id === "document") ?? body.items[0];
    return document.data as T;
  } catch {
    return fallback;
  }
}
