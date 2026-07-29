import { InvalidTimeOfDayError } from "../errors/InvalidTimeOfDayError"
import { TimeOfDay } from "./TimeOfDay"

describe("TimeOfDay", () => {
  it("should parse a valid HH:mm string", () => {
    const time = TimeOfDay.parse("09:30")

    expect(time.hour).toBe(9)
    expect(time.minute).toBe(30)
  })

  it("should format back to HH:mm with zero-padding", () => {
    expect(TimeOfDay.create(6, 5).format()).toBe("06:05")
  })

  it("should compute minutes since midnight", () => {
    expect(TimeOfDay.create(1, 30).toMinutesSinceMidnight()).toBe(90)
  })

  it("should reject an out-of-range hour", () => {
    expect(() => TimeOfDay.create(24, 0)).toThrow(InvalidTimeOfDayError)
  })

  it("should reject an out-of-range minute", () => {
    expect(() => TimeOfDay.create(0, 60)).toThrow(InvalidTimeOfDayError)
  })

  it("should reject a malformed string", () => {
    expect(() => TimeOfDay.parse("9:30")).toThrow(InvalidTimeOfDayError)
    expect(() => TimeOfDay.parse("not-a-time")).toThrow(InvalidTimeOfDayError)
  })
})
