import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Foundry", path: "/" },
  { label: "Typefaces", path: "/typefaces" },
  { label: "Designers", path: "/designers" },
  { label: "About", path: "/about" },
];

export function HeroSection() {
  const { pathname } = useLocation();

  return (
    <header className="pt-10 pb-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-semibold text-base text-foreground tracking-tight">
          Type Foundry Directory
        </h1>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                pathname === item.path
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
