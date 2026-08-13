import { getSupabaseBrowserClient } from "./supabaseClient";

const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
export class ApiUnavailableError extends Error {
  constructor() { super("The portfolio service is temporarily unavailable."); }
}
export const apiUrl = (path: string) => {
  if (!base) throw new ApiUnavailableError();
  return `${base}${path}`;
};

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

export async function getFreshAccessToken() {
  if (typeof window === "undefined") return null;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return localStorage.getItem("sanjay_portfolio_token");

  const { data, error } = await supabase.auth.getSession();
  if (error) return localStorage.getItem("sanjay_portfolio_token");
  if (!data.session) {
    localStorage.removeItem("sanjay_portfolio_token");
    localStorage.removeItem("sanjay_portfolio_user");
    return null;
  }

  const { access_token: accessToken, user } = data.session;
  localStorage.setItem("sanjay_portfolio_token", accessToken);
  try {
    const storedUser = JSON.parse(localStorage.getItem("sanjay_portfolio_user") || "{}");
    localStorage.setItem("sanjay_portfolio_user", JSON.stringify({
      ...storedUser,
      id: user.id,
      name: user.user_metadata?.name || storedUser.name || "Member",
      phone: user.phone || storedUser.phone,
    }));
  } catch {
    localStorage.setItem("sanjay_portfolio_user", JSON.stringify({
      id: user.id,
      name: user.user_metadata?.name || "Member",
      phone: user.phone,
    }));
  }
  return accessToken;
}

export async function authenticatedApiFetch(path: string, init: RequestInit = {}, timeoutMs = 8000) {
  const token = await getFreshAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  else headers.delete("Authorization");
  return apiFetch(path, { ...init, headers }, timeoutMs);
}

export const isLoggedIn = () => typeof window !== "undefined" && Boolean(localStorage.getItem("sanjay_portfolio_token"));
