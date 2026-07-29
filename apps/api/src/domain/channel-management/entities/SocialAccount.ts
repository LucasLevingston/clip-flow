import type { SocialAccountPlatform, SocialAccountStatus } from "../types"

export interface SocialAccountProps {
  id: string
  channelId: string
  platform: SocialAccountPlatform
  externalAccountId: string
  status: SocialAccountStatus
  encryptedTokens: Buffer
  tokenKeyVersion: number
  refreshExpiresAt: Date | null
  createdAt: Date
}

/** Aggregate root of its own — token lifecycle is independent of Channel (ADR-0011). */
export class SocialAccount {
  private constructor(private readonly props: SocialAccountProps) {}

  static create(props: SocialAccountProps): SocialAccount {
    return new SocialAccount(props)
  }

  get id(): string {
    return this.props.id
  }

  get channelId(): string {
    return this.props.channelId
  }

  get platform(): SocialAccountPlatform {
    return this.props.platform
  }

  get externalAccountId(): string {
    return this.props.externalAccountId
  }

  get status(): SocialAccountStatus {
    return this.props.status
  }

  get encryptedTokens(): Buffer {
    return this.props.encryptedTokens
  }

  get tokenKeyVersion(): number {
    return this.props.tokenKeyVersion
  }

  get refreshExpiresAt(): Date | null {
    return this.props.refreshExpiresAt
  }

  get createdAt(): Date {
    return this.props.createdAt
  }
}
