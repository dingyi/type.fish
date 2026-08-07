// The typeface catalogue (~15k records, ~7MB) is emitted as JSON by
// scripts/ingest_typefaces.py into public/data/ and imported at build time by
// Astro pages. See
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
