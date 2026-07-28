import { createQueueWorker } from "@clip-flow/worker-kit";
import { startHealthQueueConsumer } from "./queueConsumer";

jest.mock("@clip-flow/worker-kit");

describe("startHealthQueueConsumer", () => {
  it("should create a queue worker bound to the health queue and process a job", async () => {
    startHealthQueueConsumer();

    expect(createQueueWorker).toHaveBeenCalledWith(
      "health",
      expect.any(Function),
    );

    const mockCreate = createQueueWorker as jest.Mock;
    const processor = mockCreate.mock.calls[0][1] as (job: {
      id: string;
    }) => Promise<void>;

    await expect(processor({ id: "job-1" })).resolves.toBeUndefined();
  });
});
