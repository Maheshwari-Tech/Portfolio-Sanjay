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
        <p>Direction for the next chapter.</p>
      </header>

      <main>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Top five goals</p>
            <h1>What I want next, and why it matters.</h1>
          </div>
          <div className={styles.northStar}>
            <span>10 to 15 year direction</span>
            <strong>CTO</strong>
            <p>Build the technical judgment, people leadership, and business perspective required to lead technology at an organizational level.</p>
          </div>
        </section>

        <section className={styles.goals} aria-label="Five career goals">
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

        <aside className={styles.principle}>
          <p>Career trade-offs</p>
          <div className={styles.formula} aria-label="Compensation equals title multiplied by brand name">
            <strong>Compensation</strong>
            <i>=</i>
            <strong>Title</strong>
            <i>×</i>
            <strong>Brand Name</strong>
          </div>
          <span>When compensation is constant: <strong>Title ∝ 1 / Brand Name</strong></span>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
