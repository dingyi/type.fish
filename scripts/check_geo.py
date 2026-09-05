#!/usr/bin/env python3
"""Verify the built GEO crawlability contract for type.fish."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def main() -> int:
    failures: list[str] = []
    typefaces_page = DIST / "typefaces" / "index.html"
    open_source_page = DIST / "typefaces" / "open-source" / "index.html"
    home_page = DIST / "index.html"

    require(typefaces_page.exists(), "missing built /typefaces/ page", failures)
    require(
        open_source_page.exists(),
        "missing built /typefaces/open-source/ page",
        failures,
    )
    require((DIST / "llms.txt").exists(), "missing built /llms.txt", failures)

    if typefaces_page.exists():
        typefaces_html = typefaces_page.read_text(encoding="utf-8")
        require(
            typefaces_page.stat().st_size < 1_000_000,
            "/typefaces/ HTML exceeds the 1 MB crawlability budget",
            failures,
        )
        require(
            typefaces_html.count("<h3") >= 12,
            "/typefaces/ lacks server-rendered catalogue entries",
            failures,
        )

    if open_source_page.exists():
        open_source_html = open_source_page.read_text(encoding="utf-8")
        require(
            open_source_page.stat().st_size < 1_000_000,
            "/typefaces/open-source/ HTML exceeds the 1 MB crawlability budget",
            failures,
        )
        require(
            open_source_html.count("<h3") >= 12,
            "/typefaces/open-source/ lacks server-rendered catalogue entries",
            failures,
        )
        require(
            "Open Source Typefaces" in open_source_html,
            "open-source page lacks its static definition and heading",
            failures,
        )
        require(
            'rel="canonical" href="https://type.fish/typefaces/open-source/"'
            in open_source_html,
            "open-source page has an unexpected canonical URL",
            failures,
        )

    if home_page.exists():
        home_html = home_page.read_text(encoding="utf-8")
        require(
            home_page.stat().st_size < 1_000_000,
            "homepage HTML exceeds the 1 MB crawlability budget",
            failures,
        )
        require(
            "type.fish is an open directory of type foundries" in home_html,
            "homepage lacks the canonical type.fish definition",
            failures,
        )
        require(
            "SearchAction" not in home_html,
            "homepage advertises a non-functional structured-data search action",
            failures,
        )

    typefaces = json.loads(
        (ROOT / "public" / "data" / "typefaces.json").read_text(encoding="utf-8")
    )
    if typefaces:
        sample_page = DIST / "typefaces" / typefaces[0]["id"] / "index.html"
        require(sample_page.exists(), "missing sample typeface detail page", failures)
        if sample_page.exists():
            sample_html = sample_page.read_text(encoding="utf-8")
            require(
                '"inLanguage"' not in sample_html,
                "typeface schema incorrectly describes writing systems as languages",
                failures,
            )
            require(
                "Writing system" in sample_html,
                "typeface schema lacks writing-system properties",
                failures,
            )

    sitemap = (ROOT / "public" / "sitemap-static.xml").read_text(
        encoding="utf-8"
    )
    require(
        "https://type.fish/typefaces/open-source" in sitemap,
        "sitemap omits /typefaces/open-source",
        failures,
    )

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    print("GEO build checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
