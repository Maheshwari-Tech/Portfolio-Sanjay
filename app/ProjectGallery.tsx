/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

type PreviewImage = {
  src: string;
  label: string;
  portrait?: boolean;
};

type ProjectGalleryProps = {
  images: PreviewImage[];
  projectName: string;
};

export default function ProjectGallery({ images, projectName }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  if (!activeImage) return null;

  const showPrevious = () => setActiveIndex((current) => (current - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % images.length);

  return (
    <div className="project-gallery" aria-label={`${projectName} product screenshots`}>
      <figure className={`project-gallery-frame ${activeImage.portrait ? "portrait" : ""}`}>
        <img src={activeImage.src} alt={`${projectName} — ${activeImage.label}`} />
        <figcaption>
          <span>{activeImage.label}</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
        </figcaption>
      </figure>
      {images.length > 1 && (
        <div className="project-gallery-controls">
          <button type="button" onClick={showPrevious} aria-label={`Previous ${projectName} screenshot`}>←</button>
          <div aria-label={`Screenshot ${activeIndex + 1} of ${images.length}`}>
            {images.map((image, index) => <span className={index === activeIndex ? "active" : ""} key={image.src} />)}
          </div>
          <button type="button" onClick={showNext} aria-label={`Next ${projectName} screenshot`}>→</button>
        </div>
      )}
    </div>
  );
}
