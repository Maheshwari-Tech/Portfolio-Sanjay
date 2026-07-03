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

export const submissionEndpoint = "https://shalinithebaria.com/sanju/";

export async function submitPortfolioEntry(input: SubmissionPayload) {
  const payload = {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    source: "sanjay-portfolio",
    createdAt: new Date().toISOString(),
  };

  const response = await fetch(submissionEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Submission failed with status ${response.status}`);
  return payload;
}
