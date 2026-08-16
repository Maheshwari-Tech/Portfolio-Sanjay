import ContentInteractions from "../ContentInteractions";
import MarkdownArticle from "./MarkdownArticle";
import VisualArticleAsset from "./VisualArticleAsset";
import { cleanArticleTitle, type ArticleRecord } from "./articleData";

export default function ArticlePresentation({ article, markdownContent, visualAsset, fallbackPdf }: { article: ArticleRecord; markdownContent: string; visualAsset?: string; fallbackPdf?: string }) {
  const isPdf = article.fileType === "pdf";
  const primaryAsset = visualAsset ?? article.asset_url;
  return <article className="article-shell">
    <header className="article-header">
      <p className="eyebrow">Notes &amp; Thoughts</p>
      <h1>{cleanArticleTitle(article.title)}</h1>
      <div className="article-byline"><span>By {article.author}</span><time>{article.date}</time><span>{article.tags.join(" · ")}</span></div>
    </header>
    {article.isTextFile ? <MarkdownArticle content={markdownContent} /> : primaryAsset ? <VisualArticleAsset primaryAsset={primaryAsset} fallbackAsset={article.asset_url} fallbackPdf={fallbackPdf} isPdf={isPdf} title={cleanArticleTitle(article.title)} /> : null}
    <ContentInteractions contentId={`article-${article.id}`} />
  </article>;
}
