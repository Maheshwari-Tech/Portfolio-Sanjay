type SiteRecord = { id: string; data: unknown };

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const siteSlug = process.env.NEXT_PUBLIC_SITE_SLUG ?? "sanjay-portfolio";
const timeoutMs = Number(process.env.BACKEND_CONTENT_TIMEOUT_MS ?? "3000");
const revalidateSeconds = Number(process.env.BACKEND_CONTENT_REVALIDATE_SECONDS ?? "120");
const retiredProjectNames = new Set([
  "Resume Builder",
  "Bio Data Builder",
  "Portfolio Website Builder",
]);

function normalizeContent<T>(resource: string, value: T, fallback: T): T {
  if (resource === "experience" && Array.isArray(value) && Array.isArray(fallback)) {
    const remoteByCompany = new Map(value.map((item) => [item?.company, item]));
    return fallback.map((item) => ({ ...remoteByCompany.get(item?.company), ...item })) as T;
  }
  if (resource === "blogs" && Array.isArray(value) && Array.isArray(fallback)) {
    const merged = new Map(fallback.map((item: any) => [item?.id, item]));
    value.forEach((item: any) => merged.set(item?.id, { ...merged.get(item?.id), ...item }));
    return Array.from(merged.values()) as T;
  }
  if (resource !== "projects" || !Array.isArray(value)) return value;

  const visible = value.filter((item) => {
    if (!item || typeof item !== "object") return true;
    const name = "name" in item ? String(item.name) : "";
    return !retiredProjectNames.has(name);
  });
  const fallbackProjects = Array.isArray(fallback) ? fallback : [];
  const familyGraph = fallbackProjects.find(
    (item) =>
      item &&
      typeof item === "object" &&
      "id" in item &&
      Number(item.id) === 38,
  );

  if (
    familyGraph &&
    !visible.some(
      (item) =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        Number(item.id) === 38,
    )
  ) {
    visible.push(familyGraph);
  }

  return visible as T;
}

export async function backendFirst<T>(resource: string, fallback: T): Promise<T> {
  if (!apiBase || !siteSlug) return normalizeContent(resource, fallback, fallback);
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
      const resolved =
        Array.isArray(payload) && payload.length > 0 ? (payload as T) : fallback;
      return normalizeContent(resource, resolved, fallback);
    }
    const body = payload as { items?: SiteRecord[] };
    if (!Array.isArray(body.items) || body.items.length === 0) return fallback;
    if (Array.isArray(fallback)) {
      return normalizeContent(
        resource,
        body.items.map((item) => item.data) as T,
        fallback,
      );
    }
    const document = body.items.find((item) => item.id === "document") ?? body.items[0];
    return normalizeContent(resource, document.data as T, fallback);
  } catch {
    return normalizeContent(resource, fallback, fallback);
  }
}
