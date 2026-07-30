import type { EmailSender, SendEmailInput } from "../domain/services/EmailSender"

export class FakeEmailSender implements EmailSender {
  readonly sent: SendEmailInput[] = []
  shouldFail = false

  send(input: SendEmailInput): Promise<void> {
    if (this.shouldFail) {
      return Promise.reject(new Error("email provider unavailable"))
    }
    this.sent.push(input)
    return Promise.resolve()
  }
}
