"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { journeyChapters } from "./journeyData";
import styles from "./journey.module.css";

export default function JourneyTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
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
                    <span>01 · Milestones &amp; achievements</span>
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
                  <div className={styles.achievementGroups} role="list">
                    {chapter.achievements.map((group) => (
                      <article className={styles.achievementCategory} key={group.category} role="listitem">
                        <div>
                          <span>{String(group.items.length).padStart(2, "0")}</span>
                          <h4>{group.category}</h4>
                        </div>
                        <ul>
                          {group.items.map((achievement) => <li key={achievement}>{achievement}</li>)}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>

                <section className={styles.structuredSection} aria-labelledby={`${chapter.id}-work-heading`}>
                  <div className={styles.structureHeading}>
                    <span>02</span>
                    <div><p>Full details</p><h3 id={`${chapter.id}-work-heading`}>{chapter.id === "education" ? "College story" : "Work experience"}</h3></div>
                  </div>
                  <div className={styles.workGrid}>
                    {chapter.work.map((item, itemIndex) => (
                      <article key={item.title}>
                        <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                        <h4>{item.title}</h4>
                        <p>{item.copy}</p>
                      </article>
                    ))}
                  </div>
                  {chapter.portfolioRecord && (
                    <details className={styles.portfolioRecord}>
                      <summary className={styles.recordHeading}>
                        <div>
                          <p>Detailed role record</p>
                          <h4>View every responsibility, result, and technology</h4>
                        </div>
                        <span>{String(chapter.portfolioRecord.details.length).padStart(2, "0")} details <i aria-hidden="true">+</i></span>
                      </summary>
                      <div className={styles.recordBody}>
                        <ol className={styles.recordList}>
                          {chapter.portfolioRecord.details.map((detail, detailIndex) => (
                            <li key={detail}>
                              <span>{String(detailIndex + 1).padStart(2, "0")}</span>
                              <p>{detail}</p>
                            </li>
                          ))}
                        </ol>
                        <div className={styles.recordSignals}>
                          <div>
                            <span>Technology stack</span>
                            <div>{chapter.portfolioRecord.technologies.map((technology) => <i key={technology}>{technology}</i>)}</div>
                          </div>
                          <div>
                            <span>Core responsibilities</span>
                            <div>{chapter.portfolioRecord.capabilities.map((capability) => <i key={capability}>{capability}</i>)}</div>
                          </div>
                        </div>
                      </div>
                    </details>
                  )}
                </section>

                <section className={styles.startedCard} aria-labelledby={`${chapter.id}-started-heading`}>
                  <div className={styles.structureHeading}>
                    <span>03</span>
                    <div><p>How it started</p><h3 id={`${chapter.id}-started-heading`}>{chapter.started.title}</h3></div>
                  </div>
                  <p>{chapter.started.copy}</p>
                </section>

                <section className={styles.otherSection} aria-labelledby={`${chapter.id}-other-heading`}>
                  <div className={styles.structureHeading}>
                    <span>04</span>
                    <div><p>{chapter.pivot.label}</p><h3 id={`${chapter.id}-other-heading`}>{chapter.contextTitle}</h3></div>
                  </div>
                  <div className={styles.pivotCard}>
                    <span>Perspective</span>
                    <p>{chapter.pivot.text}</p>
                  </div>
                  <div className={styles.otherGrid}>
                    {chapter.other.map((item) => (
                      <article key={item.title}><h4>{item.title}</h4><p>{item.copy}</p></article>
                    ))}
                  </div>
                </section>

                <section className={styles.learningSection} aria-labelledby={`${chapter.id}-learnings-heading`}>
                  <div className={styles.structureHeading}>
                    <span>05</span>
                    <div><p>What I carried forward</p><h3 id={`${chapter.id}-learnings-heading`}>Learnings from this chapter</h3></div>
                    <small>{chapter.learnings.length} {chapter.learnings.length === 1 ? "learning" : "learnings"}</small>
                  </div>
                  <div className={styles.learningGrid}>
                    {chapter.learnings.map((learning, learningIndex) => (
                      <article key={learning.title}>
                        <span>{String(learningIndex + 1).padStart(2, "0")}</span>
                        <h4>{learning.title}</h4>
                        <p>{learning.copy}</p>
                      </article>
                    ))}
                  </div>
                </section>

                {chapter.feedback.length > 0 && (
                  <section className={styles.feedbackSection} aria-labelledby={`${chapter.id}-feedback-heading`}>
                    <div className={styles.structureHeading}>
                      <span>06</span>
                      <div><p>Feedback</p><h3 id={`${chapter.id}-feedback-heading`}>Full feedback, in their words</h3></div>
                      <small>{chapter.feedback.length} {chapter.feedback.length === 1 ? "review" : "reviews"}</small>
                    </div>
                    <div className={styles.reviewMarquee} role="region" aria-label={`${chapter.company} feedback carousel`}>
                      <div className={styles.reviewTrack}>
                        {[false, true].map((duplicate) => (
                          <div className={styles.reviewSet} aria-hidden={duplicate} key={String(duplicate)}>
                            {chapter.feedback.map((review, reviewIndex) => (
                              <figure className={styles.feedbackCard} key={`${duplicate}-${review.name}`}>
                                <figcaption>Review {String(reviewIndex + 1).padStart(2, "0")}</figcaption>
                                <blockquote>
                                  {review.full.split("\n\n").map((paragraph, paragraphIndex) => (
                                    <p key={paragraphIndex}>{paragraph}</p>
                                  ))}
                                </blockquote>
                                <div>
                                  <span aria-hidden="true">
                                    {review.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("")}
                                  </span>
                                  <p><strong>{review.name}</strong><small>{review.context}</small></p>
                                </div>
                              </figure>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className={styles.transitionCard} aria-labelledby={`${chapter.id}-transition-heading`}>
                  <span>{chapter.feedback.length > 0 ? "07" : "06"}</span>
                  <div>
                    <p>{chapter.transition.label}</p>
                    <h3 id={`${chapter.id}-transition-heading`}>{chapter.transition.title}</h3>
                    {chapter.transition.events && (
                      <div className={styles.transitionEvents} role="list">
                        {chapter.transition.events.map((event) => (
                          <article key={`${event.title}-${event.outcome}`} role="listitem">
                            <span>{event.outcome}</span>
                            <h4>{event.title}</h4>
                            <p>{event.copy}</p>
                          </article>
                        ))}
                      </div>
                    )}
                    <p>{chapter.transition.text}</p>
                  </div>
                </section>

                <footer className={styles.chapterFooter}>
                  <div className={styles.tags}>
                    {chapter.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  {index < journeyChapters.length - 1 ? (
                    <button type="button" onClick={() => goToChapter(index + 1)}>
                      Next · {journeyChapters[index + 1].company} <span aria-hidden="true">↓</span>
                    </button>
                  ) : (
                    <Link href="/">Back to portfolio <span aria-hidden="true">↗</span></Link>
                  )}
                </footer>
              </section>
            ))}
          </div>
        </div>

        <section className={styles.epilogue}>
          <p className={styles.eyebrow}>The dots in hindsight</p>
          <h2>The ambition grew because the responsibility kept growing.</h2>
          <p>
            College built depth and the confidence to attempt hard things. HackerEarth turned
            skill into fair judgement. Amazon added responsibility for production systems. Google
            added user understanding and global scale. Oracle joined design, delivery, hiring, and team
            leadership into one responsibility. In 2016, success meant a 10 LPA offer; consistent
            work, faith, generous people, favourable timing, and useful failures made the path
            larger than that first goal. The next ambition is not a particular logo. It is to own
            problems whose solution makes the product, the team, and the organisation stronger.
          </p>
          <div>
            <Link href="/">Explore the portfolio <span aria-hidden="true">↗</span></Link>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Replay from the beginning ↑</button>
          </div>
        </section>
      </main>
    </div>
  );
}
