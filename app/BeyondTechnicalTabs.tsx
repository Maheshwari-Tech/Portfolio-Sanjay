"use client";

import { KeyboardEvent, useRef, useState } from "react";
import PersonalRecommendation from "./PersonalRecommendation";
import PersonalVerticalCarousel from "./PersonalVerticalCarousel";

type PersonalCategory = "books" | "movies" | "travel";

type PersonalItem = {
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

const categories: Array<{ id: PersonalCategory; label: string; title: string }> = [
  { id: "books", label: "Books", title: "Ideas I return to" },
  { id: "movies", label: "Movies & Series", title: "Stories I’d happily rewatch" },
  { id: "travel", label: "Travel", title: "Places I’d go back to" },
];

export default function BeyondTechnicalTabs({ items }: { items: PersonalItem[] }) {
  const [activeCategory, setActiveCategory] = useState<PersonalCategory>("books");
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const active = categories.find((category) => category.id === activeCategory) ?? categories[0];
  const categoryItems = items.filter((item) => item.category === activeCategory);
  const recommendationMode = activeCategory === "movies" ? "screen" : activeCategory === "books" ? "book" : "travel";
  const visibleCount = 3;
  const selectTab = (index: number) => {
    const category = categories[(index + categories.length) % categories.length];
    setActiveCategory(category.id);
    tabsRef.current[(index + categories.length) % categories.length]?.focus();
  };
  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") { event.preventDefault(); selectTab(index + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); selectTab(index - 1); }
    if (event.key === "Home") { event.preventDefault(); selectTab(0); }
    if (event.key === "End") { event.preventDefault(); selectTab(categories.length - 1); }
  };

  return (
    <div className="personal-categories" data-active-category={activeCategory}>
      <div className="personal-category-toggle" role="tablist" aria-label="Beyond technical interests">
        {categories.map((category, index) => (
          <button
            className={activeCategory === category.id ? "active" : ""}
            type="button"
            role="tab"
            id={`personal-tab-${category.id}`}
            aria-selected={activeCategory === category.id}
            aria-controls={`personal-panel-${category.id}`}
            tabIndex={activeCategory === category.id ? 0 : -1}
            onClick={() => setActiveCategory(category.id)}
            onKeyDown={(event) => handleTabKey(event, index)}
            ref={(element) => { tabsRef.current[index] = element; }}
            key={category.id}
          >
            {category.label}
          </button>
        ))}
      </div>

      <article className={`personal-category personal-category-${activeCategory}`} id={`personal-panel-${activeCategory}`} role="tabpanel" aria-labelledby={`personal-tab-${activeCategory}`} tabIndex={0} key={activeCategory}>
        <div className="personal-category-heading">
          <div className="personal-category-copy">
            <p className="eyebrow">{active.label}</p>
            <h3>{active.title}</h3>
          </div>
        </div>

        {activeCategory === "travel" && (
          <div className="travel-memory-label">
            <span>Travel memories</span>
            <span>Places revisited</span>
          </div>
        )}

        <div className="personal-items">
          <PersonalVerticalCarousel items={categoryItems} visibleCount={visibleCount} />
        </div>
      </article>

      <aside className="personal-shared-recommendation">
        <div>
          <span className="card-kicker">Share a recommendation</span>
          <h3>Found something worth passing on?</h3>
        </div>
        <PersonalRecommendation key={activeCategory} mode={recommendationMode} />
      </aside>
    </div>
  );
}
