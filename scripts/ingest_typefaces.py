#!/usr/bin/env python3
"""
Ingest typefaces from type.lol (Supabase PostgREST) and join the open-source
flag from Google Fonts metadata. Emits src/data/typefaces.ts plus a small
accessory src/data/index_maps.ts (foundry -> typeface ids, designer -> typeface
ids) so detail pages can resolve relations by identity without runtime joins.

See docs/adr/0001-*.md (sources) and 0002-*.md (identity relations).

Usage:
    TYPE_LOL_KEY=sb_publishable_... python3 scripts/ingest_typefaces.py

Both sources are public. type.lol requires the publishable key (it is also
embedded in type.lol's front-end bundle, so it is not secret). Google Fonts
metadata is keyless.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

API = "https://api.type.lol/rest/v1"
KEY = os.environ.get("TYPE_LOL_KEY", "sb_publishable_WNBdfMpMq_1naV0JdIWCbw_enN2uwqK")
GF_META = "https://fonts.google.com/metadata/fonts"

ROOT = Path(__file__).resolve().parent.parent
OUT_TYPEFACES_JSON = ROOT / "public" / "data" / "typefaces.json"
OUT_MAPS_JSON = ROOT / "public" / "data" / "index-maps.json"
OUT_BRIDGE_TS = ROOT / "src" / "data" / "foundry-bridge.ts"

# Only import typefaces rich enough to be worth a detail page. Bare-id stubs
# (no description, no classification, no preview) add noise without value.
# status=active AND (has description OR has classification OR has preview).
TYPEFACE_FILTER = (
    "status=eq.active"
    "&or=(description.not.is.null,primary_classification.not.is.null,preview_image.not.is.null)"
)
TYPEFACE_SELECT = (
    "id,name,foundry_id,credits,primary_classification,description,preview_image,"
    "specimen_url,release_year,is_variable,has_italic,url,language_support,variants"
)


def api_get(path: str, select: str, extra: str = "") -> list[dict]:
    """Paginated PostgREST GET."""
    rows: list[dict] = []
    offset = 0
    page = 1000
    headers = {"apikey": KEY, "Accept": "application/json"}
    while True:
        rng = f"{offset}-{offset + page - 1}"
        url = f"{API}/{path}?select={select}&{extra}"
        req = urllib.request.Request(url, headers={**headers, "Range": rng})
        with urllib.request.urlopen(req, timeout=60) as r:
            chunk = json.loads(r.read().decode())
        rows.extend(chunk)
        if len(chunk) < page:
            break
        offset += page
    return rows


def gf_get() -> dict[str, dict]:
    """Google Fonts metadata -> {lowercased family: {...}}. Keyless."""
    req = urllib.request.Request(GF_META, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        # Google prepends an XSSI guard )]}' — strip it.
        raw = r.read().decode().lstrip()
        raw = raw[raw.index("{") :] if raw.startswith(")") else raw
        data = json.loads(raw)
    return {
        fam["family"].strip().lower(): fam
        for fam in data.get("familyMetadataList", [])
        if fam.get("isOpenSource")
    }


def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)  # drop punctuation (em-dashes etc.)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")


def fmt_str(s: str | None) -> str:
    if s is None:
        return "null"
    return json.dumps(s, ensure_ascii=False)


def fmt_arr(items: list[str] | None) -> str:
    if not items:
        return "[]"
    inner = ", ".join(fmt_str(i) for i in items)
    return f"[{inner}]"


def main() -> int:
    if not KEY:
        print("TYPE_LOL_KEY not set", file=sys.stderr)
        return 1

    print("Fetching typefaces from type.lol...", file=sys.stderr)
    raw = api_get("typefaces", TYPEFACE_SELECT, TYPEFACE_FILTER)
    print(f"  {len(raw)} typefaces match the richness filter", file=sys.stderr)

    print("Fetching open-source families from Google Fonts...", file=sys.stderr)
    ofl = gf_get()
    print(f"  {len(ofl)} OFL families", file=sys.stderr)

    # Build open-source lookup keyed on normalised family name.
    typefaces: list[dict] = []
    by_foundry: dict[str, list[str]] = {}
    by_designer: dict[str, list[str]] = {}
    seen_ids: set[str] = set()

    for t in raw:
        tid = t.get("id")
        name = t.get("name") or ""
        fid = t.get("foundry_id")
        if not tid or not name or not fid:
            continue
        if tid in seen_ids:
            continue
        seen_ids.add(tid)

        is_open = name.strip().lower() in ofl
        classification = t.get("primary_classification") or "other"
        langs = (t.get("language_support") or {}).get("scripts") or []
        credits = t.get("credits") or []
        designer_ids = [c["designerId"] for c in credits if c.get("designerId")]

        typefaces.append(
            {
                "id": tid,
                "name": name,
                "foundryId": fid,
                "designerIds": sorted(set(designer_ids)),
                "classification": classification,
                "description": t.get("description"),
                "previewImage": t.get("preview_image"),
                "specimenUrl": t.get("specimen_url") or t.get("url"),
                "releaseYear": t.get("release_year"),
                "isVariable": bool(t.get("is_variable")),
                "hasItalic": bool(t.get("has_italic")),
                "scripts": langs,
                "isOpenSource": is_open,
            }
        )
        by_foundry.setdefault(fid, []).append(tid)
        for did in designer_ids:
            by_designer.setdefault(did, []).append(tid)

    typefaces.sort(key=lambda x: x["name"].lower())

    print(f"  {len(typefaces)} typefaces emitted", file=sys.stderr)
    print(
        f"  {sum(1 for t in typefaces if t['isOpenSource'])} flagged open-source",
        file=sys.stderr,
    )

    write_typefaces(typefaces)
    write_maps(by_foundry, by_designer)

    print("Building foundry bridge (local id <-> type.lol slug)...", file=sys.stderr)
    write_bridge()

    print("Done.", file=sys.stderr)
    return 0


def parse_local_foundries() -> list[tuple[str, str]]:
    """Return [(id, name)] from src/data/foundries.ts. Order is preserved."""
    src = ROOT / "src" / "data" / "foundries.ts"
    text = src.read_text(encoding="utf-8")
    # Each record is `{ id: N, name: "...", ... }`. Pull id+name pairs in order.
    pairs = re.findall(r'id:\s*(\d+),\s*name:\s*"((?:[^"\\]|\\.)*)"', text)
    return [(i, n) for i, n in pairs]


def parse_local_designers() -> list[str]:
    """Return designer names from src/data/designers.ts."""
    src = ROOT / "src" / "data" / "designers.ts"
    text = src.read_text(encoding="utf-8")
    names = re.findall(r'name:\s*"((?:[^"\\]|\\.)*)"', text)
    # First match is the interface field doc; skip if it equals "name".
    return [n for n in names if n != "name"]


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def write_bridge() -> None:
    """Match local foundries/designers to type.lol slugs by normalised name.

    Emits a TS module that the detail pages use to translate between the local
    numeric foundry id and the type.lol slug identity the typeface data uses.
    """
    # type.lol slug -> name, for both entities.
    tl_foundries = {f["id"]: f["name"] for f in api_get("foundries", "id,name")}
    tl_designers = {d["id"]: d["name"] for d in api_get("designers", "id,name")}
    tl_f_by_norm = {norm(n): slug for slug, n in tl_foundries.items()}
    tl_d_by_norm = {norm(n): slug for slug, n in tl_designers.items()}

    # Local numeric id -> type.lol slug.
    local_foundries = parse_local_foundries()
    id_to_slug: list[tuple[str, str]] = []
    matched_foundries = 0
    for local_id, name in local_foundries:
        slug = tl_f_by_norm.get(norm(name))
        if slug:
            id_to_slug.append((local_id, slug))
            matched_foundries += 1

    # Local designer name -> type.lol slug. Dedupe by name — designers.ts has a
    # handful of duplicate entries (same person listed twice), and a TS object
    # literal with duplicate keys is a hard error.
    local_designers = parse_local_designers()
    seen_designer_names: set[str] = set()
    name_to_slug: list[tuple[str, str]] = []
    matched_designers = 0
    dup_count = 0
    for name in local_designers:
        if name in seen_designer_names:
            dup_count += 1
            continue
        seen_designer_names.add(name)
        slug = tl_d_by_norm.get(norm(name))
        if slug:
            name_to_slug.append((name, slug))
            matched_designers += 1
    if dup_count:
        print(f"  skipped {dup_count} duplicate designer names", file=sys.stderr)

    print(
        f"  foundries: {matched_foundries}/{len(local_foundries)} matched",
        file=sys.stderr,
    )
    print(
        f"  designers: {matched_designers}/{len(local_designers)} matched",
        file=sys.stderr,
    )

    lines: list[str] = []
    lines.append("// AUTO-GENERATED by scripts/ingest_typefaces.py — do not edit by hand.")
    lines.append(
        "// Maps the local catalogue (numeric foundry ids, designer names) to"
    )
    lines.append("// the type.lol slug identity the typeface data uses.")
    lines.append("// See docs/adr/0001-type-lol-as-sole-source.md (two-snapshot join).")
    lines.append("")
    lines.append("/** Local numeric foundry id -> type.lol foundry slug. */")
    lines.append("export const foundrySlugByLocalId: Record<number, string> = {")
    for local_id, slug in id_to_slug:
        lines.append(f"  {local_id}: {fmt_str(slug)},")
    lines.append("};")
    lines.append("")
    lines.append("/** type.lol foundry slug -> local numeric id. */")
    lines.append("export const localIdByFoundrySlug: Record<string, number> = {")
    for local_id, slug in id_to_slug:
        lines.append(f"  {fmt_str(slug)}: {local_id},")
    lines.append("};")
    lines.append("")
    lines.append("/** Local designer name -> type.lol designer slug. */")
    lines.append("export const designerSlugByName: Record<string, string> = {")
    for name, slug in name_to_slug:
        lines.append(f"  {fmt_str(name)}: {fmt_str(slug)},")
    lines.append("};")
    lines.append("")
    OUT_BRIDGE_TS.parent.mkdir(parents=True, exist_ok=True)
    OUT_BRIDGE_TS.write_text("\n".join(lines), encoding="utf-8")


def write_typefaces(typefaces: list[dict]) -> None:
    # Emit JSON, not TS — 8MB of data should be lazy-loaded on the /typefaces
    # route, not bundled into every visitor's initial download. A thin TS
    # wrapper in src/data/typefaces.ts types + fetches this on demand.
    OUT_TYPEFACES_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_TYPEFACES_JSON.write_text(
        json.dumps(typefaces, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def write_maps(by_foundry: dict[str, list[str]], by_designer: dict[str, list[str]]) -> None:
    OUT_MAPS_JSON.write_text(
        json.dumps(
            {
                "byFoundry": {k: sorted(set(v)) for k, v in by_foundry.items()},
                "byDesigner": {k: sorted(set(v)) for k, v in by_designer.items()},
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )


if __name__ == "__main__":
    raise SystemExit(main())
