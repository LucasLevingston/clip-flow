import { PublishSlotAllocator } from "./PublishSlotAllocator"

describe("PublishSlotAllocator", () => {
  it("should distribute 1 video at the start of the window", () => {
    const slots = new PublishSlotAllocator().allocate(1)

    expect(slots.map((slot) => slot.format())).toEqual(["08:00"])
  })

  it("should distribute 4 videos evenly across the window", () => {
    const slots = new PublishSlotAllocator().allocate(4)

    expect(slots.map((slot) => slot.format())).toEqual(["08:00", "11:30", "15:00", "18:30"])
  })

  it("should never schedule a slot past the window end", () => {
    const slots = new PublishSlotAllocator().allocate(10)

    for (const slot of slots) {
      expect(slot.toMinutesSinceMidnight()).toBeLessThanOrEqual(22 * 60)
    }
  })
})
