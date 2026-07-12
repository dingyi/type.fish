import { Link, useLocation, useSearchParams } from "react-router-dom";

// navItems are displayed left-to-right. The Open Source entry is a preset of
// /typefaces — it gets its own top-level slot (per the nav decision) but its
// active state is driven by the license query param, not the path alone.
const navItems = [
  { label: "Foundry", path: "/" },
  { label: "Typefaces", path: "/typefaces" },
  { label: "Open Source", path: "/typefaces?license=open-source" },
  { label: "Designers", path: "/designers" },
  { label: "About", path: "/about" },
] as const;

function isActive(
  path: string,
  pathname: string,
  license: string | null
): boolean {
  if (path === "/typefaces?license=open-source") {
    return pathname === "/typefaces" && license === "open-source";
  }
  // /typefaces without the preset should not highlight when the preset is on.
  if (path === "/typefaces") {
    return pathname === "/typefaces" && license !== "open-source";
  }
  return pathname === path;
}

export function HeroSection() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const license = searchParams.get("license");

  return (
    <header className="pt-10 pb-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-semibold text-base text-foreground tracking-tight">
          type.fish
        </h1>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                isActive(item.path, pathname, license)
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={item.path}
              to={item.path}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="ml-2 rounded-full bg-foreground px-3 py-1 text-background text-sm transition-colors hover:bg-foreground/85"
            to="/submit"
          >
            Submit
          </Link>
        </nav>
      </div>
      <hr className="mt-6 border-border" />
    </header>
  );
}
