import { ApiError } from "./ApiError"
import { authToken } from "./authToken"
import { refreshAccessToken } from "./refreshAccessToken"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"
const REFRESH_PATH = "/v1/auth/refresh"

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
}

function buildHeaders(): HeadersInit {
  const token = authToken.get()
  return {
    "content-type": "application/json",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  }
}

function rawFetch(path: string, options: RequestOptions): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: buildHeaders(),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data: unknown = response.status === 204 ? null : await response.json()
  if (!response.ok) {
    const envelope = data as { error: { code: string; message: string } }
    throw new ApiError(response.status, envelope.error.code, envelope.error.message)
  }
  return data as T
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await rawFetch(path, options)

  if (response.status === 401 && path !== REFRESH_PATH && (await refreshAccessToken())) {
    response = await rawFetch(path, options)
  }

  return parseResponse<T>(response)
}

async function requestBlob(path: string): Promise<Blob> {
  const response = await rawFetch(path, {})
  if (!response.ok) {
    throw new ApiError(response.status, "EXPORT_FAILED", "Failed to download export")
  }
  return response.blob()
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body: unknown): Promise<T> => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
  getBlob: (path: string): Promise<Blob> => requestBlob(path),
}
