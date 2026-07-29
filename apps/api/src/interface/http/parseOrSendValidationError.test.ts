import type { FastifyReply } from "fastify"
import { z } from "zod"
import { parseOrSendValidationError } from "./parseOrSendValidationError"

function createReplyStub(): { reply: FastifyReply; status: jest.Mock; send: jest.Mock } {
  const status = jest.fn().mockReturnThis()
  const send = jest.fn().mockReturnThis()
  return { reply: { status, send } as unknown as FastifyReply, status, send }
}

describe("parseOrSendValidationError", () => {
  it("should return the parsed value when the payload is valid", () => {
    const schema = z.object({ name: z.string() })
    const { reply, status } = createReplyStub()

    const result = parseOrSendValidationError(schema, { name: "Marina" }, reply)

    expect(result).toEqual({ name: "Marina" })
    expect(status).not.toHaveBeenCalled()
  })

  it("should send a 422 and return undefined when the payload fails validation", () => {
    const schema = z.object({ name: z.string() })
    const { reply, status } = createReplyStub()

    const result = parseOrSendValidationError(schema, { name: 123 }, reply)

    expect(result).toBeUndefined()
    expect(status).toHaveBeenCalledWith(422)
  })

  it("should rethrow errors that are not ZodErrors", () => {
    const throwingSchema = {
      parse: () => {
        throw new Error("unexpected parser crash")
      },
    } as unknown as z.ZodType<unknown>
    const { reply } = createReplyStub()

    expect(() => parseOrSendValidationError(throwingSchema, {}, reply)).toThrow(
      "unexpected parser crash",
    )
  })
})
