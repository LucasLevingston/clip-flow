/** No `timezone` yet — the batch pre-condition/cron-firing logic that needs it is EPIC-06 scope; the Scheduler Worker registers this sprint's repeatable jobs in UTC. */
export interface RegisterChannelScheduleEvent {
  channelId: string
  tenantId: string
  generationTime: string
}

/**
 * Notifies the Scheduler Worker (via the `scheduler` queue) so its repeatable jobs stay in sync
 * — ISSUE-05.F1.S1.T1, see docs/architecture/scheduler-flow.md. `registerChannel`/`removeChannel`
 * map 1:1 to the `RegisterChannelJob`/`RemoveChannelJob` commands documented there.
 */
export interface ChannelScheduleEventPublisher {
  registerChannel(event: RegisterChannelScheduleEvent): Promise<void>
  removeChannel(channelId: string, tenantId: string): Promise<void>
}
