export type SubmissionType = "contact" | "feedback" | "recommendation";

export type SubmissionPayload = {
  type: SubmissionType;
  title: string;
  message?: string;
  name: string;
  email?: string;
  category?: string;
  rating?: string;
};

import { apiFetch } from "./apiClient";

export type SubmissionResult = { delivery: "api" | "local"; payload: SubmissionPayload & { id: string; source: string; createdAt: string } };

function saveLocally(payload: SubmissionResult["payload"]) {
  if (typeof window === "undefined") return;
  const key = "sanjay_portfolio_pending_submissions";
  try {
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([...current, payload].slice(-25)));
  } catch {
    localStorage.setItem(key, JSON.stringify([payload]));
  }
}

export async function submitPortfolioEntry(input: SubmissionPayload) {
  const payload = {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    source: "sanjay-portfolio",
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await apiFetch("/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);
    return { delivery: "api", payload } satisfies SubmissionResult;
  } catch {
    saveLocally(payload);
    return { delivery: "local", payload } satisfies SubmissionResult;
  }
}
