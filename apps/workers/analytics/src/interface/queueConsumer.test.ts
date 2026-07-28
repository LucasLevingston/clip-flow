import { createQueueWorker } from "@clip-flow/worker-kit";
import { startAnalyticsQueueConsumer } from "./queueConsumer";

jest.mock("@clip-flow/worker-kit");

describe("startAnalyticsQueueConsumer", () => {
  it("should create a queue worker bound to the analytics queue and process a job", async () => {
    startAnalyticsQueueConsumer();

    expect(createQueueWorker).toHaveBeenCalledWith(
      "analytics",
      expect.any(Function),
    );

    const mockCreate = createQueueWorker as jest.Mock;
    const processor = mockCreate.mock.calls[0][1] as (job: {
      id: string;
    }) => Promise<void>;

    await expect(processor({ id: "job-1" })).resolves.toBeUndefined();
  });
});
