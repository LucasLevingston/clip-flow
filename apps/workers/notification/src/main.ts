import { startHealthzServer } from "@clip-flow/worker-kit"
import { startNotificationQueueConsumer } from "./interface/queueConsumer"

const port = process.env.PORT ? Number(process.env.PORT) : 3000

startHealthzServer(port)
startNotificationQueueConsumer()

console.log(`[notification] worker booted, healthz on :${port}`)
