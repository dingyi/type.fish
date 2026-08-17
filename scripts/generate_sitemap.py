#!/usr/bin/env python3
"""
Generate sitemap-index.xml + per-type sitemaps for type.fish.

Reads the same data sources the Astro pages use (foundries.ts, designers.ts,
public/data/typefaces.json) and emits XML into public/. Run after
ingest_typefaces.py.

    python3 scripts/generate_sitemap.py
"""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SITE = "https://type.fish"
TODAY = date.today().isoformat()

# Sitemaps are sharded to keep each file small and queryable in Search Console.
# Google's limits (50k URLs / 50MB uncompressed) are nowhere near hit, but
# per-type shards make coverage reports far easier to read.
MAX_PER_SITEMAP = 10000


def slugify_name(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")


def parse_foundry_ids() -> list[str]:
    text = (ROOT / "src" / "data" / "foundries.ts").read_text(encoding="utf-8")
    ids = re.findall(r"id:\s*(\d+),", text)
    return sorted(ids, key=int)


def parse_designer_names() -> list[str]:
    text = (ROOT / "src" / "data" / "designers.ts").read_text(encoding="utf-8")
    names = re.findall(r'name:\s*"((?:[^"\\]|\\.)*)"', text)
    # The interface field doc may match; it equals the literal "name".
    return [n for n in names if n != "name"]


def parse_typeface_ids() -> list[str]:
    data = json.loads((PUBLIC / "data" / "typefaces.json").read_text(encoding="utf-8"))
    return [t["id"] for t in data if t.get("id")]


def write_urlset(path: Path, urls: list[str]) -> None:
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )
    for u in urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(u)}</loc>")
        lines.append(f"    <lastmod>{TODAY}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    # Static top-level pages (noindex pages like /submit are intentionally excluded).
    static = [f"{SITE}/", f"{SITE}/typefaces", f"{SITE}/designers", f"{SITE}/tools", f"{SITE}/about"]

    foundries = [f"{SITE}/foundries/{i}" for i in parse_foundry_ids()]
    designers = [f"{SITE}/designers/{slugify_name(n)}" for n in parse_designer_names()]
    typefaces = [f"{SITE}/typefaces/{i}" for i in parse_typeface_ids()]

    shards: list[tuple[str, list[str]]] = [
        ("sitemap-static", static),
        ("sitemap-foundries", foundries),
        ("sitemap-designers", designers),
    ]
    # Typefaces is the only list big enough to potentially shard.
    for i in range(0, len(typefaces), MAX_PER_SITEMAP):
        chunk = typefaces[i : i + MAX_PER_SITEMAP]
        shard_name = (
            "sitemap-typefaces"
            if i == 0 and len(chunk) <= MAX_PER_SITEMAP and i + MAX_PER_SITEMAP >= len(typefaces)
            else f"sitemap-typefaces-{i // MAX_PER_SITEMAP + 1}"
        )
        shards.append((shard_name, chunk))

    print(f"  static:    {len(static)}", flush=True)
    print(f"  foundries: {len(foundries)}", flush=True)
    print(f"  designers: {len(designers)}", flush=True)
    print(f"  typefaces: {len(typefaces)}", flush=True)

    total = 0
    written: list[str] = []
    for name, urls in shards:
        write_urlset(PUBLIC / f"{name}.xml", urls)
        written.append(name)
        total += len(urls)

    # Index
    index = ['<?xml version="1.0" encoding="UTF-8"?>']
    index.append(
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )
    for name in written:
        index.append("  <sitemap>")
        index.append(f"    <loc>{SITE}/{name}.xml</loc>")
        index.append(f"    <lastmod>{TODAY}</lastmod>")
        index.append("  </sitemap>")
    index.append("</sitemapindex>")
    (PUBLIC / "sitemap-index.xml").write_text("\n".join(index) + "\n", encoding="utf-8")

    print(f"  total URLs: {total} across {len(written)} sitemaps", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
