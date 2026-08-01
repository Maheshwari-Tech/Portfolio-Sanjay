import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return <a href={link[2]} key={index} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{link[1]}</a>;
    }
    return <span key={index}>{part}</span>;
  });
}

export default function MarkdownArticle({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let unordered: string[] = [];
  let ordered: string[] = [];
  let orderedStart = 1;
  let code: string[] = [];
  let insideCode = false;

  const flushLists = () => {
    if (unordered.length) {
      const items = unordered;
      blocks.push(<ul key={`ul-${blocks.length}`}>{items.map((item, index) => <li key={`${index}-${item}`}>{renderInline(item)}</li>)}</ul>);
      unordered = [];
    }
    if (ordered.length) {
      const items = ordered;
      blocks.push(<ol key={`ol-${blocks.length}`} start={orderedStart}>{items.map((item, index) => <li key={`${index}-${item}`}>{renderInline(item)}</li>)}</ol>);
      ordered = [];
      orderedStart = 1;
    }
  };

  content.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      flushLists();
      if (insideCode) {
        blocks.push(<pre key={`code-${blocks.length}`}><code>{code.join("\n")}</code></pre>);
        code = [];
        insideCode = false;
      } else insideCode = true;
      return;
    }
    if (insideCode) { code.push(rawLine); return; }
    if (!line) { flushLists(); return; }
    if (/^#{1,3}\s/.test(line)) {
      flushLists();
      const level = line.match(/^#+/)?.[0].length ?? 2;
      const heading = line.replace(/^#{1,3}\s*/, "");
      blocks.push(level === 1 ? <h2 key={`h-${blocks.length}`}>{renderInline(heading)}</h2> : <h3 key={`h-${blocks.length}`}>{renderInline(heading)}</h3>);
      return;
    }
    if (/^[-*]\s+/.test(line)) { if (ordered.length) flushLists(); unordered.push(line.replace(/^[-*]\s+/, "")); return; }
    if (/^\d+\.\s+/.test(line)) { if (unordered.length) flushLists(); if (!ordered.length) orderedStart = Number(line.match(/^\d+/)?.[0] ?? 1); ordered.push(line.replace(/^\d+\.\s+/, "")); return; }
    if (/^>\s?/.test(line)) { flushLists(); blocks.push(<blockquote key={`quote-${blocks.length}`}>{renderInline(line.replace(/^>\s?/, ""))}</blockquote>); return; }
    flushLists();
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  });
  flushLists();
  if (insideCode) blocks.push(<pre key={`code-${blocks.length}`}><code>{code.join("\n")}</code></pre>);
  return <div className="article-prose">{blocks}</div>;
}
