"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PersonalCarouselItem = {
  id: number;
  category: string;
  title: string;
  description: string;
  url: string;
  status?: string;
  rating?: number;
  format?: string;
  year?: string | number;
  date?: string;
  author?: string;
  location?: string;
  genre?: string;
};

export default function PersonalVerticalCarousel({ items, visibleCount }: { items: PersonalCarouselItem[]; visibleCount: number }) {
  const [start, setStart] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [responsiveCount, setResponsiveCount] = useState(visibleCount);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [stageHeight, setStageHeight] = useState<number>();
  const currentRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<number | undefined>(undefined);
  const paused = interactionPaused || pageHidden;

  useEffect(() => {
    const updateCount = () => setResponsiveCount(window.innerWidth < 700 ? 1 : window.innerWidth < 1050 ? Math.min(2, visibleCount) : visibleCount);
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, [visibleCount]);

  useEffect(() => {
    const visibilityChanged = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => document.removeEventListener("visibilitychange", visibilityChanged);
  }, []);

  const advance = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    transitionTimer.current = window.setTimeout(() => {
      setStart((current) => (current + 1) % items.length);
      setAnimating(false);
    }, 700);
  }, [animating, items.length]);

  useEffect(() => {
    if (paused || items.length <= responsiveCount || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(advance, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [advance, items.length, paused, responsiveCount]);

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  const visibleItems = useMemo(() => Array.from({ length: Math.min(responsiveCount, items.length) }, (_, offset) => items[(start + offset) % items.length]), [items, responsiveCount, start]);
  const nextItems = useMemo(() => Array.from({ length: Math.min(responsiveCount, items.length) }, (_, offset) => items[(start + 1 + offset) % items.length]), [items, responsiveCount, start]);

  useEffect(() => {
    const updateHeight = () => setStageHeight(Math.max(currentRef.current?.scrollHeight ?? 0, nextRef.current?.scrollHeight ?? 0));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (currentRef.current) observer.observe(currentRef.current);
    if (nextRef.current) observer.observe(nextRef.current);
    return () => observer.disconnect();
  }, [nextItems, visibleItems]);

  return (
    <div className="personal-vertical-carousel" data-visible-count={responsiveCount} role="region" aria-roledescription="carousel" aria-label="Personal recommendations" onMouseEnter={() => setInteractionPaused(true)} onMouseLeave={() => setInteractionPaused(false)} onFocusCapture={() => setInteractionPaused(true)} onBlurCapture={() => setInteractionPaused(false)} onPointerDown={() => setInteractionPaused(true)} onPointerUp={() => setInteractionPaused(false)}>
      <div className={`personal-carousel-stage${animating ? " is-animating" : ""}`} style={stageHeight ? { height: `${stageHeight}px`, minHeight: 0 } : undefined}>
        <div className="personal-carousel-group personal-carousel-current" ref={currentRef}>
          {visibleItems.map((item) => <PersonalCarouselCard item={item} key={item.id} />)}
        </div>
        <div className="personal-carousel-group personal-carousel-next" aria-hidden="true" inert ref={nextRef}>
          {nextItems.map((item) => <PersonalCarouselCard item={item} key={item.id} />)}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Showing {visibleItems.map((item) => item.title).join(", ")}.</p>
      {items.length > responsiveCount && (
        <div className="personal-carousel-more-control">
          <span className="personal-carousel-progress" aria-hidden="true"><i style={{ transform: `scaleX(${(start + 1) / items.length})` }} /></span>
          <button
            type="button"
            disabled={animating}
            aria-label="Show more recommendations"
            onClick={advance}
          >
            <span>More</span>
            <span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg></span>
          </button>
        </div>
      )}
    </div>
  );
}

function PersonalCarouselCard({ item }: { item: PersonalCarouselItem }) {
  const marker = item.status ?? (item.category === "movies" ? "Favourite" : item.rating ? "★".repeat(item.rating) : "");
  const itemType = item.format ?? item.year ?? item.date ?? "";
  return (
    <div className="personal-item">
      <div className="personal-item-topline"><span>{marker}</span><span>{itemType}</span></div>
      <h4><a href={item.url} target="_blank" rel="noreferrer">{item.title} <span aria-hidden="true">↗</span></a></h4>
      <p>{item.description}</p>
      <div className="personal-item-meta">
        {item.author && <span>{item.author}</span>}{item.location && <span>{item.location}</span>}{item.genre && <span>{item.genre}</span>}
      </div>
    </div>
  );
}
