"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Image from "next/image";

type Video = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
};

export default function VideoCarousel({ videos }: { videos: Video[] }) {
  const [index, setIndex] = useState(0);
  const current = videos[index];

  if (!current) return null;

  const previous = () => setIndex((value) => (value - 1 + videos.length) % videos.length);
  const next = () => setIndex((value) => (value + 1) % videos.length);

  return (
    <div className="video-carousel" aria-label="Video conversations">
      <article className="video-slide">
        <a href={current.url} target="_blank" rel="noreferrer">
          <div className="video-image-wrap">
            <Image src={current.thumbnail} alt="" className="video-image" fill sizes="(max-width: 720px) 90vw, 55vw" />
            <span aria-hidden="true">▶</span>
          </div>
          <div className="video-slide-copy">
            <span>{String(index + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}</span>
            <h4>{current.title}</h4>
            <p>{current.description}</p>
          </div>
        </a>
      </article>

      <div className="video-controls">
        <button type="button" onClick={previous} aria-label="Previous video">←</button>
        <div aria-label={`Video ${index + 1} of ${videos.length}`}>
          {videos.map((video, itemIndex) => <span className={itemIndex === index ? "active" : ""} key={video.id} />)}
        </div>
        <button type="button" onClick={next} aria-label="Next video">→</button>
      </div>
    </div>
  );
}
