import type { ChannelDetail } from "../../types"

export type ConnectablePlatform = "YOUTUBE" | "TIKTOK"

export function platformsToShow(platforms: ChannelDetail["platforms"]): ConnectablePlatform[] {
  if (platforms === "SHORTS_ONLY") return ["YOUTUBE"]
  if (platforms === "TIKTOK_ONLY") return ["TIKTOK"]
  return ["YOUTUBE", "TIKTOK"]
}
