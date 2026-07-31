import { authToken } from "./authToken"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

/** POSTs the httpOnly refresh cookie for a new access token; clears the session on failure. */
export async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  if (!response.ok) {
    authToken.set(null)
    return false
  }
  const data = (await response.json()) as { accessToken: string }
  authToken.set(data.accessToken)
  return true
}
