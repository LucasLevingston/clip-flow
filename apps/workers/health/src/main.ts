import { createQueueProducer, startHealthzServer } from "@clip-flow/worker-kit"
import { startHealthQueueConsumer } from "./interface/queueConsumer"

const port = process.env.PORT ? Number(process.env.PORT) : 3000
const CHECK_INTERVAL_MS = 60_000
const SCHEDULER_ID = "platform-health-check"

startHealthzServer(port)
startHealthQueueConsumer()

const healthQueue = createQueueProducer("health")
void healthQueue.upsertJobScheduler(
  SCHEDULER_ID,
  { every: CHECK_INTERVAL_MS },
  { name: "CheckPlatformHealth" },
)

console.log(`[health] worker booted, healthz on :${port}`)
