import { createIdType } from "./createIdType";

describe("createIdType", () => {
  const TenantId = createIdType("TenantId");

  it("should create an id from a valid UUID", () => {
    const value = "8f14e45f-ceea-4e07-8422-3e6e5b5f5c2e";

    const id = TenantId.create(value);

    expect(id).toEqual({ value, brand: "TenantId" });
  });

  it("should throw when the value is not a UUID", () => {
    expect(() => TenantId.create("not-a-uuid")).toThrow(
      'Invalid TenantId: "not-a-uuid" is not a UUID',
    );
  });

  it("should generate a valid UUID id", () => {
    const id = TenantId.generate();

    expect(() => TenantId.create(id.value)).not.toThrow();
    expect(id.brand).toBe("TenantId");
  });

  it("should treat two ids with the same value as equal", () => {
    const a = TenantId.create("8f14e45f-ceea-4e07-8422-3e6e5b5f5c2e");
    const b = TenantId.create("8f14e45f-ceea-4e07-8422-3e6e5b5f5c2e");

    expect(TenantId.equals(a, b)).toBe(true);
  });

  it("should treat two ids with different values as not equal", () => {
    const a = TenantId.generate();
    const b = TenantId.generate();

    expect(TenantId.equals(a, b)).toBe(false);
  });
});
