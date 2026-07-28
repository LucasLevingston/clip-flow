import { startHealthzServer } from "@clip-flow/worker-kit"
import { startAiQueueConsumer } from "./interface/queueConsumer"

const port = process.env.PORT ? Number(process.env.PORT) : 3000

startHealthzServer(port)
startAiQueueConsumer()

console.log(`[ai] worker booted, healthz on :${port}`)
