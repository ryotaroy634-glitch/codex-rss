export function isAuthorizedRefreshRequest(request: Request) {
  const expected = process.env.REFRESH_API_TOKEN;

  if (!expected) {
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
