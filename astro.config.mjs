import { execSync } from "node:child_process";
import path from "node:path";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Read the last commit date at build time. Replaces the old Vite `define` of
// __GIT_LAST_COMMIT_DATE__; consumed via import.meta.env.PUBLIC_GIT_DATE so it
// is available in both .astro frontmatter and client islands.
const gitDate = (() => {
  try {
    return execSync("git log -1 --format=%cI").toString().trim();
  } catch {
    return new Date().toISOString();
  }
})();

// https://astro.build/config
export default defineConfig({
  site: "https://type.fish",
  output: "static",
  integrations: [react()],
  vite: {
    define: {
      "import.meta.env.PUBLIC_GIT_DATE": JSON.stringify(gitDate),
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "./src") },
    },
  },
});
