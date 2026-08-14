import type { Metadata } from "next";
import SiteFooter from "../SiteFooter";
import goals from "../../data/source/goals.json";
import styles from "./goals.module.css";

export const metadata: Metadata = {
  title: "Goals",
  description: "The five priorities guiding Sanjay Gandhi's next stage of growth.",
  alternates: { canonical: "/Goals" },
};

export default function GoalsPage() {
  return (
    <div className={styles.page} id="top">
      <header className={styles.pageHeader}>
        <div className={styles.brand} aria-label="Sanjay Gandhi">
          <strong>SM<span>.</span></strong>
          <small>Goals</small>
        </div>
        <p>What matters in the next opportunity.</p>
      </header>

      <main>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>What I look for</p>
            <h1>What I look for in the next opportunity.</h1>
          </div>
          <div className={styles.northStar}>
            <span>10 to 15 year direction</span>
            <strong>CTO</strong>
            <p>Build the technical judgment, people leadership, and business perspective required to lead technology at an organizational level.</p>
          </div>
        </section>

        <section className={styles.goals} aria-label="What I look for in a career opportunity">
          {goals.map((goal) => (
            <article className={styles.goal} key={goal.number}>
              <span className={styles.number}>{goal.number}</span>
              <div className={styles.goalHeading}>
                <h2>{goal.title}</h2>
                <p>{goal.summary}</p>
              </div>
              <div className={styles.why}>
                <span>Why</span>
                <p>{goal.why}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.tradeoffs} aria-labelledby="tradeoffs-title">
          <header className={styles.tradeoffsHeader}>
            <p>My career equation</p>
            <h2 id="tradeoffs-title">How I view career value.</h2>
          </header>

          <div className={styles.formula} aria-label="Compensation equals title multiplied by brand name">
            <strong>Compensation</strong>
            <i>=</i>
            <strong>Title</strong>
            <i>×</i>
            <strong>Brand Name</strong>
          </div>

          <section className={styles.switchSection} aria-labelledby="switch-title">
            <header>
              <p>How I consider a switch</p>
              <h3 id="switch-title">What I can evaluate, and what takes time.</h3>
            </header>

            <div className={styles.switchRule} aria-label="Career switch trade-offs">
              <article>
                <span>Known company</span>
                <strong>I prioritize the title.</strong>
                <p>When I already know the company and trust its brand, I look for a title that gives me greater scope, ownership, and room to grow.</p>
              </article>
              <article>
                <span>Unknown company</span>
                <strong>I prioritize compensation.</strong>
                <p>When the company is less familiar to me, I expect compensation to justify the additional uncertainty and brand trade-off.</p>
              </article>
            </div>

            <aside className={styles.discoveryNote}>
              <span>How I assess the other two goals</span>
              <p><strong>The right team and a problem worth solving:</strong> I use the interview to form my own unbiased view of the hiring manager, team, and problem. If I expect a favourable result, I research them in depth afterward. This protects my first-hand judgment and avoids spending an hour on an opportunity that may not progress.</p>
            </aside>
          </section>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
