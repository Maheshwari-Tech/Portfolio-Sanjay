"use client";

import { useEffect, useState } from "react";

export default function VisualArticleAsset({
  primaryAsset,
  fallbackAsset,
  fallbackPdf,
  isPdf,
  title,
}: {
  primaryAsset?: string;
  fallbackAsset?: string;
  fallbackPdf?: string;
  isPdf: boolean;
  title: string;
}) {
  const [failedAssets, setFailedAssets] = useState<Set<string>>(() => new Set());
  const candidates = [primaryAsset, fallbackAsset].filter(
    (asset, index, assets): asset is string => Boolean(asset) && assets.indexOf(asset) === index,
  );
  const activeAsset = candidates.find((asset) => !failedAssets.has(asset));

  useEffect(() => {
    if (!primaryAsset || !fallbackAsset || primaryAsset === fallbackAsset) return;
    const controller = new AbortController();
    let active = true;
    fetch(primaryAsset, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        await response.body?.cancel().catch(() => undefined);
        if (active && !response.ok) setFailedAssets((current) => new Set(current).add(primaryAsset));
      })
      .catch(() => {
        if (active && !controller.signal.aborted) setFailedAssets((current) => new Set(current).add(primaryAsset));
      });
    return () => { active = false; controller.abort(); };
  }, [fallbackAsset, primaryAsset]);

  if (!activeAsset) return null;

  return <div className="visual-article">
    <object
      key={activeAsset}
      type={isPdf ? "application/pdf" : "image/svg+xml"}
      data={activeAsset}
      title={title}
      onError={() => setFailedAssets((current) => new Set(current).add(activeAsset))}
    >
      <a href={activeAsset} target="_blank" rel="noreferrer">Open the visual article</a>
    </object>
    <div className="visual-article-actions">
      <a href={activeAsset} target="_blank" rel="noreferrer">Open full screen</a>
      {isPdf && <a href={activeAsset} download>Download PDF ↓</a>}
      {!isPdf && fallbackPdf && <a href={fallbackPdf} download>Download PDF ↓</a>}
    </div>
  </div>;
}
