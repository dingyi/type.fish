import { Code, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { CountryFlag } from "@/components/CountryFlag";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { type Foundry, foundries } from "@/data/foundries";
import { cn } from "@/lib/utils";

const About = () => {
  const stats = computeStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1458px] px-4">
        <HeroSection />
        <main className="pb-10">
          {/* Intro */}
          <section className="py-10">
            <p className="mb-2 font-medium font-mono text-muted-foreground text-xs tracking-tight">
              About type.fish
            </p>
            <h1 className="mb-6 font-bold text-3xl text-foreground tracking-tight">
              Global Type Foundry Directory
            </h1>
            <div className="max-w-2xl space-y-4 text-foreground/80 text-sm leading-relaxed">
              <p>
                type.fish is an open directory of type foundries, cataloguing
                type design companies, studios, and independent designers from
                around the world.
              </p>
              <p>
                We aim to offer type lovers, designers, and developers a clear,
                searchable list of foundries — from century-old houses like
                Monotype and Linotype to one-person studios that have published
                a single typeface, all listed on equal footing.
              </p>
              <p className="text-muted-foreground">
                No ratings, no paid placement — just the facts.
              </p>
            </div>
          </section>

          <hr className="border-border" />

          {/* Stats */}
          <section className="py-10">
            <p className="mb-6 font-medium font-mono text-muted-foreground text-xs tracking-tight">
              Overview
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {stats.map((s) => (
                <div
                  className="rounded-xl border border-border bg-card p-4"
                  key={s.label}
                >
                  <p className="font-bold font-mono text-2xl text-foreground tabular-nums tracking-tight">
                    {s.value}
                  </p>
                  <p className="mt-1 font-mono text-muted-foreground text-xs">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-muted-foreground text-xs">
              Data updated{" "}
              {new Date(__GIT_LAST_COMMIT_DATE__).toLocaleDateString("en-US")}
            </p>
          </section>

          <hr className="border-border" />

          {/* Top countries */}
          <section className="py-10">
            <p className="mb-2 font-medium font-mono text-muted-foreground text-xs tracking-tight">
              By Country
            </p>
            <p className="mb-6 max-w-2xl text-foreground/80 text-sm leading-relaxed">
              Foundries span {countryCountMap.size} countries and regions. The
              top entries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {topCountries.map((c) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs"
                  key={c.name}
                >
                  <CountryFlag country={c.name} />
                  {c.name}{" "}
                  <span className="font-mono text-foreground/60 tabular-nums">
                    {c.count}
                  </span>
                </span>
              ))}
            </div>
          </section>

          <hr className="border-border" />

          {/* Categories */}
          <section className="py-10">
            <p className="mb-6 font-medium font-mono text-muted-foreground text-xs tracking-tight">
              By Category
            </p>
            <div className="space-y-3">
              {categoryRows.map((row) => (
                <div className="flex items-center gap-3" key={row.key}>
                  <span className="w-16 shrink-0 font-mono text-foreground text-xs">
                    {row.label}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{
                        width: `${(row.count / maxCategoryCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-muted-foreground text-xs tabular-nums">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-border" />

          {/* Data sources */}
          <section className="py-10">
            <p className="mb-6 font-medium font-mono text-muted-foreground text-xs tracking-tight">
              Data Sources
            </p>
            <div className="max-w-2xl space-y-3 text-foreground/80 text-sm leading-relaxed">
              <p>
                Foundry data in this directory is compiled from publicly
                available information, with a portion imported from{" "}
                <a
                  className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
                  href="https://type.lol"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  type.lol
                </a>
                — our thanks to them.
              </p>
              <p className="text-muted-foreground">
                We strive for accuracy, but omissions happen. If you spot an
                error or a missing foundry, please send a correction via the
                options below.
              </p>
            </div>
          </section>

          <hr className="border-border" />

          {/* Contribute */}
          <section className="py-10">
            <p className="mb-6 font-medium font-mono text-muted-foreground text-xs tracking-tight">
              Contribute
            </p>
            <div className="max-w-2xl space-y-4 text-foreground/80 text-sm leading-relaxed">
              <p>
                type.fish is an open-source project; all code and data live on
                GitHub. You can file an Issue or Pull Request to add a foundry,
                correct information, or improve the site.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-background text-xs transition-colors hover:bg-foreground/85"
                  )}
                  to="/submit"
                >
                  Submit a foundry
                </Link>
                <a
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                  href="https://github.com/dingyi/type.fish"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Code className="h-3 w-3" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                  href="mailto:hello@type.fish"
                >
                  <Mail className="h-3 w-3" />
                  Contact
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

interface Stat {
  label: string;
  value: string | number;
}

function computeStats(): Stat[] {
  const total = foundries.length;
  let withFounded = 0;

  for (const f of foundries) {
    if (f.founded) {
      const year = Number.parseInt(f.founded, 10);
      if (Number.isNaN(year)) {
        continue;
      }
      withFounded++;
    }
  }

  return [
    { label: "Foundries", value: total.toLocaleString("en-US") },
    { label: "Countries", value: countryCountMap.size },
    { label: "With founding year", value: withFounded.toLocaleString("en-US") },
    {
      label: "With font lists",
      value: foundries.filter((f) => f.notableFonts?.length).length,
    },
  ];
}

// Precompute once at module load — cheap, avoids recompute per render.
const countryCountMap = new Map<string, number>();
for (const f of foundries) {
  const c = f.country || "Unknown";
  countryCountMap.set(c, (countryCountMap.get(c) || 0) + 1);
}
const topCountries = [...countryCountMap.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .map(([name, count]) => ({ name, count }));

const categoryMeta: Record<Foundry["category"], { label: string }> = {
  classic: { label: "Classic" },
  modern: { label: "Modern" },
  indie: { label: "Indie" },
  tech: { label: "Tech" },
  studio: { label: "Studio" },
};

const categoryCountMap = new Map<string, number>();
for (const f of foundries) {
  categoryCountMap.set(f.category, (categoryCountMap.get(f.category) || 0) + 1);
}
const categoryRows = (
  ["classic", "modern", "studio", "indie", "tech"] as Foundry["category"][]
)
  .map((key) => ({
    key,
    label: categoryMeta[key].label,
    count: categoryCountMap.get(key) || 0,
  }))
  .sort((a, b) => b.count - a.count);
const maxCategoryCount = Math.max(...categoryRows.map((r) => r.count), 1);

export default About;
