import { startHealthzServer } from "@clip-flow/worker-kit";
import { startUploadQueueConsumer } from "./interface/queueConsumer";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

startHealthzServer(port);
startUploadQueueConsumer();

console.log(`[upload] worker booted, healthz on :${port}`);
