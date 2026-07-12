import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { localIdByFoundrySlug } from "@/data/foundry-bridge";
import { useTypefaces } from "@/data/typefaces";

const TypefaceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: typefaces, isLoading, isError } = useTypefaces();
  const typeface = typefaces?.find((t) => t.id === slug);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-[1458px] px-4">
        <HeroSection />
        <main className="pb-10">
          <Link
            className="mb-6 inline-flex items-center gap-1 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
            to="/typefaces"
          >
            <ArrowLeft className="h-3 w-3" />
            All typefaces
          </Link>

          {isLoading && (
            <p className="font-mono text-muted-foreground text-xs">Loading…</p>
          )}
          {isError && (
            <p className="font-mono text-muted-foreground text-xs">
              Failed to load typeface data.
            </p>
          )}
          {!(isLoading || isError || typeface) && (
            <p className="font-mono text-muted-foreground text-xs">
              Typeface not found.
            </p>
          )}

          {typeface && <TypefaceBody id={typeface.id} key={typeface.id} />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

function TypefaceBody({ id }: { id: string }) {
  const { data: typefaces } = useTypefaces();
  const typeface = typefaces?.find((t) => t.id === id);
  if (!typeface) {
    return null;
  }

  const localFoundryId = localIdByFoundrySlug[typeface.foundryId];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Specimen */}
      <div className="lg:col-span-2">
        {typeface.previewImage ? (
          <img
            alt={typeface.name}
            className="w-full rounded-xl border border-border object-cover"
            height={500}
            src={typeface.previewImage}
            width={800}
          />
        ) : (
          <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-border bg-muted/40">
            <span className="font-mono text-4xl text-foreground/40">
              {typeface.name}
            </span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-6">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="font-bold text-2xl text-foreground tracking-tight">
              {typeface.name}
            </h1>
            {typeface.isOpenSource && (
              <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-mono text-[10px] text-foreground/70 uppercase tracking-wider">
                Open Source
              </span>
            )}
          </div>
          <p className="font-mono text-muted-foreground text-xs">
            {typeface.classification}
            {typeface.isVariable && " · variable"}
            {typeface.hasItalic && " · italic"}
            {typeface.releaseYear && ` · ${typeface.releaseYear}`}
          </p>
        </div>

        {typeface.description && (
          <p className="text-foreground/80 text-sm leading-relaxed">
            {typeface.description}
          </p>
        )}

        <dl className="space-y-3 font-mono text-xs">
          <Row label="Foundry">
            {localFoundryId ? (
              <Link
                className="text-foreground underline-offset-2 hover:underline"
                to={`/foundries/${localFoundryId}`}
              >
                {typeface.foundryId}
              </Link>
            ) : (
              <span className="text-muted-foreground">
                {typeface.foundryId}
              </span>
            )}
          </Row>
          {typeface.designerIds.length > 0 && (
            <Row label="Designers">
              <span className="text-muted-foreground">
                {typeface.designerIds.join(", ")}
              </span>
            </Row>
          )}
          {typeface.scripts.length > 0 && (
            <Row label="Scripts">
              <span className="text-muted-foreground">
                {typeface.scripts.join(", ")}
              </span>
            </Row>
          )}
          {typeface.specimenUrl && (
            <Row label="Specimen">
              <a
                className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
                href={typeface.specimenUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                View
                <ExternalLink className="h-3 w-3" />
              </a>
            </Row>
          )}
        </dl>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-border border-b pb-2">
      <dt className="text-muted-foreground/60 uppercase">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export default TypefaceDetail;
