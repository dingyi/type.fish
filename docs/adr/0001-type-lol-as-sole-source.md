# Data sources: type.lol for catalogue, Google Fonts for open-source signal

type.fish needs Typeface-level data — names, weights/styles, samples, the
foundry/designer relations — plus a queryable open-source signal for the
Open Source view. No single public source provides both. We use **two
complementary sources**, each authoritative for its own dimension.

## Decision

- **type.lol (`api.type.lol/rest/v1/`, Supabase PostgREST)** is the authoritative
  source for the **catalogue**: Foundry, Designer, Typeface, Font (weight/style),
  Superfamily records, and the identity-based relations between them. It already
  backs the existing `foundries.ts` and `designers.ts`. Its ids are slugs
  (`foundries.id = "yuri-gordon"`), and relations are already identity-based
  (`typefaces.foundry_id`, `typefaces.credits[].designerId`) — see ADR-0002.

- **Google Fonts metadata (`fonts.google.com/metadata/fonts`, keyless)** is the
  authoritative source for the **open-source signal**. It carries `isOpenSource`
  per family (~1900 families, almost all SIL OFL) plus designer/category data.
  type.lol has no OFL/open-source column (96% of typefaces have null pricing;
  `license_definitions` is per-foundry commercial SKU tiers, not a libre flag),
  so the Open Source filter could not be derived from type.lol alone.

## Considered options

- **type.lol as sole source (rejected).** No open-source field exists upstream;
  the Open Source feature would have no data. Deriving "free" from `price_max=0`
  yields ~a handful of records and conflates free-trial with libre.
- **Self-maintained OFL flag (rejected).** Hand-labelling thousands of typefaces
  is infeasible and drifts; Google Fonts already maintains this for the dominant
  OFL corpus.
- **Google Fonts as sole source (rejected).** Covers only OFL families; the
  catalogue's breadth (20k typefaces, 1300 foundries, including commercial) is
  type.lol's value.

## Consequences

- Two ingest pipelines run independently; their output is joined at build time by
  **family name** (normalised), since neither source shares an id scheme with the
  other. A typeface present in both gets `license = open-source` from the Google
  Fonts side and its catalogue detail from type.lol. A typeface only in Google
  Fonts becomes a stub catalogue entry marked open-source.
- type.lol's slug scheme is inherited as-is for Foundry/Designer/Typeface ids.
  Google Fonts families that have no type.lol match get a synthesised slug.
- Both scraped artefacts are committed, so the site does not depend on either
  API at runtime. Re-running ingest requires the type.lol publishable key
  (`sb_publishable_*`) — stored in the ingest script's env, not the app.
- If either source changes shape, its pipeline breaks independently.
