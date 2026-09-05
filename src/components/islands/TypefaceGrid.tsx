import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Typeface, TypefaceClassification } from "@/data/typefaces";

const PAGE_SIZE = 48;

const CLASSIFICATIONS: {
  key: TypefaceClassification | "all";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "sans", label: "Sans" },
  { key: "serif", label: "Serif" },
  { key: "slab", label: "Slab" },
  { key: "mono", label: "Mono" },
  { key: "display", label: "Display" },
  { key: "script", label: "Script" },
  { key: "blackletter", label: "Blackletter" },
  { key: "hand", label: "Hand" },
  { key: "other", label: "Other" },
];

interface Props {
  dataUrl?: string;
  initialOpenSource?: boolean;
  initialTypefaces: Typeface[];
  totalCount: number;
}

export function TypefaceGrid({
  dataUrl = "/data/typefaces.json",
  initialOpenSource = false,
  initialTypefaces,
  totalCount,
}: Props) {
  const [typefaces, setTypefaces] = useState(initialTypefaces);
  const [hasFullDataset, setHasFullDataset] = useState(
    initialTypefaces.length >= totalCount
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const loadPromise = useRef<Promise<Typeface[]> | null>(null);
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState<
    TypefaceClassification | "all"
  >("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const legacyOpenSource =
      new URLSearchParams(window.location.search).get("license") ===
      "open-source";
    if (!initialOpenSource && legacyOpenSource) {
      window.location.replace("/typefaces/open-source/");
    }
  }, [initialOpenSource]);

  const loadFullDataset = async (): Promise<boolean> => {
    if (hasFullDataset) {
      return true;
    }

    setIsLoading(true);
    setLoadError("");
    loadPromise.current ??= fetch(dataUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Catalogue request failed: ${response.status}`);
      }
      return (await response.json()) as Typeface[];
    });

    try {
      const fullDataset = await loadPromise.current;
      setTypefaces(fullDataset);
      setHasFullDataset(true);
      return true;
    } catch {
      loadPromise.current = null;
      setLoadError("The full catalogue could not be loaded. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...typefaces].sort((a, b) => a.name.localeCompare(b.name));
    if (initialOpenSource) {
      result = result.filter((t) => t.isOpenSource);
    }
    if (classification !== "all") {
      result = result.filter((t) => t.classification === classification);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.foundryId.toLowerCase().includes(q)
      );
    }
    return result;
  }, [typefaces, initialOpenSource, classification, search]);

  const isUnfiltered = classification === "all" && !search.trim();
  const resultCount =
    hasFullDataset || !isUnfiltered ? filtered.length : totalCount;
  const pageCount = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const resetPage = () => setPage(0);

  const toggleOpenSource = () => {
    window.location.assign(
      initialOpenSource ? "/typefaces/" : "/typefaces/open-source/"
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {CLASSIFICATIONS.map((c) => (
            <button
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                classification === c.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              key={c.key}
              onClick={() => {
                setClassification(c.key);
                resetPage();
                loadFullDataset();
              }}
              type="button"
            >
              {c.label}
            </button>
          ))}
          <button
            aria-pressed={initialOpenSource}
            className={`ml-2 rounded-full px-3 py-1 text-xs transition-colors ${
              initialOpenSource
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            onClick={toggleOpenSource}
            type="button"
          >
            Open Source
          </button>
        </div>
        <input
          className="w-full rounded-full border border-border bg-background px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
            loadFullDataset();
          }}
          placeholder="Search typefaces..."
          type="text"
          value={search}
        />
      </div>

      {isLoading && (
        <p aria-live="polite" className="mb-4 text-muted-foreground text-xs">
          Loading the full catalogue…
        </p>
      )}
      {loadError && (
        <p aria-live="polite" className="mb-4 text-red-700 text-xs">
          {loadError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((t) => (
          <a
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            href={`/typefaces/${t.id}`}
            key={t.id}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-foreground text-sm">{t.name}</h3>
              {t.isOpenSource && (
                <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 font-mono text-[10px] text-foreground/70 uppercase tracking-wider">
                  OFL
                </span>
              )}
            </div>
            {t.previewImage ? (
              <img
                alt={t.name}
                className="h-16 w-full rounded bg-muted object-cover"
                height={64}
                loading="lazy"
                src={t.previewImage}
                width={400}
              />
            ) : (
              <div className="flex h-16 items-center justify-center rounded bg-muted/60">
                <span className="font-mono text-muted-foreground/50 text-xs">
                  {t.classification}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-muted-foreground text-xs">
              <span>{t.foundryId}</span>
              {t.isVariable && <span>· variable</span>}
              {t.hasItalic && <span>· italic</span>}
              {t.releaseYear && <span>· {t.releaseYear}</span>}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-muted-foreground text-xs">
        <span>
          Showing{" "}
          <span className="font-mono tabular-nums">{pageItems.length}</span> /{" "}
          <span className="font-mono tabular-nums">{resultCount}</span>{" "}
          typefaces
          {initialOpenSource && " (open source)"}
        </span>
        <div className="flex items-center gap-2">
          <button
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition-colors ${
              safePage === 0
                ? "cursor-not-allowed text-muted-foreground/40"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            disabled={safePage === 0}
            onClick={() => {
              loadFullDataset().then((loaded) => {
                if (loaded) {
                  setPage(safePage - 1);
                }
              });
            }}
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
            onClick={() => {
              loadFullDataset().then((loaded) => {
                if (loaded) {
                  setPage(safePage + 1);
                }
              });
            }}
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
