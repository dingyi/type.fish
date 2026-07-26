/**
 * Slugify a designer name into the URL form used on /designers/[slug].
 * Shared between the server-rendered detail page and the client island so both
 * agree on the href.
 */
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
