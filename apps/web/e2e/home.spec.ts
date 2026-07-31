import { expect, test } from "@playwright/test"

test.describe("Home page", () => {
  test("should render the product heading and the tenant's channel list", async ({ page }) => {
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
      route.fulfill({
        json: {
          data: [
            {
              id: "channel-1",
              name: "Canal Futebol",
              nicheId: "niche-1",
              nicheName: "Futebol",
              status: "ACTIVE",
              platforms: "SHORTS_ONLY",
              videosPerDay: 1,
              createdAt: "2026-07-01T00:00:00.000Z",
            },
          ],
          meta: { page: 1, pageSize: 20, total: 1 },
        },
      }),
    )
    await page.route("**/v1/niches", (route) =>
      route.fulfill({
        json: {
          data: [
            {
              id: "niche-1",
              name: "Futebol",
              slug: "futebol",
              description: "Melhores momentos do futebol",
              category: "Esportes",
              previewThumbnailUrl: null,
            },
          ],
          meta: { page: 1, pageSize: 20, total: 1 },
        },
      }),
    )

    await page.goto("/")

    await expect(page.getByRole("heading", { name: "Clip Flow" })).toBeVisible()
    await expect(page.getByText("Canal Futebol")).toBeVisible()
  })
})
