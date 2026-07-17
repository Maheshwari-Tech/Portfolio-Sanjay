#!/usr/bin/env python3
"""Publish PDF articles from the Obsidian Blogs folder.

The source folder is read-only. PDFs are copied to a web-safe, importer-owned
directory and represented in the frontend content cache. Repeated runs replace
only records marked ``source: obsidian`` and remove stale PDF copies from the
importer-owned directory.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path(
    os.getenv(
        "OBSIDIAN_BLOG_SOURCE",
        "/Users/snju/Documents/Obsidian Vault/Organized Notes/Blogs",
    )
)
DEFAULT_TARGETS = (PROJECT_ROOT / "data" / "source" / "blogs.json",)
ASSET_DIRECTORY = PROJECT_ROOT / "public" / "blogs" / "obsidian"
PUBLIC_ASSET_PREFIX = "/blogs/obsidian"


@dataclass(frozen=True)
class PdfArticle:
    path: Path
    relative_path: str
    title: str
    asset_name: str
    extracted_text: str
    page_count: int | None


def web_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")
    return slug or "article"


def asset_name(relative_path: str) -> str:
    digest = hashlib.sha256(relative_path.encode("utf-8")).hexdigest()[:8]
    return f"{web_slug(Path(relative_path).stem)}-{digest}.pdf"


def normalize_pdf_text(text: str) -> str:
    text = text.replace("\x00", " ").replace("\r\n", "\n").replace("\r", "\n")
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line).strip()


def extract_pdf_text(path: Path) -> tuple[str, int | None]:
    """Extract searchable text when pypdf or pdftotext is available.

    PDF publishing never depends on extraction: image-only PDFs remain valid
    visual articles and receive a useful title-based fallback description.
    """

    try:
        from pypdf import PdfReader  # type: ignore[import-not-found]

        reader = PdfReader(path)
        return normalize_pdf_text("\n".join(page.extract_text() or "" for page in reader.pages)), len(reader.pages)
    except Exception:
        # Extraction is an enhancement, not a requirement for publishing.
        pass

    executable = shutil.which("pdftotext")
    if executable:
        try:
            result = subprocess.run(
                [executable, "-layout", str(path), "-"],
                check=True,
                capture_output=True,
                text=True,
                timeout=60,
            )
            return normalize_pdf_text(result.stdout), None
        except (OSError, subprocess.SubprocessError):
            pass

    return "", None


def fallback_description(title: str) -> str:
    return f"A visual article by Sanjay Gandhi about {title.lower()}. Open the embedded PDF to read the complete article."


def plain_excerpt(value: str, limit: int = 260) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    if len(value) <= limit:
        return value
    return value[:limit].rsplit(" ", 1)[0].rstrip(".,;:") + "…"


def article_tags(title: str) -> list[str]:
    lowered = title.casefold()
    tags = ["Engineering Notes"]
    if "system design" in lowered or "delivery framework" in lowered:
        tags = ["System Design", "Interview Preparation", "Architecture"]
    return tags


def collect_pdfs(source: Path) -> list[PdfArticle]:
    articles: list[PdfArticle] = []
    for path in sorted(source.rglob("*.pdf"), key=lambda item: item.as_posix().casefold()):
        relative = path.relative_to(source)
        if any(part.startswith(".") for part in relative.parts):
            continue
        text, pages = extract_pdf_text(path)
        articles.append(
            PdfArticle(
                path=path,
                relative_path=relative.as_posix(),
                title=path.stem.strip(),
                asset_name=asset_name(relative.as_posix()),
                extracted_text=text,
                page_count=pages,
            )
        )
    return articles


def source_date(article: PdfArticle) -> str:
    return datetime.fromtimestamp(article.path.stat().st_mtime).date().isoformat()


def read_existing(path: Path) -> list[dict[str, object]]:
    if not path.exists():
        return []
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        raise ValueError(f"Expected a JSON array in {path}")
    return value


def build_records(existing: list[dict[str, object]], articles: Iterable[PdfArticle]) -> list[dict[str, object]]:
    articles = list(articles)
    generated = [item for item in existing if item.get("source") == "obsidian"]
    manual = [item for item in existing if item.get("source") != "obsidian"]
    generated_by_source = {str(item.get("source_path")): item for item in generated if item.get("source_path")}
    ids_by_source = {str(item.get("source_path")): int(item["id"]) for item in generated if item.get("source_path")}
    used_ids = {int(item["id"]) for item in manual}
    next_id = max(used_ids | {int(item["id"]) for item in generated} | {0}) + 1

    imported: list[dict[str, object]] = []
    for article in articles:
        article_id = ids_by_source.get(article.relative_path)
        if article_id is None or article_id in used_ids:
            while next_id in used_ids:
                next_id += 1
            article_id, next_id = next_id, next_id + 1
        used_ids.add(article_id)

        previous = generated_by_source.get(article.relative_path, {})
        previous_description = previous.get("content_description") if previous.get("fileType") == "pdf" else None
        description = article.extracted_text or (
            str(previous_description) if previous_description else fallback_description(article.title)
        )
        record: dict[str, object] = {
            "id": article_id,
            "title": article.title,
            "summary": plain_excerpt(description),
            "content_description": description,
            "date": source_date(article),
            "tags": article_tags(article.title),
            "author": "Sanjay Gandhi",
            "fileType": "pdf",
            "isTextFile": False,
            "visibility": "public",
            "hidden": False,
            "source": "obsidian",
            "source_path": article.relative_path,
            "asset_url": f"{PUBLIC_ASSET_PREFIX}/{article.asset_name}",
        }
        pages = article.page_count or previous.get("page_count")
        if pages is not None:
            record["page_count"] = int(pages)
        imported.append(record)
    return manual + imported


def serialize(records: list[dict[str, object]]) -> str:
    return json.dumps(records, indent=2, ensure_ascii=False) + "\n"


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        handle.write(content)
        temporary = Path(handle.name)
    temporary.replace(path)


def sync_assets(articles: Iterable[PdfArticle]) -> list[Path]:
    ASSET_DIRECTORY.mkdir(parents=True, exist_ok=True)
    desired = {article.asset_name for article in articles}
    removed: list[Path] = []

    for article in articles:
        destination = ASSET_DIRECTORY / article.asset_name
        if not destination.exists() or destination.read_bytes() != article.path.read_bytes():
            with tempfile.NamedTemporaryFile("wb", dir=ASSET_DIRECTORY, delete=False) as handle:
                handle.write(article.path.read_bytes())
                temporary = Path(handle.name)
            temporary.replace(destination)

    for existing in ASSET_DIRECTORY.glob("*.pdf"):
        if existing.name not in desired:
            existing.unlink()
            removed.append(existing)
    return removed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Folder containing publishable PDF articles")
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing JSON or copying PDFs")
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    if not source.is_dir():
        raise SystemExit(f"PDF blog source directory not found: {source}")

    existing = read_existing(DEFAULT_TARGETS[0])
    articles = collect_pdfs(source)
    records = build_records(existing, articles)
    output = serialize(records)
    changed = [path for path in DEFAULT_TARGETS if not path.exists() or path.read_text(encoding="utf-8") != output]

    print(f"Source: {source}")
    print(f"PDF articles found: {len(articles)}")
    print(f"PDFs with searchable text: {sum(bool(article.extracted_text) for article in articles)}")
    print(f"Manual articles preserved: {sum(item.get('source') != 'obsidian' for item in records)}")
    print(f"Generated articles: {sum(item.get('source') == 'obsidian' for item in records)}")
    print(f"JSON snapshots requiring update: {len(changed)}")

    if args.dry_run:
        return 0

    removed = sync_assets(articles)
    for path in DEFAULT_TARGETS:
        atomic_write(path, output)
        print(f"Updated {path.relative_to(PROJECT_ROOT)}")
    print(f"Published PDFs: {ASSET_DIRECTORY.relative_to(PROJECT_ROOT)}")
    print(f"Stale generated PDFs removed: {len(removed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
