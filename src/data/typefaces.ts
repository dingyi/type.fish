import { useQuery } from "@tanstack/react-query";

// The typeface catalogue (~15k records, ~7MB) is emitted as JSON by
// scripts/ingest_typefaces.py into public/data/ and lazy-loaded on the
// /typefaces route so it never enters the initial bundle. See
// docs/adr/0001-type-lol-as-sole-source.md.

export type TypefaceClassification =
  | "sans"
  | "serif"
  | "slab"
  | "mono"
  | "script"
  | "display"
  | "blackletter"
  | "hand"
  | "other";

export interface Typeface {
  classification: TypefaceClassification;
  description?: string;
  designerIds: string[];
  foundryId: string;
  hasItalic: boolean;
  /** Slug id from type.lol, namespaced by foundry where needed. */
  id: string;
  /** Joined from Google Fonts metadata (SIL OFL families). */
  isOpenSource: boolean;
  isVariable: boolean;
  name: string;
  previewImage?: string | null;
  releaseYear?: number | null;
  scripts: string[];
  specimenUrl?: string | null;
}

export interface TypefacesIndex {
  /** designerId -> typeface ids credited to that designer. */
  byDesigner: Record<string, string[]>;
  /** foundryId -> typeface ids published by that foundry. */
  byFoundry: Record<string, string[]>;
}

/** All typefaces. Fetched once per session; React Query caches it. */
export function useTypefaces() {
  return useQuery<Typeface[]>({
    queryKey: ["typefaces"],
    queryFn: async () => {
      const res = await fetch("/data/typefaces.json");
      if (!res.ok) {
        throw new Error(`Failed to load typefaces: ${res.status}`);
      }
      return res.json() as Promise<Typeface[]>;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Reverse indexes. Loaded alongside the catalogue. */
export function useTypefacesIndex() {
  return useQuery<TypefacesIndex>({
    queryKey: ["typefaces-index"],
    queryFn: async () => {
      const res = await fetch("/data/index-maps.json");
      if (!res.ok) {
        throw new Error(`Failed to load typeface index: ${res.status}`);
      }
      return res.json() as Promise<TypefacesIndex>;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}
