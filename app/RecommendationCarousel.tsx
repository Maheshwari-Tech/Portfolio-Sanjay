"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Recommendation = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  context: string;
  socialLink: string;
};

const visibleCards = () => {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 720) return 1;
  if (window.innerWidth < 1100) return 2;
  return 3;
};

export default function RecommendationCarousel({ recommendations }: { recommendations: Recommendation[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const scrollFrame = useRef<number | null>(null);
  const pages = useMemo(() => Math.max(1, Math.ceil(recommendations.length / perPage)), [perPage, recommendations.length]);

  useEffect(() => {
    const updateLayout = () => {
      const next = visibleCards();
      setPerPage(next);
      setPage((current) => Math.min(current, Math.max(0, Math.ceil(recommendations.length / next) - 1)));
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [recommendations.length]);

  const goToPage = (nextPage: number) => {
    const targetPage = Math.max(0, Math.min(nextPage, pages - 1));
    const targetCard = trackRef.current?.querySelectorAll<HTMLElement>(".recommendation-card")[targetPage * perPage];
    trackRef.current?.scrollTo({ left: targetCard?.offsetLeft ?? 0, behavior: "smooth" });
    setPage(targetPage);
  };

  const syncPageFromScroll = () => {
    if (scrollFrame.current !== null) return;
    scrollFrame.current = window.requestAnimationFrame(() => {
      const track = trackRef.current;
      scrollFrame.current = null;
      if (!track) return;
      const cards = Array.from(track.querySelectorAll<HTMLElement>(".recommendation-card"));
      const nearestIndex = cards.reduce((nearest, card, index) => (
        Math.abs(card.offsetLeft - track.scrollLeft) < Math.abs(cards[nearest].offsetLeft - track.scrollLeft) ? index : nearest
      ), 0);
      setPage(Math.min(pages - 1, Math.floor(nearestIndex / perPage)));
    });
  };

  return (
    <div className="recommendation-carousel">
      <div className="recommendations-grid" ref={trackRef} onScroll={syncPageFromScroll} aria-label="LinkedIn recommendations" aria-describedby="recommendation-carousel-status">
        {recommendations.map((recommendation) => {
          const isLong = recommendation.comment.length > 330;
          const excerpt = isLong ? `${recommendation.comment.slice(0, 330).trim()}…` : recommendation.comment;
          return (
          <article className="recommendation-card" key={recommendation.id}>
            <div className="recommendation-topline">
              <span aria-label={`${recommendation.rating} out of 5 stars`}>{"★".repeat(recommendation.rating)}</span>
            </div>
            <blockquote>“{excerpt}”</blockquote>
            {isLong && <details className="recommendation-full"><summary>Read full recommendation</summary><p>{recommendation.comment}</p></details>}
            <div className="recommendation-person">
              <div>
                <a href={recommendation.socialLink} target="_blank" rel="noreferrer">{recommendation.name} <span aria-hidden="true">↗</span></a>
                <p dangerouslySetInnerHTML={{ __html: recommendation.context }} />
              </div>
              <time>{recommendation.date}</time>
            </div>
          </article>
          );
        })}
      </div>

      <p className="sr-only" id="recommendation-carousel-status" aria-live="polite">Showing recommendation page {page + 1} of {pages}.</p>

      <div className="recommendation-carousel-dots" aria-label="Choose recommendation page">
        {Array.from({ length: pages }, (_, index) => (
          <button type="button" className={index === page ? "active" : ""} onClick={() => goToPage(index)} aria-label={`Go to recommendation page ${index + 1}`} aria-current={index === page ? "page" : undefined} key={index} />
        ))}
      </div>

      {pages > 1 && (
        <div className="recommendation-actions">
          <div className="recommendation-more-control">
            <button type="button" onClick={() => goToPage((page + 1) % pages)} aria-label="Show more LinkedIn recommendations">
              <span>Show More</span>
              <span className="recommendation-control-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
