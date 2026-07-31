import { expect, test } from "@playwright/test"

test.describe("Admin route gate", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/v1/auth/me", (route) =>
      route.fulfill({
        status: 401,
        json: { error: { code: "UNAUTHORIZED", message: "Missing authentication" } },
      }),
    )
    await page.route("**/v1/auth/refresh", (route) =>
      route.fulfill({
        status: 401,
        json: { error: { code: "INVALID_REFRESH_TOKEN", message: "no session" } },
      }),
    )
  })

  test("should block an unauthenticated visitor from /niches", async ({ page }) => {
    await page.goto("/niches")

    await expect(page.getByRole("heading", { name: "Acesso restrito" })).toBeVisible()
  })

  test("should block an unauthenticated visitor from /health", async ({ page }) => {
    await page.goto("/health")

    await expect(page.getByRole("heading", { name: "Acesso restrito" })).toBeVisible()
  })
})
