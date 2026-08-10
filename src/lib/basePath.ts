// Kept in sync with next.config.ts: GitHub Pages serves this project under
// /planificador-hogar/, so any hardcoded absolute URL in metadata (which
// Next.js does NOT automatically prefix with basePath) needs this too.
export const BASE_PATH = process.env.GITHUB_PAGES === "true" ? "/planificador-hogar" : "";
