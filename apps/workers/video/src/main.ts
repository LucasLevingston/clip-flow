import { startHealthzServer } from "@clip-flow/worker-kit";
import { startVideoQueueConsumer } from "./interface/queueConsumer";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

startHealthzServer(port);
startVideoQueueConsumer();

console.log(`[video] worker booted, healthz on :${port}`);
