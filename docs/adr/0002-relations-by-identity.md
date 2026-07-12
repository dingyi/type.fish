# Entity relations are stored by identity (slug / id), never by raw name

Relations between Foundry, Designer, and Typeface are stored as stable identity
references — Foundry `id`, Designer `slug`, Typeface `slug` — never as raw name
strings. This replaces the current `Designer.foundries: string[]`, which holds
foundry names as free text and is the only cross-entity link in the codebase
today.

## Considered options

- **Identity references (chosen).** Every relation points at the partner
  entity's canonical key. Links resolve to real detail pages; renames update
  everywhere for free; no resolution step at render time.
- **Raw name strings (status quo).** Zero migration cost — the existing
  `Designer.foundries` already works this way. But names are ambiguous
  (duplicate designer names, the same typeface shipped by multiple foundries),
  not URL-safe (`Frere–Jones` contains an em-dash), and drift out of sync with
  the foundry table on every rename. With detail pages now required for all
  three entities, raw names cannot produce a clickable, stable link.
- **Numeric ids everywhere.** Uniform and collision-free, but produces
  unreadable URLs (`/designers/456`) and poor SEO/shareability for entities
  whose natural identity is a name.

## Consequences

- Slugs must be generated and deduplicated at ingest time. Typeface slugs are
  namespaced by Foundry so cross-foundry name collisions (two foundries each
  shipping a "Proxima") do not collide.
- The `Designer` ingest is reworked: instead of trusting the hand-maintained
  `foundries` name list, designer↔foundry membership is derived from typeface
  records (per ADR-0001), which carry both designer and foundry identity.
- Rendering a relation never does string matching at runtime — it dereferences
  an identity. Unresolved references are surfaced as data-quality issues to
  fix at ingest, not silently rendered as dead text.
