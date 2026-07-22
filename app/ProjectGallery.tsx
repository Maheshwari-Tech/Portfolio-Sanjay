import Image from "next/image";

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
  if (!images.length) return null;

  return (
    <div className="project-gallery project-gallery-grid" data-image-count={images.length} aria-label={`${projectName} product screenshots`}>
      {images.map((image) => (
        <figure className={`project-gallery-frame ${image.portrait ? "portrait" : ""}`} key={image.src}>
          <Image
            src={image.src}
            alt={`${projectName} — ${image.label}`}
            fill
            sizes={images.length > 1 ? "(max-width: 900px) 45vw, 23vw" : "(max-width: 900px) 90vw, 46vw"}
          />
          <figcaption><span>{image.label}</span></figcaption>
        </figure>
      ))}
    </div>
  );
}
