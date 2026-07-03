"use client";

import { FormEvent, useState } from "react";
import { submitPortfolioEntry } from "./submissionService";

const destination = "sanjaymaheshwari.work@gmail.com";

export default function ContactFeedback() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [topic, setTopic] = useState("Collaboration");
  const [message, setMessage] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [sendingContact, setSendingContact] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingContact(true);
    setContactStatus("Sending…");
    try {
      await submitPortfolioEntry({
        type: "contact",
        title: topic,
        category: topic,
        message: message.trim(),
        name: contactName.trim(),
        email: contactEmail.trim(),
      });
      setMessage("");
      setContactStatus("Sent. Thanks for reaching out!");
    } catch {
      setContactStatus("Could not send yet—the API is not available. Please try again later.");
    } finally {
      setSendingContact(false);
    }
  };

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingFeedback(true);
    setFeedbackStatus("Sending…");
    try {
      await submitPortfolioEntry({
        type: "feedback",
        title: `Portfolio feedback — ${rating}/5`,
        message: feedback.trim(),
        name: feedbackName.trim() || "Anonymous visitor",
        rating,
      });
      setFeedback("");
      setFeedbackStatus("Sent. Thank you for the feedback!");
    } catch {
      setFeedbackStatus("Could not send yet—the API is not available. Please try again later.");
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="contact-feedback">
      <div className="contact-options" aria-label="Direct contact options">
        <a className="contact-option contact-option-email" href={`mailto:${destination}`}>
          <span>
            <b className="contact-symbol" aria-hidden="true">
              <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
            </b>
            Email
          </span>
          <strong>{destination}</strong><small>↗</small>
        </a>
        <a className="contact-option contact-option-linkedin" href="https://www.linkedin.com/in/snjumaheshwari" target="_blank" rel="noreferrer">
          <span><b className="contact-symbol contact-symbol-linkedin" aria-hidden="true">in</b> LinkedIn</span>
          <strong>Connect professionally</strong><small>↗</small>
        </a>
        <div className="contact-option contact-option-paired contact-option-whatsapp">
          <span>
            <b className="contact-symbol" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z" /><path d="M8.2 7.7c.5-.5 1.1-.3 1.4.2l.8 1.5c.2.4.1.8-.2 1.1l-.6.6c.8 1.5 1.9 2.6 3.4 3.4l.6-.6c.3-.3.7-.4 1.1-.2l1.5.8c.5.3.7.9.2 1.4l-.5.5c-.6.6-1.5.8-2.3.5-3.3-1.1-6-3.8-7.1-7.1-.3-.8-.1-1.7.5-2.3l.5-.5Z" /></svg>
            </b>
            WhatsApp / phone
          </span>
          <strong>
            <a href="https://wa.me/918847472124" target="_blank" rel="noreferrer">WhatsApp <i aria-hidden="true">↗</i></a>
            <a href="tel:+918847472124">Call +91 88474 72124 <i aria-hidden="true">↗</i></a>
          </strong>
        </div>
      </div>

      <div className="contact-form-grid">
        <form className="contact-form" onSubmit={submitContact}>
          <div className="form-heading">
            <span>01</span>
            <div><h3>Send a message</h3><p>For collaboration, mentorship, consultancy, teaching, talks, or a thoughtful hello.</p></div>
          </div>
          <label><span>Your name</span><input required value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Name" /></label>
          <label><span>Your email</span><input required type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>
            <span>What is this about?</span>
            <select value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option>Collaboration</option><option>Hiring</option><option>Mentorship</option><option>Consultancy</option><option>Teaching</option><option>Talks</option><option>Personal</option><option>Open source</option><option>Other</option>
            </select>
          </label>
          <label><span>Message</span><textarea required value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell me a little about what you have in mind…" rows={6} /></label>
          <button type="submit" disabled={sendingContact}>{sendingContact ? "Sending…" : "Send message"} <span>↗</span></button>
          {contactStatus && <p className="form-status" role="status">{contactStatus}</p>}
        </form>

        <form className="feedback-form" onSubmit={submitFeedback}>
          <div className="form-heading">
            <span>02</span>
            <div><h3>Share feedback</h3><p>Found something useful—or something I could improve?</p></div>
          </div>
          <label><span>Your name <em>Optional</em></span><input value={feedbackName} onChange={(event) => setFeedbackName(event.target.value)} placeholder="Anonymous is welcome" /></label>
          <label>
            <span>Experience</span>
            <select value={rating} onChange={(event) => setRating(event.target.value)}>
              <option value="5">★★★★★ Excellent</option><option value="4">★★★★ Very good</option><option value="3">★★★ Good</option><option value="2">★★ Could improve</option><option value="1">★ Needs work</option>
            </select>
          </label>
          <label><span>Feedback</span><textarea required value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="What worked well? What would make this better?" rows={8} /></label>
          <button type="submit" disabled={sendingFeedback}>{sendingFeedback ? "Sending…" : "Send feedback"} <span>↗</span></button>
          {feedbackStatus && <p className="form-status" role="status">{feedbackStatus}</p>}
        </form>
      </div>

    </div>
  );
}
