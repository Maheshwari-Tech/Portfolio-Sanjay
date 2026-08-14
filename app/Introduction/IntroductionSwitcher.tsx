"use client";

import { useState } from "react";
import styles from "./introduction.module.css";

type IntroductionVersion = {
  id: string;
  label: string;
  descriptor: string;
  minutes: number;
  paragraphs: string[];
};

type IntroductionSwitcherProps = {
  versions: IntroductionVersion[];
};

function countWords(paragraphs: string[]) {
  return paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

const metricPattern = /(p\d+|\b\d+(?:,\d{3})*(?:\.\d+)?(?:M|B)?\+?(?:\s+(?:USD|requests?|queries?|users?|lines?|files?|engineers?|products?|microservices?|minutes?|hours?|seconds?|weeks?|interviews?|hires?|participants?|attendees?))?(?:\s+to\s+\d+(?:,\d{3})*(?:\.\d+)?(?:M|B)?\+?)?)/gi;

function highlightMetrics(paragraph: string) {
  return paragraph.split(metricPattern).map((part, index) => {
    metricPattern.lastIndex = 0;
    return metricPattern.test(part) ? <strong key={`${part}-${index}`}>{part}</strong> : part;
  });
}

export default function IntroductionSwitcher({ versions }: IntroductionSwitcherProps) {
  const defaultVersion = versions.find((version) => version.minutes === 3) ?? versions[0];
  const [selectedId, setSelectedId] = useState(defaultVersion.id);
  const selected = versions.find((version) => version.id === selectedId) ?? defaultVersion;
  const wordCount = countWords(selected.paragraphs);

  return (
    <section className={styles.studio} aria-labelledby="introduction-studio-title">
      <div className={styles.controls}>
        <p className={styles.kicker}>Introduction versions</p>
        <h2 id="introduction-studio-title">The path from engineer to technical leader.</h2>
        <p className={styles.controlCopy}>
          A quick overview, a focused interview introduction, and a detailed account of the work and experiences that shaped my approach.
        </p>

        <div className={styles.tabs} role="tablist" aria-label="Introduction length">
          {versions.map((version) => {
            const selectedTab = version.id === selected.id;
            return (
              <button
                aria-controls="introduction-script"
                aria-selected={selectedTab}
                className={selectedTab ? styles.activeTab : styles.tab}
                id={`${version.id}-tab`}
                key={version.id}
                onClick={() => setSelectedId(version.id)}
                role="tab"
                type="button"
              >
                <span>{version.label}</span>
                <small>{version.descriptor}</small>
              </button>
            );
          })}
        </div>

        <div className={styles.pace}>
          <span>{wordCount} words</span>
          <span>100 words per minute</span>
        </div>
      </div>

      <article
        aria-labelledby={`${selected.id}-tab`}
        className={styles.script}
        id="introduction-script"
        key={selected.id}
        role="tabpanel"
      >
        <header className={styles.scriptHeader}>
          <div>
            <p>{selected.descriptor}</p>
            <h3>{selected.label} introduction</h3>
          </div>
          <span aria-label={`Approximately ${selected.minutes} minutes`}>{selected.minutes}:00</span>
        </header>

        <div className={styles.transcript}>
          {selected.paragraphs.map((paragraph, index) => <p key={index}>{highlightMetrics(paragraph)}</p>)}
        </div>

      </article>
    </section>
  );
}
