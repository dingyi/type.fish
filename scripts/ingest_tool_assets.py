#!/usr/bin/env python3
"""
Fetch each font tool's favicon and extract a representative brand color from it,
for the /tools card list. Mirrors ingest_foundry_assets.py.

Favicon sources are tried in order until one yields a usable image:
    1. DuckDuckGo  — https://icons.duckduckgo.com/ip3/{host}.ico
    2. Vemetric    — https://favicon.vemetric.com/{host}
Vemetric often returns SVGs, which are rasterized to PNG via cairosvg.

Outputs (committed to git, like ingest_foundry_assets.py):
    public/tool-favicons/<slug>.png       — one favicon per tool that yielded one
    public/data/tool-assets.json          — { "<slug>": { "color": "#rrggbb", "favicon": "/tool-favicons/<slug>.png" } }

Only tools that produced a usable favicon *and* a non-trivial color end up in
the JSON map. The rest render without a favicon chip in the UI.

Usage:
    python3 scripts/ingest_tool_assets.py

Requires Pillow (color extraction) and cairosvg (SVG rasterization):
    pip install Pillow cairosvg
cairosvg also needs the system libcairo (brew install cairo on macOS).

Idempotent: if public/tool-favicons/<slug>.png already exists it is reused (the
favicon is not re-fetched), but colors are always recomputed (cheap). Delete
the file to force a re-fetch.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit(
        "Pillow is required for color extraction. Install it with:\n"
        "    pip install Pillow"
    )

try:
    import cairosvg
except ImportError:  # pragma: no cover
    cairosvg = None  # SVG favicons will be skipped if unavailable

# Favicon sources, tried in order. {host} is the bare hostname.
FAVICON_SOURCES = [
    "https://icons.duckduckgo.com/ip3/{host}.ico",
    "https://favicon.vemetric.com/{host}",
]
TIMEOUT = 8
# Favicons smaller than this (in bytes) are almost certainly a 1x1 placeholder or
# an error stub — treat them as "no favicon".
MIN_FAVICON_BYTES = 200

ROOT = Path(__file__).resolve().parent.parent
SRC_TOOLS = ROOT / "src" / "data" / "tools.ts"
OUT_FAVICON_DIR = ROOT / "public" / "tool-favicons"
OUT_JSON = ROOT / "public" / "data" / "tool-assets.json"


def parse_local_tools() -> list[dict]:
    """Read src/data/tools.ts and return [{slug, name, website}, ...]."""
    text = SRC_TOOLS.read_text(encoding="utf-8")
    blocks = re.findall(r"\{([^{}]*?)\}", text)
    tools: list[dict] = []
    for block in blocks:
        slug_m = re.search(r'slug:\s*"([a-z0-9-]+)"', block)
        if not slug_m:
            continue
        name_m = re.search(r'name:\s*"((?:[^"\\]|\\.)*)"', block)
        website_m = re.search(r'website:\s*"((?:[^"\\]|\\.)*)"', block)
        if not website_m:
            continue
        tools.append(
            {
                "slug": slug_m.group(1),
                "name": name_m.group(1) if name_m else "",
                "website": website_m.group(1),
            }
        )
    return tools


def host_of(website: str) -> str | None:
    """website carries a scheme in tools.ts (e.g. 'https://fontba.se/')."""
    return urllib.parse.urlparse(website).hostname


def _download(url: str) -> tuple[bytes, str] | None:
    """GET a favicon URL with one retry. Returns (data, content_type) or None."""
    req = urllib.request.Request(url, headers={"User-Agent": "type.fish/ingest"})
    for _attempt in (0, 1):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:  # noqa: S310
                data = resp.read()
            if len(data) >= MIN_FAVICON_BYTES:
                return data, resp.headers.get("content-type", "")
        except Exception:
            continue
    return None


def _save_png(slug: str, data: bytes, content_type: str) -> Path | None:
    """Write favicon bytes to public/tool-favicons/<slug>.png, rasterizing SVG first."""
    dest = OUT_FAVICON_DIR / f"{slug}.png"
    head = data[:512].lstrip()
    is_svg = "svg" in content_type or head.startswith(b"<?xml") or b"<svg" in head
    try:
        if is_svg:
            if cairosvg is None:
                return None  # can't rasterize SVG without cairosvg
            data = cairosvg.svg2png(  # type: ignore[union-attr]
                bytestring=data, output_width=128, output_height=128
            )
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        # Verify it's a real image Pillow can open (rejects corrupt/stub data).
        Image.open(dest).verify()
        return dest
    except Exception:
        if dest.exists():
            dest.unlink()
        return None


def fetch_favicon(tool: dict) -> tuple[str, Path | None]:
    """Download favicon if not cached. Returns (slug, png_path_or_None)."""
    slug = tool["slug"]
    host = host_of(tool["website"])
    if not host:
        return slug, None

    dest = OUT_FAVICON_DIR / f"{slug}.png"
    if dest.exists() and dest.stat().st_size >= MIN_FAVICON_BYTES:
        return slug, dest

    for source in FAVICON_SOURCES:
        result = _download(source.format(host=host))
        if result is None:
            continue
        data, content_type = result
        saved = _save_png(slug, data, content_type)
        if saved is not None:
            return slug, saved
    return slug, None


def extract_color(png: Path) -> str | None:
    """
    Most frequent pixel color in the favicon as #rrggbb — this matches the
    favicon's own background so a colored chip blends into the favicon.
    Colors are quantized (each channel bucketed to a multiple of 16) so that
    near-white / near-gray variants collapse into one dominant bucket instead
    of splitting the vote. Transparent pixels are ignored (they aren't the
    background). Returns None if the image can't be read or is fully transparent.
    """
    try:
        img = Image.open(png).convert("RGBA").resize((32, 32))
    except Exception:
        return None

    counter: Counter[tuple[int, int, int]] = Counter()
    for r, g, b, a in img.getdata():
        if a < 128:
            continue
        # Quantize each channel to a 16-step bucket so similar colors merge.
        bucket = ((r // 16) * 16, (g // 16) * 16, (b // 16) * 16)
        counter[bucket] += 1

    if not counter:
        return None
    r, g, b = counter.most_common(1)[0][0]
    # Use the center of the bucket as the representative color.
    return f"#{r + 8:02x}{g + 8:02x}{b + 8:02x}"


def main() -> int:
    tool_list = parse_local_tools()
    print(f"Parsed {len(tool_list)} tools from {SRC_TOOLS.name}", file=sys.stderr)
    OUT_FAVICON_DIR.mkdir(parents=True, exist_ok=True)

    assets: dict[str, dict] = {}
    fetched = colored = failed = 0
    pngs: dict[str, Path] = {}

    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_favicon, t): t for t in tool_list}
        for fut in as_completed(futures):
            slug, png = fut.result()
            if png is None:
                failed += 1
                continue
            fetched += 1
            pngs[slug] = png

    # Deterministic output order: follow the source file's tool order.
    for tool in tool_list:
        png = pngs.get(tool["slug"])
        if png is None:
            continue
        color = extract_color(png)
        if color:
            colored += 1
            assets[tool["slug"]] = {
                "color": color,
                "favicon": f"/tool-favicons/{png.name}",
            }

    OUT_JSON.write_text(
        json.dumps(assets, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )

    print(
        f"\nDone. favicons fetched: {fetched} (failed: {failed}), "
        f"with color: {colored} -> {OUT_JSON.relative_to(ROOT)}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
