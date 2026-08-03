/**
 * What this site documents.
 *
 * The docs track physure's `main`, which is always nightly: `where` bindings,
 * QuantityVector/QuantityMatrix, export3d and string interpolation are all
 * covered here and none of them are in the latest release. Badging the site
 * with a release number would promise those to someone who then installs that
 * release and doesn't get them. So the channel is `nightly`, and the numbered
 * versions are the releases listed on the changelog.
 */
export const PHYSURE_CHANNEL = "nightly";

/**
 * Used when the tag lookup below can't run — an offline build, a GitHub
 * outage, or the unauthenticated rate limit. Bump it when convenient; being
 * a few releases stale here is only visible if the fetch also fails.
 */
const FALLBACK_LATEST_RELEASE = "0.2.3";

/** Release tags look like `v0.2.3`; `py-core-*`, `java-*` and `core-*` don't. */
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

/**
 * The newest release among raw tag names, or null if there isn't one.
 *
 * Compares numerically per component rather than lexicographically, which is
 * how the API returns them: a string sort puts v0.2.9 above v0.2.10 the moment
 * a tenth patch ships.
 */
export function pickLatest(tagNames: string[]): string | null {
  const parsed = tagNames
    .map((name) => RELEASE_TAG.exec(name))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ version: m[0].slice(1), parts: [+m[1], +m[2], +m[3]] }));

  if (parsed.length === 0) return null;

  parsed.sort((a, b) => {
    for (let i = 0; i < 3; i++) {
      if (b.parts[i] !== a.parts[i]) return b.parts[i] - a.parts[i];
    }
    return 0;
  });
  return parsed[0].version;
}

const GH = "https://api.github.com/repos/Alexisrx96/physure";
const GH_HEADERS = { Accept: "application/vnd.github+json" };

/**
 * Memoised across the whole build.
 *
 * The layout runs once per page, so without this a 22-page build would fire
 * 22 requests per endpoint and walk straight into GitHub's 60/hour
 * unauthenticated limit — the fallback would then hide it by quietly serving
 * stale numbers. Caching the promise (not the value) also collapses the
 * concurrent page renders into a single in-flight request.
 */
function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => (cached ??= fn());
}

/**
 * The newest release tag in the physure repo, read at build time.
 *
 * The two repos deploy independently, so this can't come from Cargo.toml —
 * the tag list is the one shared fact both sides agree on. Sorted properly
 * rather than trusting the API's order, which is lexicographic: that would
 * put v0.2.9 above v0.2.10 the moment a tenth patch ships.
 *
 * Never throws. A failed lookup falls back to the constant above, because a
 * stale version badge is a far smaller problem than a site that won't build.
 */
export const latestRelease = once(async (): Promise<string> => {
  try {
    const res = await fetch(`${GH}/tags?per_page=100`, { headers: GH_HEADERS });
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);

    const tags: Array<{ name: string }> = await res.json();
    const latest = pickLatest(tags.map((t) => t.name));
    if (latest === null) throw new Error("no release tags matched");
    return latest;
  } catch (e) {
    console.warn(
      `[version] falling back to v${FALLBACK_LATEST_RELEASE}: ${
        e instanceof Error ? e.message : e
      }`,
    );
    return FALLBACK_LATEST_RELEASE;
  }
});

/**
 * GitHub stargazer count, or null if it can't be read.
 *
 * Null rather than a fallback number on purpose: an invented star count is a
 * claim about other people's behaviour, and a stale one is worse than none.
 * Callers hide the figure when this is null instead of printing a guess.
 */
export const stars = once(async (): Promise<number | null> => {
  try {
    const res = await fetch(GH, { headers: GH_HEADERS });
    if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
    const repo: { stargazers_count?: number } = await res.json();
    return typeof repo.stargazers_count === "number"
      ? repo.stargazers_count
      : null;
  } catch (e) {
    console.warn(
      `[version] star count unavailable: ${
        e instanceof Error ? e.message : e
      }`,
    );
    return null;
  }
});
