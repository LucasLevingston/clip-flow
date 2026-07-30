import type { EmailSender, SendEmailInput } from "../domain/services/EmailSender"

export class ResendEmailAdapter implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly fromAddress: string,
  ) {}

  async send(input: SendEmailInput): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: input.to,
        subject: input.subject,
        text: input.body,
      }),
    })
    if (!response.ok) {
      throw new Error(`Resend API responded with status ${response.status}`)
    }
  }
}
