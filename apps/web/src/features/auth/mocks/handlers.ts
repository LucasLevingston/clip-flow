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
]
