export interface InsufficientPoolAlert {
  channelId: string
  tenantId: string
  requiredCount: number
  availableCount: number
}

/** Produces onto the `notification` queue — FA1, admin needs to know the pool ran dry. */
export interface AlertPublisher {
  publishInsufficientPool(alert: InsufficientPoolAlert): Promise<void>
}
