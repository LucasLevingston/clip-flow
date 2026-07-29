/** Pulls the raw refresh_token value out of a Set-Cookie response header, for use in test requests. */
export function extractCookie(setCookieHeader: string | string[] | undefined): string {
  const raw = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader
  const value = raw?.match(/refresh_token=([^;]+)/)?.[1]
  if (!value) throw new Error("refresh_token cookie not found in response")
  return value
}
