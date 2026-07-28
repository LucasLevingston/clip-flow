import { startHealthzServer } from "@clip-flow/worker-kit"
import { startSchedulerQueueConsumer } from "./interface/queueConsumer"

const port = process.env.PORT ? Number(process.env.PORT) : 3000

startHealthzServer(port)
startSchedulerQueueConsumer()

console.log(`[scheduler] worker booted, healthz on :${port}`)
