export function isAuthorizedRefreshRequest(request: Request) {
  const expected = process.env.REFRESH_API_TOKEN;

  if (!expected) {
    return true;
  }

  const appUrl = process.env.APP_URL;
  const requestUrl = new URL(request.url);
  const allowedOrigin = appUrl ?? requestUrl.origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  // Allow refreshes initiated from the app's own UI without exposing a token to the browser.
  if (
    secFetchSite === "same-origin" ||
    origin === allowedOrigin ||
    (referer ? referer.startsWith(allowedOrigin) : false)
  ) {
    return true;
  }

  const provided = request.headers.get("x-refresh-token");
  return provided === expected;
}

export function isAuthorizedCronRequest(request: Request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return true;
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${expected}`;
}
