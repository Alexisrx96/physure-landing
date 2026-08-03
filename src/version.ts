/**
 * What this site documents.
 *
 * The docs track physure's `main`, not the last tag: they cover `where`
 * bindings, QuantityVector/QuantityMatrix, export3d and the rest of the
 * unreleased work. Badging the site with a release number would promise
 * those to anyone who then installs that release and doesn't get them.
 * So the current channel is `nightly`, and the numbered versions are the
 * releases listed on the changelog.
 *
 * PHYSURE_LATEST_RELEASE mirrors the newest tag in the physure repo. The
 * two repos deploy independently, so neither value can be derived at build
 * time — bump the release here when physure tags one.
 */
export const PHYSURE_CHANNEL = "nightly";
export const PHYSURE_LATEST_RELEASE = "0.2.3";
