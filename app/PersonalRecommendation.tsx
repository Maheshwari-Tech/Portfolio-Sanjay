"use client";

import { FormEvent, useState } from "react";
import { submitPortfolioEntry } from "./submissionService";

type Category = "Movie" | "Series" | "Book" | "Travel";
type RecommendationMode = "screen" | "book" | "travel";

const modeCopy: Record<RecommendationMode, { category: Category; button: string; placeholder: string }> = {
  screen: { category: "Movie", button: "Recommend a movie or series", placeholder: "Movie or series title" },
  book: { category: "Book", button: "Recommend a book", placeholder: "Book title" },
  travel: { category: "Travel", button: "Recommend a place", placeholder: "Place or experience" },
};

export default function PersonalRecommendation({ mode }: { mode: RecommendationMode }) {
  const copy = modeCopy[mode];
  const [category, setCategory] = useState<Category>(copy.category);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const formId = `${mode}-recommendation-form`;

  async function submitRecommendation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("Sending…");

    try {
      const result = await submitPortfolioEntry({
        type: "recommendation",
        category,
        title: title.trim(),
        message: message.trim() || undefined,
        name: from.trim() || "A portfolio visitor",
      });
      setTitle("");
      setMessage("");
      setStatus(result.delivery === "api" ? "Sent. Thank you for the recommendation!" : "The service is offline. This recommendation is saved on your device and was not sent yet.");
    } catch {
      setStatus("Could not send yet—the API is not available. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`inline-recommendation${expanded ? " is-open" : ""}`} id={`${mode}-recommendation`}>
      <button className="inline-recommendation-toggle" type="button" aria-expanded={expanded} aria-controls={formId} onClick={() => setExpanded((current) => !current)}>
        <span>{copy.button}</span>
        <span aria-hidden="true">{expanded ? "×" : "+"}</span>
      </button>
      <form className="inline-recommendation-form" id={formId} aria-hidden={!expanded} onSubmit={submitRecommendation}>
        {mode === "screen" && (
          <fieldset aria-label="Recommendation type">
            <div className="inline-recommendation-types">
              {(["Movie", "Series"] as Category[]).map((item) => (
                <button
                  className={category === item ? "active" : ""}
                  type="button"
                  aria-pressed={category === item}
                  tabIndex={expanded ? 0 : -1}
                  onClick={() => setCategory(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="inline-recommendation-fields">
          <label className="floating-field"><span>{copy.placeholder}</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={copy.placeholder} required maxLength={90} tabIndex={expanded ? 0 : -1} /></label>
          <label className="floating-field"><span>Your name <em>Optional</em></span><input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Your name (optional)" maxLength={70} tabIndex={expanded ? 0 : -1} /></label>
        </div>
        <label className="floating-field"><span>Why you recommend it <em>Optional</em></span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Why do you recommend it? (optional)" rows={2} maxLength={500} tabIndex={expanded ? 0 : -1} /></label>
        <button className="inline-recommendation-submit" type="submit" disabled={sending} tabIndex={expanded ? 0 : -1}>{sending ? "Sending…" : "Send recommendation"} <span aria-hidden="true">↗</span></button>
        <p className="inline-recommendation-status" role="status">{status || " "}</p>
      </form>
    </div>
  );
}
