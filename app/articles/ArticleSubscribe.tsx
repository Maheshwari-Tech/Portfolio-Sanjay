"use client";

import { FormEvent, useState } from "react";
import { submitPortfolioEntry } from "../submissionService";

export default function ArticleSubscribe({ id = "subscribe" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const titleId = `${id}-title`;

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribing(true);
    setStatus("Subscribing…");
    const result = await submitPortfolioEntry({ type: "subscription", title: "Blog updates subscription", category: "Blog updates", name: "Blog reader", email: email.trim(), message: "Requested updates from the blog archive." });
    setEmail("");
    setStatus(result.delivery === "api" ? "You’re on the list. Thanks for subscribing." : "The subscription service is offline. Your request is saved on this device.");
    setSubscribing(false);
  };

  return <section className="article-subscribe" id={id} aria-labelledby={titleId}>
    <div><p className="eyebrow">Stay updated</p><h2 id={titleId}>Notes worth saving for later.</h2></div>
    <div><p>Get occasional updates when a new piece on engineering, systems, interviews, or career growth is published.</p><form onSubmit={subscribe}><label><span>Email address</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label><button disabled={subscribing}>{subscribing ? "Subscribing…" : "Subscribe"}</button></form>{status && <p className="subscription-status" role="status">{status}</p>}</div>
  </section>;
}
