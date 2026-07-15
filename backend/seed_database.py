"""Preview or apply the checked-in portfolio data to an empty PostgreSQL database."""
import argparse
import json
from pathlib import Path

from settings import settings
from storage import Store


BASE_DIR = Path(__file__).parent
SOURCES = {
    "application": BASE_DIR / "database.json",
    "content:blogs.json": BASE_DIR / "content" / "blogs.json",
    "content:projects.json": BASE_DIR / "content" / "projects.json",
}


def prepared_value(key: str, path: Path):
    value = json.loads(path.read_text())
    if key == "application":
        for user in value.get("users", []):
            if user.get("phone") == settings.admin_phone:
                user["role"] = "admin"
                user["access"] = ["admin", "candidate", "recruiter"]
            else:
                user.setdefault("role", "member")
                user.setdefault("access", [])
    return value


def describe(key: str, value) -> str:
    if key == "application":
        return f"{len(value.get('users', []))} users, {len(value.get('submissions', []))} submissions, {len(value.get('interactions', {}))} interaction records"
    return f"{len(value)} records"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write data. Without this flag the command is a dry run.")
    parser.add_argument("--force", action="store_true", help="Replace existing state. Use only with an intentional backup/rollback plan.")
    args = parser.parse_args()
    if settings.database_url.startswith("sqlite"):
        raise SystemExit("Refusing to run: DATABASE_URL still points to SQLite.")

    store = Store(settings.database_url)
    for key, path in SOURCES.items():
        value = prepared_value(key, path)
        existing = store.get_json(key, None)
        action = "replace" if existing is not None else "insert"
        print(f"{key}: {action} {describe(key, value)}")
        if args.apply:
            if existing is not None and not args.force:
                raise SystemExit(f"Refusing to replace existing '{key}'. Back up first, then pass --force intentionally.")
            store.put_json(key, value)

    print("Data migration applied." if args.apply else "Dry run only. Re-run with --apply after reviewing the counts.")


if __name__ == "__main__":
    main()
