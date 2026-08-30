# Context — type.fish

A glossary of the domain language used in type.fish. Keep this devoid of
implementation details — it records *what things mean*, not how they are stored
or rendered. Implementation decisions live in `docs/adr/`.

## Terms

### Typeface

A single type *design family* — e.g. **Inter**, **Helvetica**, **Source Han Sans**.
A Typeface is identified by name and owned by exactly one **Foundry**, and may be
drawn by one or more **Designers**. A Typeface carries a **License** and is
released in one or more weights/styles (Regular, Bold, Italic…).

- A Typeface is *not* a single font file. `Inter-Bold.ttf` is a file/instance;
  **Inter** is the Typeface. type.fish catalogues Typefaces, not files.
- A Typeface is identified by a **slug** that disambiguates by Foundry when
  names collide across foundries (e.g. two foundries each shipping a "Proxima").
- Browsed at `/typefaces`; detail at `/typefaces/:slug`. The Open Source view
  (`/typefaces?license=open-source`) is the same catalogue with a license
  preset, surfaced as its own top-level nav entry.

### Font

Colloquial synonym for a single weight/instance of a Typeface. type.fish uses
"Font" only in legacy field names (e.g. `notableFonts` on Foundry, which is a
loose list of representative Typeface *names* as strings) and in human-readable
copy. When precision matters, the term is **Typeface**.

### Foundry

A company or collective that publishes Typefaces — e.g. **Commercial Type**,
**Google Fonts**, **Velvetyne**. A Foundry is identified by a numeric `id`, has
a country, a founding year, and a `category` of `classic | modern | indie |
tech | studio`. A Foundry owns one or more Typefaces and may employ one or more
Designers.

- Browsed at `/` (labelled "Foundry" in the nav).

### Designer

A person who draws Typefaces — e.g. **Christian Schwartz**, **Matthew Carter**.
A Designer is identified by a **slug** derived from their name (e.g.
`christian-schwartz`), has a country, a `workCount`, and a list of Foundries
they have worked with. The Foundry link is stored by Foundry identity (id/slug),
not by raw name string — raw names are ambiguous and not URL-safe.

- Browsed at `/designers`; detail at `/designers/:slug`.

### Tool

Software, resources and creative references for working with type, listed as
external products with their own websites — they are neither Foundries nor
Typefaces. Four groupings: a *manager* helps browse, organise and activate
installed fonts (e.g. RightFont, Typeface, FontBase); an *editor* is used to
draw and produce Typefaces (e.g. FontLab); a *resource* helps discover
Typefaces (e.g. UNCUT.wtf); *inspiration* shows typography in practice through
studio work and case studies (e.g. RNDR Realm, Oddfellows). Entries are curated
rather than exhaustively catalogued, and carry a platform list (macOS / Windows
/ Linux / Web).

- Browsed at `/tools`; entries link out to the tool's own site (no detail pages).

### License

The legal terms under which a Typeface is distributed. type.fish cares about
two coarse buckets that are queryable:

- **Open source** — released under a libre license, principally the **SIL Open
  Font License (OFL)**. Usable and modifiable by anyone. The open-source flag is
  sourced from **Google Fonts metadata** (`isOpenSource`), joined to the
  catalogue by family name; type.lol carries no libre signal of its own. This is
  the basis of the `/typefaces?license=open-source` filter and the dedicated
  Open Source nav entry.
- **Commercial / proprietary** — sold or licensed under foundry terms; the
  default for any Typeface not flagged open-source.

The open-source flag is a boolean on the Typeface, not a multi-valued license
enum. Finer-grained distinctions (OFL vs Ubuntu Font Licence vs Apache) are not
modelled as separate filter values.
