// AUTO-GENERATED companion to public/data/tool-assets.json
// (produced by scripts/ingest_tool_assets.py). Provides typed access to
// per-tool brand color + favicon path for the /tools card list.
import assetsJson from "../../public/data/tool-assets.json";

export interface ToolAsset {
  /** Brand color extracted from the favicon, e.g. "#080808". */
  color?: string;
  /** Absolute path to the cached favicon under public/, e.g. "/tool-favicons/rightfont.png". */
  favicon?: string;
}

/** Tool slug -> { color, favicon }. Only tools with a usable favicon appear. */
export const toolAssets = assetsJson as Record<string, ToolAsset>;
