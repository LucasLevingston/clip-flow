export interface SendEmailInput {
  to: string
  subject: string
  body: string
}

/** Failure to send must never block the in-app notification write. */
export interface EmailSender {
  send(input: SendEmailInput): Promise<void>
}
