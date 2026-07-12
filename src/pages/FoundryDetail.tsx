import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CountryFlag } from "@/components/CountryFlag";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { foundries } from "@/data/foundries";
import { foundrySlugByLocalId } from "@/data/foundry-bridge";
import { useTypefaces, useTypefacesIndex } from "@/data/typefaces";

const FoundryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number.parseInt(id, 10) : Number.NaN;
  const foundry = foundries.find((f) => f.id === numericId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1458px] px-4">
        <HeroSection />
        <main className="pb-10">
          <Link
            className="mb-6 inline-flex items-center gap-1 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
            to="/"
          >
            <ArrowLeft className="h-3 w-3" />
            All foundries
          </Link>

          {foundry ? (
            <FoundryBody key={foundry.id} localId={foundry.id} />
          ) : (
            <p className="font-mono text-muted-foreground text-xs">
              Foundry not found.
            </p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

function FoundryBody({ localId }: { localId: number }) {
  const foundry = foundries.find((f) => f.id === localId);
  const { data: typefaces } = useTypefaces();
  const { data: index } = useTypefacesIndex();
  if (!foundry) {
    return null;
  }

  const slug = foundrySlugByLocalId[localId];
  const typefaceIds = slug ? (index?.byFoundry[slug] ?? []) : [];
  const foundryTypefaces = typefaceIds
    .map((tid) => typefaces?.find((t) => t.id === tid))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            {foundry.name}
          </h1>
          {foundry.country && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
              <CountryFlag country={foundry.country} />
              {foundry.country}
            </span>
          )}
          <span className="rounded-full bg-muted px-3 py-1 font-mono text-muted-foreground text-xs uppercase">
            {foundry.category}
          </span>
        </div>
        {foundry.description && (
          <p className="max-w-2xl text-foreground/80 text-sm leading-relaxed">
            {foundry.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 font-mono text-muted-foreground text-xs">
          {foundry.founded && <span>Founded {foundry.founded}</span>}
          <a
            className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
            href={`https://${foundry.website}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {foundry.website}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <hr className="border-border" />

      {/* Notable fonts (legacy hand-curated list) */}
      {foundry.notableFonts && foundry.notableFonts.length > 0 && (
        <section>
          <p className="mb-3 font-medium font-mono text-muted-foreground text-xs tracking-tight">
            Notable fonts
          </p>
          <div className="flex flex-wrap gap-1.5">
            {foundry.notableFonts.map((font) => (
              <span
                className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs"
                key={font}
              >
                {font}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Typefaces from the catalogue (joined by identity) */}
      <section>
        <p className="mb-3 font-medium font-mono text-muted-foreground text-xs tracking-tight">
          Typefaces in the catalogue
        </p>
        {!slug && (
          <p className="text-muted-foreground text-sm">
            type.fish has not yet linked this foundry to its typeface detail
            records.
          </p>
        )}
        {slug && foundryTypefaces.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No typeface details recorded for this foundry yet.
          </p>
        )}
        {foundryTypefaces.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {foundryTypefaces.slice(0, 24).map((t) => (
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

export default FoundryDetail;
