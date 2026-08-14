import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../SiteFooter";
import introductions from "../../data/source/introductions.json";
import IntroductionSwitcher from "./IntroductionSwitcher";
import styles from "./introduction.module.css";

export const metadata: Metadata = {
  title: "Introduction",
  description: "One, three, and five minute professional introductions for Sanjay Gandhi.",
  alternates: { canonical: "/Introduction" },
};

export default function IntroductionPage() {
  return (
    <div className={styles.page} id="top">
      <header className={styles.pageHeader}>
        <div className={styles.brand} aria-label="Sanjay Gandhi">
          <strong>SM<span>.</span></strong>
          <small>Interview introduction</small>
        </div>
        <p>Clear, human, and timed for the conversation.</p>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Professional introduction</p>
          <h1>A career built through scale, ownership, and people.</h1>
          <p className={styles.heroCopy}>
            From competitive programming to leading clinical reporting systems, each chapter reflects deeper technical responsibility and broader team impact.
          </p>
        </section>

        <IntroductionSwitcher versions={introductions} />

        <section className={styles.journeyCta} aria-labelledby="journey-link-title">
          <p>Beyond the introduction</p>
          <h2 id="journey-link-title">The decisions and experiences behind the work.</h2>
          <div>
            <p>The Journey page follows the ambitions, challenges, setbacks, gratitude, and mentoring experiences that shaped how I work and lead today.</p>
            <Link href="/journey">Read the Journey <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
