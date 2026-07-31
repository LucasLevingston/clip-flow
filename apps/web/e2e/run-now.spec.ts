import { expect, test } from "@playwright/test"

test.describe("Manual generation trigger", () => {
  test("should trigger generation from the channel settings page", async ({ page }) => {
    await page.route("**/v1/auth/me", (route) =>
      route.fulfill({
        json: {
          user: { id: "user-1", email: "user@clipflow.app", isPlatformAdmin: false },
          tenant: { id: "tenant-1", name: "Minha Empresa" },
          role: "OWNER",
        },
      }),
    )
    await page.route("**/v1/channels/channel-1", (route) =>
      route.fulfill({
        json: {
          id: "channel-1",
          nicheId: "niche-1",
          nicheName: "Futebol",
          name: "Meu Canal",
          language: "pt-BR",
          promptOverride: null,
          videosPerDay: 1,
          publishTimes: ["09:00"],
          generationTime: "09:00",
          platforms: "SHORTS_ONLY",
          thumbnailEnabled: true,
          status: "ACTIVE",
          socialAccounts: [
            {
              id: "account-1",
              platform: "YOUTUBE",
              externalAccountId: "yt-1",
              status: "CONNECTED",
              connectedAt: "2026-07-01T00:00:00.000Z",
            },
          ],
        },
      }),
    )
    let generateNowCalled = false
    await page.route("**/v1/channels/channel-1/generate-now", (route) => {
      generateNowCalled = true
      return route.fulfill({ status: 202 })
    })

    await page.goto("/channels/channel-1/settings")
    await page.getByRole("button", { name: "Executar agora" }).click()

    await expect(
      page.getByText("Geração disparada — acompanhe o progresso na lista de vídeos."),
    ).toBeVisible()
    expect(generateNowCalled).toBe(true)
  })
})
