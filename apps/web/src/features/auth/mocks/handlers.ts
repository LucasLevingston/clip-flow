import { http, HttpResponse } from "msw"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"

export const authHandlers = [
  http.get(`${API_BASE_URL}/v1/auth/me`, () =>
    HttpResponse.json({
      user: { id: "admin-user-1", email: "admin@clipflow.app", isPlatformAdmin: true },
      tenant: { id: "tenant-1", name: "Clip Flow" },
      role: "OWNER",
    }),
  ),
  http.post(`${API_BASE_URL}/v1/auth/login`, () =>
    HttpResponse.json({ accessToken: "fake-access-token" }),
  ),
  http.post(`${API_BASE_URL}/v1/auth/register`, () =>
    HttpResponse.json(
      {
        user: { id: "user-1", email: "user@clipflow.app" },
        tenant: { id: "tenant-1", name: "Minha Empresa" },
        accessToken: "fake-access-token",
      },
      { status: 201 },
    ),
  ),
  http.post(`${API_BASE_URL}/v1/auth/refresh`, () =>
    HttpResponse.json({ accessToken: "fake-refreshed-token" }),
  ),
  http.post(`${API_BASE_URL}/v1/auth/logout`, () => new HttpResponse(null, { status: 204 })),
]
