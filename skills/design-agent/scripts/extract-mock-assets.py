#!/usr/bin/env python3
"""
extract-mock-assets — walk a JSON file for URL-shaped strings, download every
unique URL to <out-dir>, emit a manifest mapping (url, sibling-name) → local file.

Generic. Knows nothing about any specific schema. Works for any mock JSON,
API capture, or content payload that contains image/icon URLs as strings.

Usage:
    extract-mock-assets.py <json-path> <out-dir>
    extract-mock-assets.py <json-path> <out-dir> --field-keys image_url,icon_url,image
    extract-mock-assets.py <json-path> <out-dir> --dry-run

The script:
1. Loads the JSON.
2. Walks every nested dict/list looking for string values that look like URLs
   (http:// or https://) ending in image extensions, OR (if --field-keys is
   given) string values under any of those exact keys regardless of extension.
3. For each unique URL, derives a stable local filename. Preference order:
   a. A sibling string under one of the "name" keys (header, name, title,
      display_name) — slugified.
   b. The basename of the URL (with extension forced to .png if absent).
4. Downloads each unique URL to <out-dir>, skipping any already present.
5. Writes <out-dir>/manifest.json: { semantic_name: relative_path, ... }.

Exit codes: 0 on success, non-zero if any download failed.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
DEFAULT_FIELD_KEYS = {"image_url", "icon_url", "image", "icon", "img", "url"}
NAME_KEYS = ("header", "name", "title", "display_name", "label", "key", "id")


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower())
    return text.strip("-") or "asset"


def looks_like_image_url(value: str) -> bool:
    if not isinstance(value, str):
        return False
    if not value.startswith(("http://", "https://")):
        return False
    parsed = urllib.parse.urlparse(value)
    path = urllib.parse.unquote(parsed.path)
    suffix = Path(path).suffix.lower()
    return suffix in IMAGE_EXT


def derive_name(url: str, sibling_dict: dict | None) -> str:
    if sibling_dict:
        for key in NAME_KEYS:
            val = sibling_dict.get(key)
            if isinstance(val, str) and val:
                return slugify(val)
    parsed = urllib.parse.urlparse(url)
    path = urllib.parse.unquote(parsed.path)
    base = Path(path).stem
    return slugify(base) if base else "asset"


def find_assets(node, field_keys: set[str], parent: dict | None = None):
    """Yield (url, parent_dict) for every URL-shaped value found."""
    if isinstance(node, dict):
        for key, value in node.items():
            if isinstance(value, str):
                if key in field_keys and value.startswith(("http://", "https://")):
                    yield value, node
                elif looks_like_image_url(value):
                    yield value, node
            else:
                yield from find_assets(value, field_keys, node)
    elif isinstance(node, list):
        for item in node:
            yield from find_assets(item, field_keys, parent)


def download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "extract-mock-assets/1.0"})
        with urllib.request.urlopen(req, timeout=30) as response:
            dest.write_bytes(response.read())
        return True
    except Exception as exc:
        print(f"  ! download failed: {url} — {exc}", file=sys.stderr)
        return False


def ensure_extension(name: str, url: str) -> str:
    if Path(name).suffix:
        return name
    parsed = urllib.parse.urlparse(url)
    suffix = Path(urllib.parse.unquote(parsed.path)).suffix.lower()
    if suffix in IMAGE_EXT:
        return f"{name}{suffix}"
    return f"{name}.png"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("json_path", type=Path)
    parser.add_argument("out_dir", type=Path)
    parser.add_argument(
        "--field-keys",
        default=",".join(sorted(DEFAULT_FIELD_KEYS)),
        help="comma-separated list of dict keys whose string values should be treated as URLs even without an image extension",
    )
    parser.add_argument("--dry-run", action="store_true", help="don't download, just report what would happen")
    args = parser.parse_args(argv)

    if not args.json_path.is_file():
        print(f"error: {args.json_path} not found", file=sys.stderr)
        return 2

    field_keys = {k.strip() for k in args.field_keys.split(",") if k.strip()}
    args.out_dir.mkdir(parents=True, exist_ok=True)

    with args.json_path.open() as f:
        data = json.load(f)

    seen_urls: dict[str, str] = {}  # url -> filename
    manifest: dict[str, str] = {}   # semantic_name -> relative path
    name_collisions: dict[str, int] = {}

    for url, parent in find_assets(data, field_keys):
        if url in seen_urls:
            continue
        base_name = derive_name(url, parent)
        filename = ensure_extension(base_name, url)
        # Disambiguate collisions
        if filename in name_collisions:
            name_collisions[filename] += 1
            stem, suffix = Path(filename).stem, Path(filename).suffix
            filename = f"{stem}-{name_collisions[Path(filename).name]}{suffix}"
        else:
            name_collisions[filename] = 1
        seen_urls[url] = filename
        manifest[Path(filename).stem] = f"./{filename}"

    print(f"discovered {len(seen_urls)} unique assets")

    failures = 0
    for url, filename in seen_urls.items():
        dest = args.out_dir / filename
        if dest.exists():
            print(f"  - skip (exists): {filename}")
            continue
        if args.dry_run:
            print(f"  - would download: {filename}  <-  {url}")
            continue
        print(f"  - download: {filename}")
        if not download(url, dest):
            failures += 1

    if not args.dry_run:
        manifest_path = args.out_dir / "manifest.json"
        manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
        print(f"wrote {manifest_path}")

    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
