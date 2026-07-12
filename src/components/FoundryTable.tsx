import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CountryFlag } from "@/components/CountryFlag";
import { foundries } from "@/data/foundries";

const PAGE_SIZE = 48;

export function FoundryTable() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [page, setPage] = useState(0);

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

  // Reset to first page whenever filters change
  const pageCount = Math.max(
    1,
    Math.ceil(filteredFoundries.length / PAGE_SIZE)
  );
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const pageItems = filteredFoundries.slice(start, start + PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };
  const handleCountry = (value: string | null) => {
    setSelectedCountry(value);
    setPage(0);
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              selectedCountry === null
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            onClick={() => handleCountry(null)}
            type="button"
          >
            All
          </button>
          {countries.map((c) => (
            <button
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                selectedCountry === c.name
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              key={c.name}
              onClick={() => handleCountry(c.name)}
              type="button"
            >
              <CountryFlag country={c.name} />
              {c.name}
              <span className="font-mono tabular-nums">{c.count}</span>
            </button>
          ))}
        </div>
        <input
          className="w-full rounded-full border border-border bg-background px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search foundries..."
          type="text"
          value={search}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b bg-muted/50 text-left">
                <th className="w-12 px-4 py-2.5 font-medium font-mono text-muted-foreground text-xs">
                  #
                </th>
                <th className="px-4 py-2.5 font-medium font-mono text-muted-foreground text-xs">
                  Name
                </th>
                <th className="hidden w-12 px-4 py-2.5 font-medium font-mono text-muted-foreground text-xs lg:table-cell">
                  Flag
                </th>
                <th className="hidden px-4 py-2.5 font-medium font-mono text-muted-foreground text-xs md:table-cell">
                  Description
                </th>
                <th className="px-4 py-2.5 text-right font-medium font-mono text-muted-foreground text-xs">
                  Website
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((foundry, index) => (
                <tr
                  className="border-border border-b transition-colors last:border-b-0 hover:bg-accent"
                  key={foundry.id}
                >
                  <td className="px-4 py-2.5 font-mono text-muted-foreground text-xs tabular-nums">
                    {start + index + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      className="font-medium text-foreground transition-colors hover:text-muted-foreground"
                      to={`/foundries/${foundry.id}`}
                    >
                      {foundry.name}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-2.5 lg:table-cell">
                    {foundry.country ? (
                      <CountryFlag
                        className="h-3.5"
                        country={foundry.country}
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden max-w-[320px] px-4 py-2.5 md:table-cell">
                    <span className="block truncate text-muted-foreground">
                      {foundry.description || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <a
                      className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                      href={`https://${foundry.website}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span className="hidden font-mono text-xs sm:inline">
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

      {/* Stats + Pagination */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-muted-foreground text-xs">
        <span>
          Showing{" "}
          <span className="font-mono tabular-nums">{pageItems.length}</span> /{" "}
          <span className="font-mono tabular-nums">
            {filteredFoundries.length}
          </span>{" "}
          foundries
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden font-mono sm:inline">
            Updated{" "}
            {new Date(__GIT_LAST_COMMIT_DATE__).toLocaleDateString("en-US")}
          </span>
          <div className="flex items-center gap-2">
            <button
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
                safePage === 0
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              type="button"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </button>
            <span className="font-mono text-foreground/80 tabular-nums">
              {safePage + 1} / {pageCount}
            </span>
            <button
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
                safePage >= pageCount - 1
                  ? "cursor-not-allowed text-muted-foreground/40"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              type="button"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
