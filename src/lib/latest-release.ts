/**
 * Build-time lookup of a project's latest GitHub release.
 *
 * Project pages show the latest released version without anyone editing
 * frontmatter: at build time we ask the GitHub API for the repo's latest
 * release (drafts and pre-releases excluded) and render its tag. The
 * frontmatter `version` stays as the fallback so an API hiccup can never
 * break the build — it just builds with the last known value.
 */

const API_VERSION = '2022-11-28';

// One in-flight/settled promise per repo so the two fetch sites per page
// (and any future ones) cost at most one request per repo per build.
const cache = new Map<string, Promise<string | null>>();

/** `https://github.com/owner/repo` → `owner/repo`, or null if not a repo URL. */
function repoFromGithubUrl(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') return null;
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+?)\/?$/);
    return match ? `${match[1]}/${match[2]}` : null;
  } catch {
    return null;
  }
}

async function fetchLatest(repo: string): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
  };
  // Authenticated in CI (higher rate limit); anonymous works locally.
  // Read off globalThis so no @types/node dev dep is needed for `process`.
  const { process } = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const token = process?.env?.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });
    if (!res.ok) {
      console.warn(`[latest-release] ${repo}: GitHub API returned ${res.status}; using frontmatter version`);
      return null;
    }
    const release: { tag_name?: unknown; published_at?: unknown } = await res.json();
    if (typeof release.tag_name !== 'string' || release.tag_name === '') {
      console.warn(`[latest-release] ${repo}: release has no tag_name; using frontmatter version`);
      return null;
    }
    const published = typeof release.published_at === 'string' ? new Date(release.published_at) : null;
    const year = published && !Number.isNaN(published.getTime()) ? published.getUTCFullYear() : new Date().getUTCFullYear();
    return `${release.tag_name} · ${year}`;
  } catch (err) {
    console.warn(`[latest-release] ${repo}: fetch failed (${err}); using frontmatter version`);
    return null;
  }
}

/**
 * Latest-release label for the sidebar MetaCard, e.g. `v0.4.2 · 2026`
 * (matching the frontmatter `version` format). Returns null — caller falls
 * back to frontmatter — when the URL isn't a GitHub repo or the API is
 * unavailable.
 */
export function latestVersionLabel(githubUrl: string): Promise<string | null> {
  const repo = repoFromGithubUrl(githubUrl);
  if (!repo) return Promise.resolve(null);
  let pending = cache.get(repo);
  if (!pending) {
    pending = fetchLatest(repo);
    cache.set(repo, pending);
  }
  return pending;
}
