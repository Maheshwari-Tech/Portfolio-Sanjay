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
    <details className="inline-recommendation" id={`${mode}-recommendation`}>
      <summary>
        <span>{copy.button}</span>
        <span aria-hidden="true">+</span>
      </summary>
      <form className="inline-recommendation-form" onSubmit={submitRecommendation}>
        {mode === "screen" && (
          <fieldset>
            <legend>Choose one</legend>
            <div className="inline-recommendation-types">
              {(["Movie", "Series"] as Category[]).map((item) => (
                <button
                  className={category === item ? "active" : ""}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <label>
          <span>Short title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={copy.placeholder} required maxLength={90} />
        </label>
        <label>
          <span>Why? <em>optional</em></span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add a short note if you’d like" rows={3} maxLength={500} />
        </label>
        <label>
          <span>Your name <em>optional</em></span>
          <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Your name" maxLength={70} />
        </label>
        <button className="inline-recommendation-submit" type="submit" disabled={sending}>{sending ? "Sending…" : "Send recommendation"} <span aria-hidden="true">↗</span></button>
        {status && <p className="inline-recommendation-status" role="status">{status}</p>}
      </form>
    </details>
  );
}
