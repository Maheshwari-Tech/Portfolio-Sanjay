export type ArticleVisibility = "public" | "private" | "semi-private";
export type ArticleTone = "interview" | "work" | "self" | "knowledge-hld" | "time-management" | "behavioral";

export type ArticleRecord = {
  id: number;
  title: string;
  summary?: string;
  content_description: string;
  body?: string;
  date: string;
  created_at?: string;
  tags: string[];
  author: string;
  fileType: string;
  isTextFile: boolean;
  href?: string;
  asset_url?: string;
  fallback_pdf_url?: string;
  blob_key?: string | null;
  visibility?: ArticleVisibility;
  access_scope?: string;
  locked?: boolean;
  hidden?: boolean;
};

export const cleanArticleTitle = (title: string) => title.replace(/\.(md|svg|pdf)$/i, "");

export function articleTone(article: ArticleRecord): ArticleTone {
  const topics = `${article.title} ${article.tags.join(" ")}`.toLowerCase();
  if (article.access_scope === "recruiter" || /oracle|google|amazon|hackerearth|work experience|bar tender|bar raiser/.test(topics)) return "work";
  if (/time management|ways of working|scrum|meeting|work hours|typical day|tech lead day/.test(topics)) return "time-management";
  if (/behavio[u]?ral|leadership principles|feedback|communication/.test(topics)) return "behavioral";
  if (/system design|\bhld\b|architecture|delivery framework/.test(topics)) return "knowledge-hld";
  if (/interview|coding|data structures|programming language/.test(topics)) return "interview";
  return "self";
}

export const articleToneLabel: Record<ArticleTone, string> = {
  interview: "Interview",
  work: "Work",
  self: "Self",
  "knowledge-hld": "Knowledge · HLD",
  "time-management": "Time management",
  behavioral: "Behavioral",
};

export function articleSummary(article: ArticleRecord, length = 190) {
  const explicit = article.summary?.trim();
  if (explicit) return explicit;
  const readable = article.content_description
    .replace(/[#*_`>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (readable.length <= length) return readable;
  return `${readable.slice(0, length).trimEnd()}…`;
}

export function articleCreationTime(article: ArticleRecord) {
  const time = new Date(article.created_at ?? article.date).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function sortArticlesByCreation(articles: ArticleRecord[]) {
  return [...articles].sort((left, right) => articleCreationTime(right) - articleCreationTime(left) || right.id - left.id);
}

export function mergeArticleCollections(localArticles: ArticleRecord[], remoteArticles: ArticleRecord[]) {
  const merged = new Map(localArticles.map((article) => [article.id, article]));
  remoteArticles.forEach((article) => {
    const local = merged.get(article.id);
    merged.set(article.id, local
      ? { ...local, ...article, tags: Array.from(new Set([...local.tags, ...article.tags])) }
      : article);
  });
  return Array.from(merged.values());
}

export function publicArchiveArticles(articles: ArticleRecord[]): ArticleRecord[] {
  return articles.flatMap<ArticleRecord>((article) => {
    if (article.hidden) return [];
    const visibility = article.visibility ?? "public";
    if (visibility === "public") return [{ ...article, visibility }];
    return [{
      ...article,
      body: undefined,
      asset_url: undefined,
      fallback_pdf_url: undefined,
      blob_key: undefined,
      content_description: articleSummary(article),
      locked: true,
      visibility,
    }];
  });
}

export function similarArticles(current: ArticleRecord, candidates: ArticleRecord[], limit = 3) {
  const tags = new Set(current.tags.map((tag) => tag.toLowerCase()));
  return sortArticlesByCreation(candidates)
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({
      candidate,
      score: candidate.tags.reduce((total, tag) => total + Number(tags.has(tag.toLowerCase())), 0),
    }))
    .sort((left, right) => right.score - left.score || articleCreationTime(right.candidate) - articleCreationTime(left.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
