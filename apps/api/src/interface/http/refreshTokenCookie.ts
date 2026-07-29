import type { FastifyReply } from "fastify"

const COOKIE_NAME = "refresh_token"
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60

/** Refresh token travels only as an httpOnly cookie, never in a JSON body. */
export const refreshTokenCookie = {
  name: COOKIE_NAME,

  set(reply: FastifyReply, token: string): void {
    reply.setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/v1/auth",
      maxAge: MAX_AGE_SECONDS,
    })
  },

  clear(reply: FastifyReply): void {
    reply.clearCookie(COOKIE_NAME, { path: "/v1/auth" })
  },
}
