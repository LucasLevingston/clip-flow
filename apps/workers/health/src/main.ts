import { startHealthzServer } from "@clip-flow/worker-kit";
import { startHealthQueueConsumer } from "./interface/queueConsumer";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

startHealthzServer(port);
startHealthQueueConsumer();

console.log(`[health] worker booted, healthz on :${port}`);
