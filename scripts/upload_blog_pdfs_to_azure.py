#!/usr/bin/env python3
"""Upload selected blog PDFs to the production Azure Blob container."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BLOGS_FILE = PROJECT_ROOT / "data" / "source" / "blogs.json"
DEFAULT_IDS = (15, 17)


def read_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.removeprefix("export ").split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def selected_blogs(ids: set[int]) -> list[dict]:
    blogs = json.loads(BLOGS_FILE.read_text(encoding="utf-8"))
    selected = [blog for blog in blogs if int(blog.get("id", -1)) in ids]
    missing = ids.difference(int(blog["id"]) for blog in selected)
    if missing:
        raise RuntimeError(f"Missing blog IDs: {', '.join(map(str, sorted(missing)))}")
    for blog in selected:
        required = ("asset_url", "blob_key", "content_type", "size_bytes")
        if any(not blog.get(field) for field in required):
            raise RuntimeError(f"Blog {blog['id']} is missing Azure metadata")
    return selected


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", required=True, type=Path, help="Production .env file")
    parser.add_argument("--ids", nargs="+", type=int, default=list(DEFAULT_IDS))
    parser.add_argument("--interactive", action="store_true", help="Open Microsoft sign-in when no account key is configured")
    parser.add_argument("--apply", action="store_true", help="Upload files; otherwise show a dry run")
    args = parser.parse_args()

    env = read_env(args.env_file.expanduser().resolve())
    account_url = env.get("AZURE_STORAGE_ACCOUNT_URL", "")
    container = env.get("AZURE_STORAGE_CONTAINER", "")
    site_slug = env.get("DEFAULT_SITE_SLUG", "sanjay-portfolio")
    if not account_url or not container:
        raise RuntimeError("AZURE_STORAGE_ACCOUNT_URL and AZURE_STORAGE_CONTAINER are required")

    blogs = selected_blogs(set(args.ids))
    uploads = []
    for blog in blogs:
        source = PROJECT_ROOT / "public" / str(blog["asset_url"]).lstrip("/")
        if not source.is_file() or source.stat().st_size != int(blog["size_bytes"]):
            raise RuntimeError(f"Local PDF is missing or has changed: {source}")
        uploads.append((blog, source, f"sites/{site_slug}/{blog['blob_key']}"))
        print(f"blog:{blog['id']} -> {container}/{uploads[-1][2]}")

    if not args.apply:
        print("Dry run only. Add --apply to upload.")
        return 0

    from azure.identity import DefaultAzureCredential, InteractiveBrowserCredential
    from azure.storage.blob import BlobServiceClient, ContentSettings

    account_key = env.get("AZURE_STORAGE_ACCOUNT_KEY", "")
    credential = account_key or (InteractiveBrowserCredential() if args.interactive else DefaultAzureCredential())
    service = BlobServiceClient(account_url, credential=credential)
    for blog, source, object_key in uploads:
        client = service.get_blob_client(container=container, blob=object_key)
        with source.open("rb") as content:
            client.upload_blob(
                content,
                overwrite=True,
                content_settings=ContentSettings(content_type=str(blog["content_type"])),
            )
        properties = client.get_blob_properties()
        if properties.size != source.stat().st_size:
            raise RuntimeError(f"Azure size verification failed for blog {blog['id']}")
        print(f"Uploaded and verified blog:{blog['id']} ({properties.size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
