import * as Flags from "country-flag-icons/react/3x2";
import { getCountryCode } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountryFlagProps {
  className?: string;
  /** English country label, e.g. "Germany" or "Germany / Brazil". */
  country: string;
}

/**
 * Renders the flag (SVG) for a country label. Shows nothing for Unknown or
 * unmappable values. For compound labels the first country's flag is used.
 */
export function CountryFlag({ country, className }: CountryFlagProps) {
  const code = getCountryCode(country);
  if (!code) {
    return null;
  }

  const Flag = (
    Flags as Record<string, React.ComponentType<{ className?: string }>>
  )[code];
  if (!Flag) {
    return null;
  }

  return (
    <Flag
      className={cn(
        "inline-block h-3 w-auto rounded-[2px] align-middle",
        className
      )}
    />
  );
}
