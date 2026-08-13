"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import RecommendationCarousel, { type Recommendation } from "../RecommendationCarousel";
import RecognitionCarousel, { type RecognitionGroup } from "../RecognitionCarousel";
import { journeyChapters } from "./journeyData";
import styles from "./journey.module.css";

const closingCopy = "College built confidence. HackerEarth added fairness. Amazon added responsibility. Google added empathy at scale. Oracle brought product delivery and team growth together.";

export type JourneySectionDetail = {
  label: string;
  title: string;
  facts: Array<{ label: string; value: string }>;
  details?: string[];
  technologies?: string[];
  skills?: string[];
};

function decisionTone(outcome: string) {
  const value = outcome.toLowerCase();
  if (value.includes("declined") || value.includes("rejected")) return styles.decisionNegative;
  if (value.includes("selected") || value.includes("joined") || value.includes("offer")) return styles.decisionPositive;
  if (value.includes("returned") || value.includes("moved")) return styles.decisionTransition;
  return styles.decisionNeutral;
}

function ExpandableSectionDetails({ detail }: { detail: JourneySectionDetail }) {
  return (
    <details className={styles.decisionDetails}>
      <summary>
        <span>{detail.label}</span>
        <i aria-hidden="true">+</i>
      </summary>
      <div className={styles.sectionDetailsPanel}>
        <header>
          <span>Full details</span>
          <h3>{detail.title}</h3>
        </header>
        <dl>
          {detail.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        {detail.details && detail.details.length > 0 && (
          <ul className={styles.sectionDetailList}>
            {detail.details.map((item, itemIndex) => (
              <li key={itemIndex}>
                <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                <p dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        )}
        {((detail.technologies?.length ?? 0) > 0 || (detail.skills?.length ?? 0) > 0) && (
          <div className={styles.sectionDetailTags}>
            {(detail.technologies?.length ?? 0) > 0 && (
              <div><span>Technologies</span><p>{detail.technologies?.map((technology) => <i key={technology}>{technology}</i>)}</p></div>
            )}
            {(detail.skills?.length ?? 0) > 0 && (
              <div><span>Key skills</span><p>{detail.skills?.map((skill) => <i key={skill}>{skill}</i>)}</p></div>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

function CollegeStory({ moments }: { moments: NonNullable<(typeof journeyChapters)[number]["collegeStory"]> }) {
  const [activeMoment, setActiveMoment] = useState(0);
  const selected = moments[activeMoment];

  const moveMoment = (direction: -1 | 1) => {
    setActiveMoment((current) => (current + direction + moments.length) % moments.length);
  };

  return (
    <section className={styles.collegeStory} aria-labelledby="college-story-title">
      <header className={styles.collegeStoryHeading}>
        <div>
          <span>College story</span>
          <h2 id="college-story-title">Ten moments that kept moving the goalpost.</h2>
        </div>
        <p>Select a moment to follow the ambition, choices, breakthroughs, setbacks, and gratitude that shaped these four years.</p>
      </header>

      <div className={styles.collegeStoryLayout}>
        <div className={styles.collegeStoryKeys} role="tablist" aria-label="College story highlights">
          {moments.map((moment, index) => (
            <button
              aria-controls="college-story-panel"
              aria-selected={activeMoment === index}
              className={activeMoment === index ? styles.collegeStoryKeyActive : undefined}
              id={`college-story-tab-${index}`}
              key={moment.key}
              onClick={() => setActiveMoment(index)}
              role="tab"
              type="button"
            >
              <i>{String(index + 1).padStart(2, "0")}</i>
              <span><small>{moment.key}</small><strong>{moment.title}</strong></span>
            </button>
          ))}
        </div>

        <article
          aria-labelledby={`college-story-tab-${activeMoment}`}
          className={styles.collegeStoryPanel}
          id="college-story-panel"
          role="tabpanel"
        >
          <div className={styles.collegeStoryPanelTopline}>
            <span>{selected.key}</span>
            <strong>{String(activeMoment + 1).padStart(2, "0")} / {String(moments.length).padStart(2, "0")}</strong>
          </div>
          <h3>{selected.title}</h3>
          <p>{selected.copy}</p>
          <footer>
            <button aria-label="Previous college story highlight" onClick={() => moveMoment(-1)} type="button">←</button>
            <div aria-hidden="true"><span style={{ width: `${((activeMoment + 1) / moments.length) * 100}%` }} /></div>
            <button aria-label="Next college story highlight" onClick={() => moveMoment(1)} type="button">→</button>
          </footer>
        </article>
      </div>
    </section>
  );
}

function MentoringMotivation() {
  return (
    <section className={styles.mentoringMotivation} aria-labelledby="mentoring-motivation-title">
      <div className={styles.mentoringMotivationCopy}>
        <span>What keeps me mentoring</span>
        <h2 id="mentoring-motivation-title">The motivation behind every mentoring conversation</h2>
        <p>Achievements create proud moments, but helping someone discover their potential creates lasting meaning. Krishna’s post reminds me that being present, showing the right direction, and believing in someone can influence an entire journey. That is what keeps me mentoring.</p>
      </div>
      <a href="/images/krishna-barnwal-mentoring-post.png" target="_blank" rel="noreferrer" aria-label="Open Krishna Barnwal’s full LinkedIn post">
        <Image
          src="/images/krishna-barnwal-mentoring-post.png"
          alt="Krishna Barnwal’s LinkedIn post describing Sanjay Gandhi as a down-to-earth mentor who showed him the right direction, recognised his potential, and helped him throughout his placement journey."
          width={1160}
          height={1264}
          sizes="(max-width: 760px) 92vw, 48vw"
        />
        <span>Open the original post <i aria-hidden="true">↗</i></span>
      </a>
    </section>
  );
}

export default function JourneyTimeline({
  achievementsBySection,
  recommendationsBySection,
  sectionDetails = {},
}: {
  achievementsBySection: Record<string, RecognitionGroup[]>;
  recommendationsBySection: Record<string, Recommendation[]>;
  sectionDetails?: Record<string, JourneySectionDetail>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visible) return;
        const nextIndex = Number((visible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(nextIndex)) setActiveIndex(nextIndex);
      },
      { rootMargin: "-26% 0px -48%", threshold: [0, 0.2, 0.45, 0.7] },
    );

    chapterRefs.current.forEach((chapter) => chapter && observer.observe(chapter));
    return () => observer.disconnect();
  }, []);

  const goToChapter = (index: number) => {
    chapterRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const moveChapter = (direction: -1 | 1) => {
    const nextIndex = Math.min(journeyChapters.length - 1, Math.max(0, activeIndex + direction));
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
            <span>A career in progress</span>
            <span>Present</span>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Journey</p>
            <h1>From solving problems.<br /><em>To building with responsibility.</em></h1>
            <div className={styles.heroThemes} aria-label="Principles that shaped the journey">
              <p><strong>Effortless hard work</strong><span>The work feels natural when the problem is worth solving.</span></p>
              <p><strong>Choose harder challenges</strong><span>Every difficult problem expands what I can build and who I can help.</span></p>
            </div>
          </div>
          <div className={styles.heroFooter}>
            <button type="button" onClick={() => goToChapter(0)}>
              Explore journey <span aria-hidden="true">↓</span>
            </button>
            <p><strong>10 years</strong><span>college to team leadership</span></p>
          </div>
        </section>

        <div className={styles.timelineLayout}>
          <nav className={styles.chapterRail} aria-label="Journey sections">
            <p>Journey</p>
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
              <button type="button" onClick={() => moveChapter(-1)} aria-label="Previous section">↑</button>
              <button type="button" onClick={() => moveChapter(1)} aria-label="Next section">↓</button>
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

                <header className={styles.chapterHeading}>
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
                </header>

                <div className={styles.chapterIntro}>
                  <h2 id={`${chapter.id}-title`}>
                    {chapter.headline}
                    {chapter.headlineAccent && <em>{chapter.headlineAccent}</em>}
                  </h2>
                  <p>{chapter.summary}</p>
                </div>

                <section className={styles.milestonePanel} aria-label={`${chapter.company} highlights`}>
                  <div className={styles.panelHeading}>
                    <span>Milestones</span>
                    <span>Selected outcomes</span>
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

                {chapter.collegeStory ? (
                  <>
                    <CollegeStory moments={chapter.collegeStory} />
                    <MentoringMotivation />
                  </>
                ) : (
                  <div className={styles.workStage}>
                    <article className={styles.turningPoint}>
                      <span>{chapter.featureLabel ?? "Highlight"}</span>
                      <h3>{chapter.turningPoint.title}</h3>
                      <p>{chapter.turningPoint.copy}</p>
                    </article>
                    <section className={styles.changeList} aria-label={`What changed at ${chapter.company}`}>
                      <span>{chapter.changeLabel ?? "Learnings"}</span>
                      {chapter.changes.map((change, changeIndex) => (
                        <article key={change.title}>
                          <small>{String(changeIndex + 1).padStart(2, "0")}</small>
                          <div><h3>{change.title}</h3><p>{change.copy}</p></div>
                        </article>
                      ))}
                    </section>
                  </div>
                )}

                <div className={styles.chapterDetailsGroup}>
                  {sectionDetails[chapter.id] && <ExpandableSectionDetails detail={sectionDetails[chapter.id]} />}
                  {chapter.decisions && chapter.decisions.length > 0 && (
                    <details className={styles.decisionDetails}>
                      <summary>
                        <span>Explore decisions and interview outcomes</span>
                        <i aria-hidden="true">+</i>
                      </summary>
                      <div className={styles.decisionGrid}>
                        {chapter.decisions.map((decision) => (
                          <article className={`${styles.decisionCard} ${decisionTone(decision.outcome)}`} key={`${decision.outcome}-${decision.title}`}>
                            <span>{decision.outcome}</span>
                            <h3>{decision.title}</h3>
                            <p>{decision.copy}</p>
                          </article>
                        ))}
                      </div>
                    </details>
                  )}
                </div>

                {(achievementsBySection[chapter.id]?.length ?? 0) > 0 && (
                  <section className={styles.chapterAchievements} aria-labelledby={`${chapter.id}-achievements-title`}>
                    <div className={styles.chapterSectionHeading}>
                      <div>
                        <span>Achievements</span>
                        <h2 id={`${chapter.id}-achievements-title`}>All college achievements—earned by choosing harder challenges.</h2>
                      </div>
                      <p>Competitive programming gave me a steady supply of difficult problems. The rankings mattered, but the lasting value was learning to stay with a challenge until I understood it.</p>
                    </div>
                    <RecognitionCarousel groups={achievementsBySection[chapter.id]} />
                  </section>
                )}

                <blockquote className={styles.lesson}>
                  <span>What stayed with me</span>
                  <p>{chapter.lesson}</p>
                </blockquote>

                {(recommendationsBySection[chapter.id]?.length ?? 0) > 0 && (
                  <section className={`recommendations-section ${styles.chapterFeedback}`} aria-labelledby={`${chapter.id}-feedback-title`}>
                    <div className={`section-heading recommendations-heading ${styles.feedbackHeading}`}>
                      <div>
                        <p className="eyebrow">Feedback</p>
                        <h2 id={`${chapter.id}-feedback-title`}>
                          {chapter.id === "education" ? "What mentors and peers noticed." : `What people at ${chapter.company} noticed.`}
                        </h2>
                      </div>
                      <div className="recommendations-heading-actions">
                        <span>{recommendationsBySection[chapter.id].length} {recommendationsBySection[chapter.id].length === 1 ? "recommendation" : "recommendations"}</span>
                      </div>
                    </div>
                    <RecommendationCarousel recommendations={recommendationsBySection[chapter.id]} variant="scroll" />
                  </section>
                )}

                <footer className={styles.chapterFooter}>
                  <div><span>{index < journeyChapters.length - 1 ? "Next" : "Looking ahead"}</span><p>{chapter.next}</p></div>
                  {index < journeyChapters.length - 1 ? (
                    <button className={styles.nextChapterButton} type="button" onClick={() => goToChapter(index + 1)}>Continue journey to {journeyChapters[index + 1].company} <span aria-hidden="true">↓</span></button>
                  ) : (
                    <button className={styles.nextChapterButton} type="button" onClick={() => goToChapter(0)}>Return to Education <span aria-hidden="true">↑</span></button>
                  )}
                </footer>
              </section>
            ))}
          </div>
        </div>

        <section className={styles.epilogue}>
          <p className={styles.eyebrow}>What the journey adds up to</p>
          <h2>The next step is about responsibility, not a logo.</h2>
          <p>{closingCopy}</p>
          <div>
            <Link href="/">Explore the portfolio <span aria-hidden="true">↗</span></Link>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to the beginning ↑</button>
          </div>
        </section>
      </main>
    </div>
  );
}
