export type Recommendation = {
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

function recommendationHighlight(comment: string) {
  const normalized = comment.replace(/\s+/g, " ").trim();
  const firstSentence = normalized.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? normalized;
  if (firstSentence.length <= 112) return firstSentence;

  const shortened = firstSentence.slice(0, 109).replace(/\s+\S*$/, "").replace(/[.,;:!?]+$/, "");
  return `${shortened}…`;
}

function RecommendationCard({
  recommendation,
  duplicate = false,
  showHighlight = false,
}: {
  recommendation: Recommendation;
  duplicate?: boolean;
  showHighlight?: boolean;
}) {
  const identity = recommendationIdentity(recommendation);

  return (
    <article className={`recommendation-card recommendation-company-${identity.tone}`} role="listitem">
      <div className="recommendation-topline">
        <span aria-label={`${recommendation.rating} out of 5 stars`}>{"★".repeat(recommendation.rating)}</span>
        <time>{recommendation.date}</time>
      </div>
      {showHighlight && <p className="recommendation-highlight">{recommendationHighlight(recommendation.comment)}</p>}
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

export default function RecommendationCarousel({
  recommendations,
  variant = "marquee",
}: {
  recommendations: Recommendation[];
  variant?: "marquee" | "scroll";
}) {
  const uniqueRecommendations = Array.from(
    new Map(
      recommendations.map((recommendation) => [
        `${recommendation.name.trim().toLowerCase()}|${recommendation.comment.trim().toLowerCase()}|${recommendation.date}`,
        recommendation,
      ]),
    ).values(),
  );
  if (variant === "scroll") {
    return (
      <div className="recommendation-carousel recommendation-carousel-scroll" role="region" aria-label="LinkedIn recommendations">
        <div className="recommendation-scroll-track" role="list">
          {uniqueRecommendations.map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} showHighlight />)}
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-carousel" role="region" aria-label="LinkedIn recommendations">
      <div className="recommendation-marquee">
        <div className="recommendation-marquee-track">
          {[false, true].map((duplicate) => (
            <div className="recommendation-marquee-set" aria-hidden={duplicate} key={String(duplicate)}>
              {uniqueRecommendations.map((recommendation) => <RecommendationCard duplicate={duplicate} key={`${duplicate}-${recommendation.id}`} recommendation={recommendation} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
