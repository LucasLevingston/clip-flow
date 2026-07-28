import { startHealthzServer } from "@clip-flow/worker-kit"
import { startAnalyticsQueueConsumer } from "./interface/queueConsumer"

const port = process.env.PORT ? Number(process.env.PORT) : 3000

startHealthzServer(port)
startAnalyticsQueueConsumer()

console.log(`[analytics] worker booted, healthz on :${port}`)
