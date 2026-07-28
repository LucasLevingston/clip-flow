import { createQueueWorker } from "@clip-flow/worker-kit";
import { startNotificationQueueConsumer } from "./queueConsumer";

jest.mock("@clip-flow/worker-kit");

describe("startNotificationQueueConsumer", () => {
  it("should create a queue worker bound to the notification queue and process a job", async () => {
    startNotificationQueueConsumer();

    expect(createQueueWorker).toHaveBeenCalledWith(
      "notification",
      expect.any(Function),
    );

    const mockCreate = createQueueWorker as jest.Mock;
    const processor = mockCreate.mock.calls[0][1] as (job: {
      id: string;
    }) => Promise<void>;

    await expect(processor({ id: "job-1" })).resolves.toBeUndefined();
  });
});
