import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CountryFlag } from "@/components/CountryFlag";
import { designers } from "@/data/designers";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PAGE_SIZE = 48;

export function DesignerGrid() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const countries = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const d of designers) {
      const c = d.country || "未知";
      countMap.set(c, (countMap.get(c) || 0) + 1);
    }
    return [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, []);

  const filteredDesigners = useMemo(() => {
    let result = [...designers];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.foundries.some((f) => f.toLowerCase().includes(q))
      );
    }
    if (selectedCountry) {
      result = result.filter((d) => (d.country || "未知") === selectedCountry);
    }
    return result;
  }, [search, selectedCountry]);

  // Reset to first page whenever filters change
  const pageCount = Math.max(
    1,
    Math.ceil(filteredDesigners.length / PAGE_SIZE)
  );
  const safePage = Math.min(page, pageCount - 1);

  const start = safePage * PAGE_SIZE;
  const pageItems = filteredDesigners.slice(start, start + PAGE_SIZE);

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
          placeholder="Search designers / foundries..."
          type="text"
          value={search}
        />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((designer) => (
          <Link
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            key={`${designer.name}-${designer.workCount}`}
            to={`/designers/${slugifyName(designer.name)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-foreground text-sm">
                {designer.name}
              </h3>
              <span className="shrink-0 font-mono text-muted-foreground text-xs tabular-nums">
                {designer.workCount}
                <span className="text-muted-foreground/60"> works</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                <CountryFlag country={designer.country} />
                {designer.country}
              </span>
              {designer.foundries.length > 0 && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    {designer.foundries.join(", ")}
                    {designer.foundryCount > designer.foundries.length
                      ? ` +${designer.foundryCount - designer.foundries.length}`
                      : ""}
                  </span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between text-muted-foreground text-xs">
        <span>
          Showing{" "}
          <span className="font-mono tabular-nums">{pageItems.length}</span> /{" "}
          <span className="font-mono tabular-nums">
            {filteredDesigners.length}
          </span>{" "}
          designers
          {selectedCountry || search ? ` (${designers.length} total)` : ""}
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
  );
}
