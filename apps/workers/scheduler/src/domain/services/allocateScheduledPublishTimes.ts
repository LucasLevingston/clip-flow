/** Projects each "HH:mm" in `publishTimes` onto `referenceDate`'s UTC day. Entries are pre-validated (Zod) upstream. */
export function allocateScheduledPublishTimes(publishTimes: string[], referenceDate: Date): Date[] {
  return publishTimes.map((time) => {
    const [hour, minute] = time.split(":")
    const scheduled = new Date(referenceDate)
    scheduled.setUTCHours(Number(hour), Number(minute), 0, 0)
    return scheduled
  })
}
