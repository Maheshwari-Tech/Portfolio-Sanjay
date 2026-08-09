"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { journeyChapters } from "./journeyData";
import styles from "./journey.module.css";

type SelectedReview = {
  company: string;
  full: string;
  name: string;
  context: string;
};

function reviewExcerpt(full: string, limit = 44) {
  const words = full.replace(/\s+/g, " ").trim().split(" ");
  return `${words.slice(0, limit).join(" ")}${words.length > limit ? "…" : ""}`;
}

export default function JourneyTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedReview, setSelectedReview] = useState<SelectedReview | null>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const nextIndex = Number((visible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(nextIndex)) setActiveIndex(nextIndex);
      },
      { rootMargin: "-28% 0px -42%", threshold: [0, 0.2, 0.45, 0.7] },
    );

    chapterRefs.current.forEach((chapter) => chapter && observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedReview) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedReview(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedReview]);

  const goToChapter = (index: number) => {
    chapterRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const moveChapter = (direction: -1 | 1) => {
    const nextIndex = Math.min(
      journeyChapters.length - 1,
      Math.max(0, activeIndex + direction),
    );
    goToChapter(nextIndex);
  };

  return (
    <div className={styles.page}>
      <div className={styles.progressTrack} aria-hidden="true">
        <span style={{ width: `${((activeIndex + 1) / journeyChapters.length) * 100}%` }} />
      </div>

      <main id="main-content">
        <section className={styles.hero} id="top">
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroTopline}>
            <span>2016</span>
            <span>Five chapters · a widening scope of responsibility</span>
            <span>Present</span>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A professional &amp; personal timeline</p>
            <h1>
              The distance between <em>ambition</em> and impact.
            </h1>
            <p>
              Each chapter widened the unit of responsibility: from my own skill, to fair
              opportunities for candidates, dependable systems, useful products, and finally
              the people and organisation needed to sustain them.
            </p>
          </div>
          <div className={styles.heroFooter}>
            <button type="button" onClick={() => goToChapter(0)}>
              Explore the journey <span aria-hidden="true">↓</span>
            </button>
            <p><strong>10 years</strong><span>from problem solver to technical leader</span></p>
            <p><strong>5 chapters</strong><span>education to Oracle Health</span></p>
          </div>
        </section>

        <div className={styles.timelineLayout}>
          <nav className={styles.chapterRail} aria-label="Journey chapters">
            <p>Timeline</p>
            <ol>
              {journeyChapters.map((chapter, index) => (
                <li key={chapter.id} className={index === activeIndex ? styles.railActive : undefined}>
                  <button type="button" onClick={() => goToChapter(index)} aria-current={index === activeIndex ? "step" : undefined}>
                    <span>{chapter.index}</span>
                    <span>
                      <strong>{chapter.company}</strong>
                      <small>{chapter.period.split(" — ")[0]}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className={styles.railControls}>
              <button type="button" onClick={() => moveChapter(-1)} disabled={activeIndex === 0} aria-label="Previous chapter">↑</button>
              <button type="button" onClick={() => moveChapter(1)} disabled={activeIndex === journeyChapters.length - 1} aria-label="Next chapter">↓</button>
            </div>
          </nav>

          <div className={styles.chapterDeck}>
            {journeyChapters.map((chapter, index) => (
              <section
                className={`${styles.chapter} ${styles[chapter.tone]} ${index === activeIndex ? styles.chapterActive : ""}`}
                id={chapter.id}
                key={chapter.id}
                ref={(node) => { chapterRefs.current[index] = node; }}
                data-index={index}
                aria-labelledby={`${chapter.id}-title`}
              >
                <div className={styles.chapterMarker} aria-hidden="true">
                  <span>{chapter.index}</span>
                  <i />
                </div>

                <div className={styles.chapterHeading}>
                  <div>
                    <p className={styles.chapterEyebrow}>{chapter.eyebrow}</p>
                    <p className={styles.chapterMeta}>{chapter.period} · {chapter.place}</p>
                    <p className={styles.chapterDuration}>{chapter.duration}</p>
                  </div>
                  <div className={styles.chapterIdentity}>
                    {chapter.logo ? (
                      <div className={`${styles.logoWrap} ${chapter.logoClass === "wide" ? styles.logoWide : ""}`}>
                        <Image src={chapter.logo} alt={chapter.logoAlt ?? chapter.company} width={170} height={70} sizes="170px" />
                      </div>
                    ) : (
                      <div className={styles.educationMark} aria-hidden="true"><span>LPU</span><small>’20</small></div>
                    )}
                    <div>
                      <strong>{chapter.company}</strong>
                      <span>{chapter.role}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.chapterIntro}>
                  <h2 id={`${chapter.id}-title`}>{chapter.headline}</h2>
                  <p>{chapter.summary}</p>
                </div>

                <section className={styles.milestonePanel} aria-label={`${chapter.company} milestones`}>
                  <div className={styles.panelHeading}>
                    <span>01 · Milestones</span>
                    <span>{chapter.index} / 05</span>
                  </div>
                  <div className={styles.milestoneGrid}>
                    {chapter.milestones.map((milestone) => (
                      <div key={milestone.label}>
                        <strong>{milestone.value}</strong>
                        <span>{milestone.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <details className={styles.evidencePanel}>
                  <summary>
                    <span>02</span>
                    <div>
                      <p>Achievements &amp; complete record</p>
                      <h3>Every result is here—open when you want the evidence.</h3>
                      <div className={styles.evidenceCategories}>
                        {chapter.achievements.map((group) => (
                          <i key={group.category}>{group.category} · {group.items.length}</i>
                        ))}
                      </div>
                    </div>
                    <b aria-hidden="true">+</b>
                  </summary>
                  <div className={styles.evidenceBody}>
                    <div className={styles.achievementGroups} role="list">
                      {chapter.achievements.map((group) => (
                        <article className={styles.achievementCategory} key={group.category} role="listitem">
                          <div>
                            <span>{String(group.items.length).padStart(2, "0")}</span>
                            <h4>{group.category}</h4>
                          </div>
                          <ul>{group.items.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
                        </article>
                      ))}
                    </div>
                    {chapter.portfolioRecord && (
                      <div className={styles.completeRecord}>
                        <div className={styles.recordHeading}>
                          <div><p>Complete role record</p><h4>Responsibilities, results, and tools</h4></div>
                          <span>{String(chapter.portfolioRecord.details.length).padStart(2, "0")} details</span>
                        </div>
                        <ol className={styles.recordList}>
                          {chapter.portfolioRecord.details.map((detail, detailIndex) => (
                            <li key={detail}><span>{String(detailIndex + 1).padStart(2, "0")}</span><p>{detail}</p></li>
                          ))}
                        </ol>
                        <div className={styles.recordSignals}>
                          <div><span>Technology stack</span><div>{chapter.portfolioRecord.technologies.map((technology) => <i key={technology}>{technology}</i>)}</div></div>
                          <div><span>Core responsibilities</span><div>{chapter.portfolioRecord.capabilities.map((capability) => <i key={capability}>{capability}</i>)}</div></div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>

                <section className={styles.storySection} aria-labelledby={`${chapter.id}-story-heading`}>
                  <div className={styles.structureHeading}>
                    <span>03</span>
                    <div><p>{chapter.id === "education" ? "College story" : "Work experience"}</p><h3 id={`${chapter.id}-story-heading`}>The story, decisions, and work</h3></div>
                  </div>
                  <div className={styles.compactStoryGrid}>
                    <article className={styles.storyOpening}>
                      <span>How it started</span>
                      <h4>{chapter.started.title}</h4>
                      <p>{chapter.started.copy}</p>
                    </article>
                    <div className={styles.impactStack}>
                      {chapter.work.map((item, itemIndex) => (
                        <article key={item.title}>
                          <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                          <div><h4>{item.title}</h4><p>{item.copy}</p></div>
                        </article>
                      ))}
                    </div>
                  </div>
                  <div className={styles.contextStrip}>
                    <article className={styles.perspectiveCard}>
                      <span>{chapter.pivot.label}</span>
                      <p>{chapter.pivot.text}</p>
                    </article>
                    {chapter.other.map((item) => (
                      <article key={item.title}><span>{chapter.contextTitle}</span><h4>{item.title}</h4><p>{item.copy}</p></article>
                    ))}
                  </div>
                </section>

                <section className={styles.skillSection} aria-labelledby={`${chapter.id}-learnings-heading`}>
                  <div className={styles.structureHeading}>
                    <span>04</span>
                    <div><p>From the main portfolio</p><h3 id={`${chapter.id}-learnings-heading`}>Key learnings</h3></div>
                  </div>
                  <div className={styles.skillCloud}>
                    {chapter.learnings.map((learning) => <span key={learning}>{learning}</span>)}
                  </div>
                </section>

                {chapter.feedback.length > 0 && (
                  <section className={styles.feedbackSection} data-reading="feedback" aria-labelledby={`${chapter.id}-feedback-heading`}>
                    <div className={styles.structureHeading}>
                      <span>05</span>
                      <div><p>Feedback</p><h3 id={`${chapter.id}-feedback-heading`}>In their words</h3></div>
                      <small>{chapter.feedback.length} {chapter.feedback.length === 1 ? "review" : "reviews"}</small>
                    </div>
                    <div className={`${styles.reviewMarquee} ${styles.reviewPreviewMarquee} ${chapter.feedback.length === 1 ? styles.reviewSingle : ""}`} role="region" aria-label={`${chapter.company} feedback`}>
                      <div className={styles.reviewTrack}>
                        {(chapter.feedback.length === 1 ? [false] : [false, true]).map((duplicate) => (
                          <div className={styles.reviewSet} aria-hidden={duplicate} inert={duplicate ? true : undefined} key={String(duplicate)}>
                            {chapter.feedback.map((review, reviewIndex) => (
                              <figure className={styles.feedbackPreviewCard} key={`${duplicate}-${review.name}`}>
                                <figcaption>Review {String(reviewIndex + 1).padStart(2, "0")}</figcaption>
                                <blockquote><p>{reviewExcerpt(review.full)}</p></blockquote>
                                <div>
                                  <span aria-hidden="true">{review.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}</span>
                                  <p><strong>{review.name}</strong><small>{review.context}</small></p>
                                </div>
                                <button type="button" onClick={() => setSelectedReview({ company: chapter.company, ...review })}>Read full feedback <span aria-hidden="true">↗</span></button>
                              </figure>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className={styles.transitionCard} aria-labelledby={`${chapter.id}-transition-heading`}>
                  <span>{chapter.feedback.length > 0 ? "06" : "05"}</span>
                  <div>
                    <p>{chapter.transition.label}</p>
                    <h3 id={`${chapter.id}-transition-heading`}>{chapter.transition.title}</h3>
                    {chapter.transition.events && (
                      <div className={styles.transitionEvents} role="list">
                        {chapter.transition.events.map((event) => (
                          <article key={`${event.title}-${event.outcome}`} role="listitem"><span>{event.outcome}</span><h4>{event.title}</h4><p>{event.copy}</p></article>
                        ))}
                      </div>
                    )}
                    <p>{chapter.transition.text}</p>
                    <div className={styles.transitionFooter}>
                      <div className={styles.tags}>{chapter.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                      {index < journeyChapters.length - 1 ? (
                        <button type="button" onClick={() => goToChapter(index + 1)}>Next · {journeyChapters[index + 1].company} <span aria-hidden="true">↓</span></button>
                      ) : (
                        <Link href="/">Back to portfolio <span aria-hidden="true">↗</span></Link>
                      )}
                    </div>
                  </div>
                </section>
              </section>
            ))}
          </div>
        </div>

        <section className={styles.epilogue}>
          <p className={styles.eyebrow}>The dots in hindsight</p>
          <h2>The ambition grew because the responsibility kept growing.</h2>
          <p>
            College built depth. HackerEarth added fairness. Amazon added dependable systems.
            Google added product judgement at global scale. Oracle joined architecture, delivery,
            hiring, and team leadership. The next ambition is not a logo; it is wider responsibility
            for a product, its people, and the outcomes they create together.
          </p>
          <div>
            <Link href="/">Explore the portfolio <span aria-hidden="true">↗</span></Link>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Replay from the beginning ↑</button>
          </div>
        </section>
      </main>

      {selectedReview && (
        <div className={styles.reviewDialogBackdrop} data-reading="feedback" onMouseDown={() => setSelectedReview(null)}>
          <article className={styles.reviewDialog} role="dialog" aria-modal="true" aria-labelledby="full-feedback-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><span>{selectedReview.company} · Full feedback</span><h2 id="full-feedback-title">{selectedReview.name}</h2><p>{selectedReview.context}</p></div>
              <button type="button" autoFocus onClick={() => setSelectedReview(null)} aria-label="Close full feedback">×</button>
            </header>
            <blockquote>
              {selectedReview.full.split("\n\n").map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            </blockquote>
          </article>
        </div>
      )}
    </div>
  );
}
