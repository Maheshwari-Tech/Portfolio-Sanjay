#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$ROOT_DIR/public/Sanjay_Gandhi_Resume.tex"
OUTPUT="$ROOT_DIR/public/Sanjay_Gandhi_Resume.pdf"
TEMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/sanjay-resume.XXXXXX")"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

if ! command -v tectonic >/dev/null 2>&1; then
  echo "Tectonic is required. On macOS, install it with: brew install tectonic" >&2
  exit 1
fi

tectonic --outdir "$TEMP_DIR" "$SOURCE"

GENERATED="$TEMP_DIR/Sanjay_Gandhi_Resume.pdf"
if [[ ! -s "$GENERATED" ]]; then
  echo "Resume compilation completed without producing a PDF." >&2
  exit 1
fi

cp "$GENERATED" "$OUTPUT"
echo "Generated $OUTPUT"
