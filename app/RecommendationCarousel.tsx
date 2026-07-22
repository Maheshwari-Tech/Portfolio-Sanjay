type Recommendation = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  context: string;
  socialLink: string;
};

function recommendationIdentity(recommendation: Recommendation) {
  const initials = recommendation.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const company = recommendation.context.match(/<b>([^<]+)<\/b>/i)?.[1] ?? "Professional network";
  const normalizedCompany = company.toLowerCase();
  const tone = normalizedCompany.includes("amazon")
    ? "amazon"
    : normalizedCompany.includes("oracle")
      ? "oracle"
      : normalizedCompany.includes("hackerearth")
        ? "hackerearth"
        : normalizedCompany.includes("university") || normalizedCompany.includes("college")
          ? "education"
          : "independent";

  return { initials, tone };
}

function RecommendationCard({ recommendation, duplicate = false }: { recommendation: Recommendation; duplicate?: boolean }) {
  const identity = recommendationIdentity(recommendation);

  return (
    <article className={`recommendation-card recommendation-company-${identity.tone}`}>
      <div className="recommendation-topline">
        <span aria-label={`${recommendation.rating} out of 5 stars`}>{"★".repeat(recommendation.rating)}</span>
        <time>{recommendation.date}</time>
      </div>
      <blockquote className="recommendation-quote">“{recommendation.comment}”</blockquote>
      <div className="recommendation-person">
        <span className="recommendation-avatar" aria-hidden="true">{identity.initials}</span>
        <div className="recommendation-identity-copy">
          {duplicate
            ? <p className="recommendation-name">{recommendation.name} <span className="recommendation-linkedin-badge">in</span></p>
            : <a href={recommendation.socialLink} target="_blank" rel="noreferrer">{recommendation.name} <span className="recommendation-linkedin-badge" aria-hidden="true">in</span></a>}
          <p dangerouslySetInnerHTML={{ __html: recommendation.context }} />
        </div>
      </div>
    </article>
  );
}

export default function RecommendationCarousel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="recommendation-carousel" role="region" aria-label="LinkedIn recommendations">
      <div className="recommendation-marquee">
        <div className="recommendation-marquee-track">
          {[false, true].map((duplicate) => (
            <div className="recommendation-marquee-set" aria-hidden={duplicate} key={String(duplicate)}>
              {recommendations.map((recommendation) => <RecommendationCard duplicate={duplicate} key={`${duplicate}-${recommendation.id}`} recommendation={recommendation} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
