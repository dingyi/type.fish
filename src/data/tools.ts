export interface FontTool {
  /** Grouping on /tools: managers organise fonts, editors draw them, resources help discover them. */
  category: "manager" | "editor" | "resource";
  name: string;
  platforms: string[];
  /** URL-safe id, also the favicon filename stem. */
  slug: string;
  /** One-line description shown on the card. */
  tagline: string;
  /** Canonical website, with scheme. */
  website: string;
}

export const tools: FontTool[] = [
  {
    slug: "rightfont",
    name: "RightFont",
    tagline:
      "Fast, lightweight font manager for Mac — browse, preview and auto-activate fonts inside Figma, Photoshop, Sketch and other design apps.",
    website: "https://rightfontapp.com/",
    category: "manager",
    platforms: ["macOS"],
  },
  {
    slug: "typeface",
    name: "Typeface",
    tagline:
      "A beautiful, native font manager for macOS. Free to use, with optional paid Power features.",
    website: "https://typefaceapp.com/",
    category: "manager",
    platforms: ["macOS"],
  },
  {
    slug: "fontbase",
    name: "FontBase",
    tagline:
      "Cross-platform font manager with collections, auto-activation and Google Fonts integration. Free, with a paid Awesome tier.",
    website: "https://fontba.se/",
    category: "manager",
    platforms: ["macOS", "Windows", "Linux"],
  },
  {
    slug: "fontlab",
    name: "FontLab",
    tagline:
      "The professional font editor for Mac and Windows — draw, space, kern and produce production-ready typefaces.",
    website: "https://www.fontlab.com/",
    category: "editor",
    platforms: ["macOS", "Windows"],
  },
  {
    slug: "shift",
    name: "Shift",
    tagline:
      "A free, open-source font editor built with TypeScript and Rust. Cross-platform and currently in active alpha development.",
    website: "https://www.shift.graphics/",
    category: "editor",
    platforms: ["Windows", "Linux"],
  },
  {
    slug: "uncut-wtf",
    name: "UNCUT.wtf",
    tagline:
      "A free catalogue of somewhat contemporary typefaces, all available to download for commercial use.",
    website: "https://uncut.wtf/",
    category: "resource",
    platforms: ["Web"],
  },
];
