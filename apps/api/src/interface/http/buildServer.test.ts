import { buildServer } from "./buildServer";

describe("buildServer", () => {
  it("should respond 200 with status ok on GET /healthz", async () => {
    const app = buildServer();

    const response = await app.inject({ method: "GET", url: "/healthz" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });

    await app.close();
  });

  it("should respond 404 for an unknown route", async () => {
    const app = buildServer();

    const response = await app.inject({ method: "GET", url: "/unknown" });

    expect(response.statusCode).toBe(404);

    await app.close();
  });
});
