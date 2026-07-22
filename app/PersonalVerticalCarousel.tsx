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

export default function PersonalVerticalCarousel({ items }: { items: PersonalCarouselItem[]; visibleCount: number }) {
  return (
    <div className="personal-moving-rail" role="region" aria-label="Personal recommendations">
      <div className="personal-moving-track">
        {[false, true].map((duplicate) => (
          <div className="personal-moving-set" aria-hidden={duplicate} key={String(duplicate)}>
            {items.map((item) => <PersonalCarouselCard duplicate={duplicate} item={item} key={`${duplicate}-${item.id}`} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalCarouselCard({ item, duplicate }: { item: PersonalCarouselItem; duplicate: boolean }) {
  const itemType = item.format ?? item.year ?? item.date ?? "";

  return (
    <article className="personal-item">
      <h4>
        <a href={item.url} target="_blank" rel="noreferrer" tabIndex={duplicate ? -1 : undefined}>
          {item.title}
        </a>
      </h4>
      <p>{item.description}</p>
      <div className="personal-item-meta">
        {itemType && <span>{itemType}</span>}
        {item.author && <span>{item.author}</span>}
        {item.location && <span>{item.location}</span>}
        {item.genre && <span>{item.genre}</span>}
      </div>
    </article>
  );
}
