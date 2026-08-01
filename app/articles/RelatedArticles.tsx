import Link from "next/link";
import { articleSummary, cleanArticleTitle, type ArticleRecord } from "./articleData";

export default function RelatedArticles({ articles }: { articles: ArticleRecord[] }) {
  return <aside className="related-articles" aria-labelledby="related-notes-title">
    <div className="related-articles-heading"><div><p className="eyebrow">Keep reading</p><h2 id="related-notes-title">Related notes</h2></div><div className="related-articles-links"><Link href="/articles">Read all notes <span aria-hidden="true">↗</span></Link><Link href="/articles#subscribe">Subscribe <span aria-hidden="true">→</span></Link></div></div>
    <div>{articles.map((item) => <Link href={item.href ?? `/articles/${item.id}`} key={item.id}><span>{item.locked || item.visibility === "private" || item.access_scope === "private" ? "🔒 Private note" : item.date}</span><strong>{cleanArticleTitle(item.title)}</strong><small>{articleSummary(item, 105)}</small></Link>)}</div>
  </aside>;
}
