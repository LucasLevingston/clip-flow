import type { FastifyReply } from "fastify"
import { ZodError, type ZodType } from "zod"
import { sendError } from "./sendError"

/** Returns the parsed body, or `undefined` after already sending a 422. */
export function parseOrSendValidationError<T>(
  schema: ZodType<T>,
  body: unknown,
  reply: FastifyReply,
): T | undefined {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      sendError(reply, {
        statusCode: 422,
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: error.flatten(),
      })
      return undefined
    }
    throw error
  }
}
