#!/usr/bin/env python3
"""
Transform country fields in foundries.ts and designers.ts from Chinese to English.
Leaves English descriptions to a separate pass.

Strategy:
- Replace `country: "<cn>"` with `country: "<en>"` using a fixed mapping table.
- Compound countries like "德国/巴西" become "Germany / Brazil".
- "未知" becomes "Unknown".
- Normalizes existing English variants ("The Netherlands" -> "Netherlands", etc.)
"""
import re
import sys
from pathlib import Path

# Chinese -> English country name. English names chosen to match ISO common names
# so they pair naturally with flag icons.
CN_TO_EN = {
    "中国": "China",
    "美国": "United States",
    "德国": "Germany",
    "法国": "France",
    "英国": "United Kingdom",
    "荷兰": "Netherlands",
    "瑞士": "Switzerland",
    "西班牙": "Spain",
    "意大利": "Italy",
    "印尼": "Indonesia",
    "捷克": "Czechia",
    "加拿大": "Canada",
    "阿根廷": "Argentina",
    "瑞典": "Sweden",
    "巴西": "Brazil",
    "奥地利": "Austria",
    "日本": "Japan",
    "韩国": "South Korea",
    "葡萄牙": "Portugal",
    "印度": "India",
    "芬兰": "Finland",
    "土耳其": "Turkey",
    "挪威": "Norway",
    "波兰": "Poland",
    "澳大利亚": "Australia",
    "俄罗斯": "Russia",
    "台湾": "Taiwan",
    "墨西哥": "Mexico",
    "爱沙尼亚": "Estonia",
    "越南": "Vietnam",
    "乌克兰": "Ukraine",
    "哥伦比亚": "Colombia",
    "埃及": "Egypt",
    "比利时": "Belgium",
    "保加利亚": "Bulgaria",
    "斯洛伐克": "Slovakia",
    "匈牙利": "Hungary",
    "智利": "Chile",
    "丹麦": "Denmark",
    "尼日利亚": "Nigeria",
    "拉脱维亚": "Latvia",
    "泰国": "Thailand",
    "新加坡": "Singapore",
    "罗马尼亚": "Romania",
    "新西兰": "New Zealand",
    "斯洛文尼亚": "Slovenia",
    "爱尔兰": "Ireland",
    "塞尔维亚": "Serbia",
    "加纳": "Ghana",
    "柬埔寨": "Cambodia",
    "希腊": "Greece",
    "立陶宛": "Lithuania",
    "阿联酋": "United Arab Emirates",
    "埃塞俄比亚": "Ethiopia",
    "伊朗": "Iran",
    "黎巴嫩": "Lebanon",
    "孟加拉": "Bangladesh",
    "哈萨克斯坦": "Kazakhstan",
    "以色列": "Israel",
    "约旦": "Jordan",
    "巴勒斯坦": "Palestine",
    "马来西亚": "Malaysia",
    "菲律宾": "Philippines",
    "伊拉克": "Iraq",
    "斯里兰卡": "Sri Lanka",
    "秘鲁": "Peru",
    "老挝": "Laos",
    "白俄罗斯": "Belarus",
    "南非": "South Africa",
    "沙特阿拉伯": "Saudi Arabia",
    "科威特": "Kuwait",
    "克罗地亚": "Croatia",
    "格鲁吉亚": "Georgia",
    "冰岛": "Iceland",
    "未知": "Unknown",
    # English variants to normalize
    "The Netherlands": "Netherlands",
    "United Arab Emirates": "United Arab Emirates",
    "Uruguay": "Uruguay",
    "Czechia": "Czechia",
    "England": "United Kingdom",
    "Ireland": "Ireland",
    # compound countries — split on "/" and translate each part
    "德国/巴西": "Germany / Brazil",
    "美国/英国": "United States / United Kingdom",
    "英国/澳大利亚": "United Kingdom / Australia",
}


def transform_country_field(match):
    full = match.group(0)  # e.g. country: "德国"
    value = match.group(1)  # e.g. 德国
    # Handle compound values not pre-listed, e.g. "法国/意大利"
    if value not in CN_TO_EN and "/" in value:
        parts = [p.strip() for p in value.split("/")]
        translated = []
        missing = []
        for p in parts:
            if p in CN_TO_EN:
                translated.append(CN_TO_EN[p])
            else:
                missing.append(p)
                translated.append(p)
        if missing:
            return full  # leave unchanged if any part unmapped; will be caught later
        en = " / ".join(translated)
    elif value in CN_TO_EN:
        en = CN_TO_EN[value]
    else:
        return full  # unmapped — leave for review
    return f'country: "{en}"'


def process_file(path: Path):
    text = path.read_text(encoding="utf-8")
    before = set(re.findall(r'country:\s*"([^"]+)"', text))
    new_text = re.sub(r'country:\s*"([^"]+)"', transform_country_field, text)
    after = set(re.findall(r'country:\s*"([^"]+)"', new_text))
    still_cjk = [c for c in after if any("\u4e00" <= ch <= "\u9fff" for ch in c)]
    path.write_text(new_text, encoding="utf-8")
    print(f"=== {path.name} ===")
    print(f"  unique countries before: {len(before)}")
    print(f"  unique countries after:  {len(after)}")
    if still_cjk:
        print(f"  WARNING — still CJK/unmapped: {still_cjk}")
    else:
        print("  all countries mapped ✓")
    return still_cjk


def main():
    base = Path(__file__).resolve().parent.parent / "src" / "data"
    problems = []
    for name in ("foundries.ts", "designers.ts"):
        p = base / name
        if not p.exists():
            print(f"skip missing {p}", file=sys.stderr)
            continue
        problems.extend(process_file(p))
    if problems:
        print(f"\nUnmapped values remain: {set(problems)}", file=sys.stderr)
        sys.exit(1)
    print("\nDone. No unmapped country values.")


if __name__ == "__main__":
    main()
