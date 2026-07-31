import { expect, test } from "@playwright/test"

test.describe("Login flow", () => {
  test("should log in and land on the dashboard with the channel list", async ({ page }) => {
    await page.route("**/v1/auth/login", (route) =>
      route.fulfill({ json: { accessToken: "e2e-fake-token" } }),
    )
    await page.route("**/v1/auth/me", (route) =>
      route.fulfill({
        json: {
          user: { id: "user-1", email: "user@clipflow.app", isPlatformAdmin: false },
          tenant: { id: "tenant-1", name: "Minha Empresa" },
          role: "OWNER",
        },
      }),
    )
    await page.route("**/v1/channels", (route) =>
      route.fulfill({ json: { data: [], meta: { page: 1, pageSize: 20, total: 0 } } }),
    )
    await page.route("**/v1/niches", (route) =>
      route.fulfill({ json: { data: [], meta: { page: 1, pageSize: 20, total: 0 } } }),
    )

    await page.goto("/login")
    await page.getByLabel("E-mail").fill("user@clipflow.app")
    await page.getByLabel("Senha").fill("Senha123")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page).toHaveURL("/")
    await expect(page.getByRole("heading", { name: "Clip Flow" })).toBeVisible()
    await expect(page.getByText("Minha Empresa")).toBeVisible()
  })

  test("should show an error and stay on the page when credentials are invalid", async ({
    page,
  }) => {
    await page.route("**/v1/auth/login", (route) =>
      route.fulfill({
        status: 401,
        json: { error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } },
      }),
    )
    await page.route("**/v1/auth/refresh", (route) =>
      route.fulfill({
        status: 401,
        json: { error: { code: "INVALID_REFRESH_TOKEN", message: "no session" } },
      }),
    )

    await page.goto("/login")
    await page.getByLabel("E-mail").fill("user@clipflow.app")
    await page.getByLabel("Senha").fill("wrong-password")
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible()
    await expect(page).toHaveURL("/login")
  })
})
