import type { Metadata } from "next";
import personalItemsFallback from "../../data/source/personal.json";
import videosFallback from "../../data/source/videos.json";
import BeyondTechnicalTabs from "../BeyondTechnicalTabs";
import SiteFooter from "../SiteFooter";
import SiteHeader from "../SiteHeader";
import VideoCarousel from "../VideoCarousel";
import { backendFirst } from "../serverContent";

export const metadata: Metadata = {
  title: "Personal",
  description: "The books, stories, places, and people that shape Sanjay Gandhi beyond engineering.",
  alternates: { canonical: "/personal" },
  openGraph: {
    title: "Personal — Sanjay Gandhi",
    description: "The books, stories, places, and people that shape Sanjay Gandhi beyond engineering.",
    url: "/personal",
    type: "profile",
  },
};

export const revalidate = 120;

export default async function PersonalPage() {
  const [personalItems, videos] = await Promise.all([
    backendFirst("personal", personalItemsFallback),
    backendFirst("videos", videosFallback),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="personal-page" id="main-content">
        <section className="personal-section personal-page-section">
          <div className="section-heading personal-heading">
            <div>
              <p className="eyebrow">Beyond engineering</p>
              <h1>What shapes me beyond the work.</h1>
            </div>
            <p>The films, series, books, places, and people that shape how I see the world beyond systems and software.</p>
          </div>

          <article className="family-card">
            <div>
              <span className="card-kicker">Family</span>
              <h2>Life is better when it&apos;s built together. <span aria-hidden="true">♥</span></h2>
              <p>Meet Shalini Thebaria—my wife, closest friend, and the person who makes every chapter more meaningful.</p>
            </div>
            <a className="family-profile-link" href="https://shalinithebaria.com" target="_blank" rel="noreferrer">
              <span>
                <small>Shalini Thebaria</small>
                <strong>Explore her portfolio</strong>
              </span>
              <i aria-hidden="true">↗</i>
            </a>
          </article>

          <BeyondTechnicalTabs items={personalItems} />
        </section>

        <section className="media-section" id="media" aria-labelledby="media-title">
          <div className="video-heading">
            <p className="eyebrow">Media</p>
            <h2 id="media-title">Video conversations.</h2>
          </div>
          <VideoCarousel videos={videos} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
