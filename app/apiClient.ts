const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
export const apiUrl = (path: string) => `${base}${path}`;
export class ApiUnavailableError extends Error {
  constructor() { super("The portfolio service is temporarily unavailable."); }
}

export async function apiFetch(path: string, init: RequestInit = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(apiUrl(path), { ...init, signal: controller.signal });
  } catch {
    throw new ApiUnavailableError();
  } finally {
    window.clearTimeout(timeout);
  }
}
export const authHeaders = () => {
  const token = typeof window === "undefined" ? null : localStorage.getItem("sanjay_portfolio_token");
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};
export const isLoggedIn = () => typeof window !== "undefined" && Boolean(localStorage.getItem("sanjay_portfolio_token"));
