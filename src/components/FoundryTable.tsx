import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { foundries } from "@/data/foundries";

export function FoundryTable() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countries = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const f of foundries) {
      const c = f.country || "未知";
      countMap.set(c, (countMap.get(c) || 0) + 1);
    }
    return [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, []);

  const filteredFoundries = useMemo(() => {
    let result = [...foundries].sort((a, b) => a.name.localeCompare(b.name));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.country?.toLowerCase().includes(q) ||
          f.website.toLowerCase().includes(q) ||
          f.notableFonts?.some((font) => font.toLowerCase().includes(q))
      );
    }
    if (selectedCountry) {
      result = result.filter((f) => (f.country || "未知") === selectedCountry);
    }
    return result;
  }, [search, selectedCountry]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            className={`border px-2 py-0.5 text-xs transition-colors ${
              selectedCountry === null
                ? "border-border bg-muted text-foreground"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setSelectedCountry(null)}
            type="button"
          >
            全部
          </button>
          {countries.map((c) => (
            <button
              className={`border px-2 py-0.5 text-xs transition-colors ${
                selectedCountry === c.name
                  ? "border-border bg-muted text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              key={c.name}
              onClick={() => setSelectedCountry(c.name)}
              type="button"
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
        <input
          className="w-full border border-border bg-background px-3 py-1.5 text-foreground text-xs placeholder:text-muted-foreground focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索厂商..."
          type="text"
          value={search}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-border border-b text-left">
                <th className="w-10 px-3 py-2 font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground">
                  名称
                </th>
                <th className="hidden px-3 py-2 font-medium text-muted-foreground md:table-cell">
                  简介
                </th>
                <th className="hidden px-3 py-2 font-medium text-muted-foreground lg:table-cell">
                  国家
                </th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                  官网
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFoundries.map((foundry, index) => (
                <tr
                  className="border-border border-b last:border-b-0 hover:bg-muted/30"
                  key={foundry.id}
                >
                  <td className="px-3 py-2 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      className="font-medium text-foreground transition-colors hover:text-muted-foreground"
                      href={`https://${foundry.website}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {foundry.name}
                    </a>
                  </td>
                  <td className="hidden max-w-[220px] px-3 py-2 md:table-cell">
                    <span className="block truncate text-muted-foreground">
                      {foundry.description || "—"}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2 text-muted-foreground lg:table-cell">
                    {foundry.country || "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a
                      className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                      href={`https://${foundry.website}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="hidden sm:inline">
                        {foundry.website}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between text-muted-foreground text-xs">
        <span>
          显示 {filteredFoundries.length} / {foundries.length} 个字体厂商
        </span>
        <span className="hidden sm:inline">
          更新于{" "}
          {new Date(__GIT_LAST_COMMIT_DATE__).toLocaleDateString("zh-CN")}
        </span>
      </div>
    </div>
  );
}
