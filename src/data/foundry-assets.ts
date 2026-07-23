// AUTO-GENERATED companion to public/data/foundry-assets.json
// (produced by scripts/ingest_foundry_assets.py). Provides typed access to
// per-foundry brand color + favicon path for the homepage grid cards.
import assetsJson from "../../public/data/foundry-assets.json";

export interface FoundryAsset {
  /** Brand color extracted from the favicon, e.g. "#1a4d8f". */
  color?: string;
  /** Absolute path to the cached favicon under public/, e.g. "/favicons/1.png". */
  favicon?: string;
}

/** Foundry id -> { color, favicon }. Only foundries with a usable favicon appear. */
export const foundryAssets = assetsJson as Record<string, FoundryAsset>;
