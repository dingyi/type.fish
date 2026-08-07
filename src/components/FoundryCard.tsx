import type { ComponentProps } from "react";
import type { Foundry } from "@/data/foundries";
import type { FoundryAsset } from "@/data/foundry-assets";
import { cn } from "@/lib/utils";

/**
 * Category fallback color, used when a foundry has no extracted brand color.
 * Chosen to read as a brand surface (not a UI accent) and alternate light/dark
 * across the grid so neighboring categories contrast.
 */
const CATEGORY_BG: Record<Foundry["category"], string> = {
  classic: "#0a0a0a", // near-black
  indie: "#e11d48", // rose
  modern: "#f4f4f4", // near-white
  studio: "#7c3aed", // violet
  tech: "#059669", // emerald
};

// Hoisted out of the hot path (Biome useTopLevelRegex).
const HEX_RE = /^#?([0-9a-f]{6})$/i;

/** Pull one byte out of a packed RGB integer using arithmetic, not bitwise. */
function byte(packed: number, shift: number): number {
  return Math.floor(packed / 2 ** shift) % 256;
}

/**
 * Relative luminance (sRGB), 0..1. Used to pick readable foreground text
 * against an arbitrary background color.
 */
function luminance(hex: string): number {
  const m = HEX_RE.exec(hex.trim());
  if (!m) {
    return 1;
  }
  const n = Number.parseInt(m[1], 16);
  const channel = (shift: number) => {
    const v = byte(n, shift) / 255;
    return v <= 0.039_28 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
}

type FoundryCardProps = {
  asset?: FoundryAsset;
  foundry: Foundry;
} & Omit<ComponentProps<"a">, "href">;

export function FoundryCard({
  asset,
  foundry,
  className,
  ...props
}: FoundryCardProps) {
  const bg = asset?.color || CATEGORY_BG[foundry.category];
  const dark = luminance(bg) < 0.5;
  const fgClass = dark ? "text-white" : "text-black";

  return (
    <a
      className={cn(
        "group/card relative flex aspect-square items-center justify-center overflow-hidden rounded-lg p-2 transition-transform hover:scale-[1.03]",
        fgClass,
        className
      )}
      href={`/foundries/${foundry.id}`}
      style={{ backgroundColor: bg }}
      title={foundry.name}
      {...props}
    >
      {asset?.favicon ? (
        <img
          alt={foundry.name}
          className="h-1/2 max-h-12 w-1/2 max-w-12 object-contain"
          decoding="async"
          height={48}
          loading="lazy"
          src={asset.favicon}
          width={48}
        />
      ) : (
        <span className="break-words text-center font-semibold text-xs leading-tight">
          {foundry.name}
        </span>
      )}
    </a>
  );
}
