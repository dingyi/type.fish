import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CountryFlag } from "@/components/CountryFlag";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { designers } from "@/data/designers";
import { foundries } from "@/data/foundries";
import { designerSlugByName } from "@/data/foundry-bridge";
import { useTypefaces, useTypefacesIndex } from "@/data/typefaces";

/**
 * URL slug for a designer is derived from their name (lowercased, hyphen-joined).
 * type.lol's own designer slug may differ, so we match local name -> type.lol
 * slug via the bridge, then resolve that slug's typefaces through the index.
 */
function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DesignerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const designer = designers.find((d) => slugifyName(d.name) === slug);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1458px] px-4">
        <HeroSection />
        <main className="pb-10">
          <Link
            className="mb-6 inline-flex items-center gap-1 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
            to="/designers"
          >
            <ArrowLeft className="h-3 w-3" />
            All designers
          </Link>

          {designer ? (
            <DesignerBody key={designer.name} name={designer.name} />
          ) : (
            <p className="font-mono text-muted-foreground text-xs">
              Designer not found.
            </p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

function DesignerBody({ name }: { name: string }) {
  const designer = designers.find((d) => d.name === name);
  const { data: typefaces } = useTypefaces();
  const { data: index } = useTypefacesIndex();
  if (!designer) {
    return null;
  }

  const tlSlug = designerSlugByName[name];
  const typefaceIds = tlSlug ? (index?.byDesigner[tlSlug] ?? []) : [];
  const designerTypefaces = typefaceIds
    .map((tid) => typefaces?.find((t) => t.id === tid))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            {designer.name}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
            <CountryFlag country={designer.country} />
            {designer.country}
          </span>
        </div>
        {designer.bio && (
          <p className="max-w-2xl text-foreground/80 text-sm leading-relaxed">
            {designer.bio}
          </p>
        )}
        <p className="font-mono text-muted-foreground text-xs">
          {designer.workCount.toLocaleString("en-US")} works
        </p>
      </header>

      <hr className="border-border" />

      {/* Foundries this designer is affiliated with, linked by identity. */}
      {designer.foundries.length > 0 && (
        <section>
          <p className="mb-3 font-medium font-mono text-muted-foreground text-xs tracking-tight">
            Foundries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {designer.foundries.map((fname) => {
              // designer.foundries holds foundry *names*; resolve to the local
              // foundry that matches, then link by id. Names without a match
              // render as plain text (per the coverage-honesty decision).
              const local = foundries.find((f) => f.name === fname);
              return local ? (
                <Link
                  className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
                  key={fname}
                  to={`/foundries/${local.id}`}
                >
                  {fname}
                </Link>
              ) : (
                <span
                  className="rounded-full bg-muted px-3 py-1 text-muted-foreground/60 text-xs"
                  key={fname}
                >
                  {fname}
                </span>
              );
            })}
            {designer.foundryCount > designer.foundries.length && (
              <span className="rounded-full px-3 py-1 font-mono text-muted-foreground/40 text-xs">
                +{designer.foundryCount - designer.foundries.length}
              </span>
            )}
          </div>
        </section>
      )}

      {/* Typefaces credited to this designer. */}
      <section>
        <p className="mb-3 font-medium font-mono text-muted-foreground text-xs tracking-tight">
          Typefaces in the catalogue
        </p>
        {!tlSlug && (
          <p className="text-muted-foreground text-sm">
            type.fish has not yet linked this designer to typeface detail
            records.
          </p>
        )}
        {tlSlug && designerTypefaces.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No typeface details recorded for this designer yet.
          </p>
        )}
        {designerTypefaces.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {designerTypefaces.slice(0, 24).map((t) => (
              <Link
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent"
                key={t.id}
                to={`/typefaces/${t.id}`}
              >
                {t.previewImage ? (
                  <img
                    alt={t.name}
                    className="h-14 w-full rounded bg-muted object-cover"
                    height={56}
                    loading="lazy"
                    src={t.previewImage}
                    width={300}
                  />
                ) : (
                  <div className="flex h-14 items-center justify-center rounded bg-muted/60">
                    <span className="font-mono text-muted-foreground/50 text-xs">
                      {t.classification}
                    </span>
                  </div>
                )}
                <span className="font-medium text-foreground text-xs">
                  {t.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DesignerDetail;
