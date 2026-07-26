import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  List,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CountryFlag } from "@/components/CountryFlag";
import { FoundryCard } from "@/components/FoundryCard";
import type { Foundry } from "@/data/foundries";
import type { FoundryAsset } from "@/data/foundry-assets";

const PAGE_SIZE = 48;
const VIEW_MODE_KEY = "foundry-view-mode";
type ViewMode = "list" | "grid";

interface Props {
  assets: Record<string, FoundryAsset>;
  countries: { name: string; count: number }[];
  foundries: Foundry[];
  gitDate: string;
}

export function FoundryTable({ foundries, countries, assets, gitDate }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  // SSR renders "list"; on mount, hydrate from the user's persisted preference.
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_MODE_KEY) === "grid") {
        setViewMode("grid");
      }
    } catch {
      /* ignore persistence errors (private mode, etc.) */
    }
  }, []);

  const cycleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      /* ignore persistence errors (private mode, etc.) */
    }
  };

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
      result = result.filter(
        (f) => (f.country || "Unknown") === selectedCountry
      );
    }
    return result;
  }, [foundries, search, selectedCountry]);

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
        <div className="flex items-center gap-2">
          <input
            className="w-full flex-1 rounded-full border border-border bg-background px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search foundries..."
            type="text"
            value={search}
          />
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-muted p-1">
            <button
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => cycleViewMode("list")}
              type="button"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => cycleViewMode("grid")}
              type="button"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
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
                      <a
                        className="font-medium text-foreground transition-colors hover:text-muted-foreground"
                        href={`/foundries/${foundry.id}`}
                      >
                        {foundry.name}
                      </a>
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
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pageItems.map((foundry) => (
            <FoundryCard
              asset={assets[String(foundry.id)]}
              foundry={foundry}
              key={foundry.id}
            />
          ))}
        </div>
      )}

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
            Updated {new Date(gitDate).toLocaleDateString("en-US")}
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
