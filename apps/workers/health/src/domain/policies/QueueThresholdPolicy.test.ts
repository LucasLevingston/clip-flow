import { evaluateQueueAlert } from "./QueueThresholdPolicy"

describe("evaluateQueueAlert", () => {
  it("should return null when waiting is under threshold and failure rate is low", () => {
    const alert = evaluateQueueAlert({
      waiting: 10,
      recentFailureRate: 0.02,
      consecutiveCyclesOverThreshold: 0,
    })

    expect(alert).toBeNull()
  })

  it("should return null when waiting is over threshold but not sustained for 5 cycles yet", () => {
    const alert = evaluateQueueAlert({
      waiting: 60,
      recentFailureRate: 0,
      consecutiveCyclesOverThreshold: 4,
    })

    expect(alert).toBeNull()
  })

  it("should alert SUSTAINED_BACKLOG when waiting is over 50 for 5+ consecutive cycles", () => {
    const alert = evaluateQueueAlert({
      waiting: 60,
      recentFailureRate: 0,
      consecutiveCyclesOverThreshold: 5,
    })

    expect(alert).toEqual({ reason: "SUSTAINED_BACKLOG", severity: "NORMAL" })
  })

  it("should alert HIGH_FAILURE_RATE when recent failure rate exceeds 10%", () => {
    const alert = evaluateQueueAlert({
      waiting: 0,
      recentFailureRate: 0.11,
      consecutiveCyclesOverThreshold: 0,
    })

    expect(alert).toEqual({ reason: "HIGH_FAILURE_RATE", severity: "HIGH" })
  })

  it("should prioritize HIGH_FAILURE_RATE over SUSTAINED_BACKLOG when both apply", () => {
    const alert = evaluateQueueAlert({
      waiting: 60,
      recentFailureRate: 0.5,
      consecutiveCyclesOverThreshold: 5,
    })

    expect(alert).toEqual({ reason: "HIGH_FAILURE_RATE", severity: "HIGH" })
  })
})
