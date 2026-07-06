"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, type CSSProperties } from "react";
import content from "../../data/wife.json";
import styles from "./wife.module.css";

const photos = Array.from({ length: 37 }, (_, index) =>
  `/images/shalu/memory-${String(index + 1).padStart(2, "0")}.jpg`,
);

const captions = [
  "Us, in all our little moments",
  "The smiles I never want to forget",
  "Everywhere feels better with you",
  "A thousand memories—and counting",
];

const hearts = Array.from({ length: 18 }, (_, index) => index);

type NoteKey = "letter" | "wish" | "future";
type Notes = Record<NoteKey, string>;

const emptyNotes: Notes = { letter: "", wish: "", future: "" };

export default function WifeCelebration() {
  const [celebrating, setCelebrating] = useState(false);
  const [notes, setNotes] = useState<Notes>(() => {
    if (typeof window === "undefined") return emptyNotes;
    const stored = window.localStorage.getItem("shalini-love-notes");
    if (!stored) return emptyNotes;
    try {
      return { ...emptyNotes, ...JSON.parse(stored) };
    } catch {
      return emptyNotes;
    }
  });
  const [saved, setSaved] = useState(false);

  function updateNote(key: NoteKey, value: string) {
    const updated = { ...notes, [key]: value };
    setNotes(updated);
    window.localStorage.setItem("shalini-love-notes", JSON.stringify(updated));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  function celebrate() {
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 7000);
  }

  return (
    <main className={`${styles.page} ${celebrating ? styles.celebrating : ""}`}>
      <div className={styles.ambientHearts} aria-hidden="true">
        {hearts.map((heart) => (
          <span
            key={heart}
            style={{
              "--heart-left": `${(heart * 37) % 96}%`,
              "--heart-delay": `${(heart % 7) * -1.6}s`,
              "--heart-duration": `${12 + (heart % 6) * 2}s`,
              "--heart-size": `${12 + (heart % 5) * 5}px`,
            } as CSSProperties}
          >
            ♥
          </span>
        ))}
      </div>

      <section className={styles.hero}>
        <img className={styles.heroImage} src={photos[26]} alt="Sanjay and Shalini sharing a tender moment" />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className={styles.intro}>{content.intro}</p>
          <button className={styles.celebrateButton} type="button" onClick={celebrate}>
            <span>Celebrate Shalini</span>
            <span aria-hidden="true">♥</span>
          </button>
        </div>
        <a className={styles.scrollCue} href="#memories" aria-label="See our memories">
          Our memories <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className={styles.birthday} aria-live="polite">
        <div className={styles.birthdayGlow} aria-hidden="true" />
        <p>Today—and every day</p>
        <h2>{content.birthdayTitle}</h2>
        <p>{content.birthdayMessage}</p>
        <div className={styles.cake} aria-hidden="true">
          <span className={styles.flame}>✦</span>
          <span>🎂</span>
        </div>
      </section>

      <section className={styles.memories} id="memories">
        <div className={styles.sectionHeading}>
          <p>Thirty-seven frames, one beautiful story</p>
          <h2>A wall full of us</h2>
          <span>Every photo from our collection is here.</span>
        </div>
        <div className={styles.photoWall}>
          {photos.map((photo, index) => (
            <figure className={styles.photoCard} key={photo}>
              <img src={photo} alt={`A shared memory of Sanjay and Shalini, ${index + 1} of ${photos.length}`} loading={index < 5 ? "eager" : "lazy"} />
              <figcaption>{captions[index % captions.length]}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.letterSection}>
        <div className={styles.sectionHeading}>
          <p>Words worth keeping</p>
          <h2>Write the next part of our story</h2>
          <span>These notes stay saved in this browser, ready whenever inspiration arrives.</span>
        </div>
        <div className={styles.noteGrid}>
          <NoteCard label="A letter for you" prompt={content.letterPrompt} value={notes.letter} onChange={(value) => updateNote("letter", value)} />
          <NoteCard label="A birthday wish" prompt={content.wishPrompt} value={notes.wish} onChange={(value) => updateNote("wish", value)} />
          <NoteCard label="Our next chapter" prompt={content.futurePrompt} value={notes.future} onChange={(value) => updateNote("future", value)} />
        </div>
        <p className={`${styles.savedMessage} ${saved ? styles.savedMessageVisible : ""}`} aria-live="polite">Saved with love ♥</p>
      </section>

      <footer className={styles.footer}>
        <span aria-hidden="true">♥</span>
        <p>Life’s most beautiful moments are the ones we share.</p>
        <span aria-hidden="true">♥</span>
      </footer>

      {celebrating && (
        <div className={styles.heartBurst} aria-hidden="true">
          {hearts.slice(0, 14).map((heart) => (
            <span key={heart} style={{ "--burst-angle": `${heart * 25.7}deg`, "--burst-distance": `${140 + (heart % 4) * 45}px` } as CSSProperties}>♥</span>
          ))}
        </div>
      )}
    </main>
  );
}

function NoteCard({ label, prompt, value, onChange }: { label: string; prompt: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.noteCard}>
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={prompt} rows={7} />
    </label>
  );
}
