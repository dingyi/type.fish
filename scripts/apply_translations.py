#!/usr/bin/env python3
"""Apply English translations to description fields in foundries.ts."""
import json
import re
import sys
from pathlib import Path

base = Path(__file__).resolve().parent
translations = json.loads((base / "translations.json").read_text(encoding="utf-8"))
foundries = base.parent / "src" / "data" / "foundries.ts"
text = foundries.read_text(encoding="utf-8")

# Find all CJK-containing descriptions still in the file
cjk_descs = set()
for m in re.finditer(r'description:\s*"([^"]+)"', text):
    val = m.group(1)
    if any("\u4e00" <= ch <= "\u9fff" for ch in val):
        cjk_descs.add(val)

missing = [d for d in cjk_descs if d not in translations]
if missing:
    print("ERROR — descriptions without translations:", file=sys.stderr)
    for d in missing:
        print(f"  {d}", file=sys.stderr)
    sys.exit(1)

# Escape for safe replacement inside a JS double-quoted string
def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')

count = 0
def repl(match):
    global count
    val = match.group(1)
    if val in translations:
        count += 1
        return f'description: "{js_escape(translations[val])}"'
    return match.group(0)

new_text = re.sub(r'description:\s*"([^"]+)"', repl, text)
foundries.write_text(new_text, encoding="utf-8")
print(f"Replaced {count} description instances using {len(cjk_descs)} unique translations.")
