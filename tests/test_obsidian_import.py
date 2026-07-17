import importlib.util
import json
from pathlib import Path
import sys


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "import_obsidian_blogs.py"
SPEC = importlib.util.spec_from_file_location("obsidian_import", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


def pdf_article(tmp_path: Path, name: str, text: str = "Searchable article text"):
    path = tmp_path / name
    path.write_bytes(b"%PDF-1.4 test fixture")
    return MODULE.PdfArticle(
        path=path,
        relative_path=name,
        title=path.stem,
        asset_name=MODULE.asset_name(name),
        extracted_text=text,
        page_count=2,
    )


def test_pdf_records_preserve_manual_articles_and_replace_old_imports(tmp_path):
    existing = [
        {"id": 4, "title": "Manual"},
        {"id": 7, "title": "Old Markdown", "source": "obsidian", "source_path": "HLD/Old.md"},
    ]
    article = pdf_article(tmp_path, "Delivery Framework.pdf")
    records = MODULE.build_records(existing, [article])

    assert [item["title"] for item in records] == ["Manual", "Delivery Framework"]
    generated = records[1]
    assert generated["fileType"] == "pdf"
    assert generated["isTextFile"] is False
    assert generated["asset_url"].startswith("/blogs/obsidian/delivery-framework-")
    assert generated["content_description"] == "Searchable article text"
    json.dumps(records)


def test_generated_ids_and_asset_names_are_stable(tmp_path):
    article = pdf_article(tmp_path, "System Design Interviews Introduction.pdf")
    first = MODULE.build_records([{"id": 6, "title": "Manual"}], [article])
    second = MODULE.build_records(first, [article])

    assert first[1]["id"] == second[1]["id"]
    assert first[1]["asset_url"] == second[1]["asset_url"]
    assert first[1]["page_count"] == 2


def test_fallback_description_supports_image_only_pdfs(tmp_path):
    article = pdf_article(tmp_path, "Architecture Notes.pdf", text="")
    record = MODULE.build_records([], [article])[0]
    assert "Open the embedded PDF" in record["content_description"]


def test_existing_search_text_is_preserved_without_local_extractor(tmp_path):
    article = pdf_article(tmp_path, "Architecture Notes.pdf", text="")
    existing = [{
        "id": 9,
        "title": article.title,
        "source": "obsidian",
        "source_path": article.relative_path,
        "fileType": "pdf",
        "content_description": "Previously extracted searchable text",
        "page_count": 3,
    }]
    record = MODULE.build_records(existing, [article])[0]
    assert record["content_description"] == "Previously extracted searchable text"
    assert record["page_count"] == 2
