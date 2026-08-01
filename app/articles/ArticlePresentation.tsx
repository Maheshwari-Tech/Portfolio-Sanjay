import ContentInteractions from "../ContentInteractions";
import MarkdownArticle from "./MarkdownArticle";
import { cleanArticleTitle, type ArticleRecord } from "./articleData";

export default function ArticlePresentation({ article, markdownContent, visualAsset, fallbackPdf }: { article: ArticleRecord; markdownContent: string; visualAsset?: string; fallbackPdf?: string }) {
  const isPdf = article.fileType === "pdf";
  return <article className="article-shell">
    <header className="article-header">
      <p className="eyebrow">Note from my Second Brain</p>
      <h1>{cleanArticleTitle(article.title)}</h1>
      <div className="article-byline"><span>By {article.author}</span><time>{article.date}</time><span>{article.tags.join(" · ")}</span></div>
    </header>
    {article.isTextFile ? <MarkdownArticle content={markdownContent} /> : visualAsset ? <div className="visual-article">
      <object type={isPdf ? "application/pdf" : "image/svg+xml"} data={visualAsset} title={cleanArticleTitle(article.title)}><a href={visualAsset} target="_blank" rel="noreferrer">Open the visual note</a></object>
      <div className="visual-article-actions"><a href={visualAsset} target="_blank" rel="noreferrer">Open full screen</a>{isPdf && <a href={visualAsset} download>Download PDF ↓</a>}{!isPdf && fallbackPdf && <a href={fallbackPdf} download>Download PDF ↓</a>}</div>
    </div> : null}
    <ContentInteractions contentId={`article-${article.id}`} />
  </article>;
}
