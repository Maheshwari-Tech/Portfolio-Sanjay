"use client";

import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (items.length <= visibleCount || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let transitionTimer: number | undefined;
    const timer = window.setInterval(() => {
      setAnimating(true);
      transitionTimer = window.setTimeout(() => {
        setStart((current) => (current + 1) % items.length);
        setAnimating(false);
      }, 700);
    }, 3600);

    return () => {
      window.clearInterval(timer);
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, [items.length, visibleCount]);

  const visibleItems = useMemo(() => Array.from({ length: Math.min(visibleCount, items.length) }, (_, offset) => items[(start + offset) % items.length]), [items, start, visibleCount]);
  const nextItems = useMemo(() => Array.from({ length: Math.min(visibleCount, items.length) }, (_, offset) => items[(start + 1 + offset) % items.length]), [items, start, visibleCount]);

  return (
    <div className="personal-vertical-carousel" data-visible-count={visibleCount} aria-label={`${visibleCount} rotating recommendations`}>
      <div className={`personal-carousel-stage${animating ? " is-animating" : ""}`}>
        <div className="personal-carousel-group personal-carousel-current">
          {visibleItems.map((item) => <PersonalCarouselCard item={item} key={item.id} />)}
        </div>
        <div className="personal-carousel-group personal-carousel-next" aria-hidden="true">
          {nextItems.map((item) => <PersonalCarouselCard item={item} key={item.id} />)}
        </div>
      </div>
      {items.length > visibleCount && <span className="personal-carousel-status" aria-hidden="true">{String(start + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} ↓</span>}
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
