import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./validation";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(() =>
      loginSchema.parse({ email: "user@test.dev", password: "secret12" })
    ).not.toThrow();
  });

  it("rejects empty email", () => {
    const r = loginSchema.safeParse({ email: "", password: "secret12" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const r = loginSchema.safeParse({ email: "not-an-email", password: "secret12" });
    expect(r.success).toBe(false);
  });

  it("rejects short password", () => {
    const r = loginSchema.safeParse({ email: "a@b.co", password: "12345" });
    expect(r.success).toBe(false);
  });

  it("rejects password longer than 100 chars", () => {
    const r = loginSchema.safeParse({
      email: "a@b.co",
      password: "x".repeat(101),
    });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    email: "new@test.dev",
    password: "Aa1aaaa",
    fullName: "Иван Иванов",
    position: "Developer",
    organizationId: 1 as number | undefined,
    organizationName: undefined as string | undefined,
    locationId: 2 as number | undefined,
  };

  it("accepts valid payload with existing org + location", () => {
    const r = registerSchema.safeParse({
      ...base,
      organizationId: 1,
      locationId: 2,
    });
    expect(r.success).toBe(true);
  });

  it("accepts new org when organizationName provided", () => {
    const r = registerSchema.safeParse({
      ...base,
      organizationId: undefined,
      organizationName: "ООО Рога",
      locationId: undefined,
    });
    expect(r.success).toBe(true);
  });

  it("rejects when neither org nor new org name", () => {
    const r = registerSchema.safeParse({
      ...base,
      organizationId: undefined,
      organizationName: undefined,
      locationId: undefined,
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.organizationId?.length).toBeGreaterThan(0);
    }
  });

  it("rejects existing org without locationId", () => {
    const r = registerSchema.safeParse({
      ...base,
      organizationId: 5,
      locationId: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("rejects blank organizationName when creating org", () => {
    const r = registerSchema.safeParse({
      ...base,
      organizationId: undefined,
      organizationName: "   ",
      locationId: undefined,
    });
    expect(r.success).toBe(false);
  });

  it("requires uppercase, lowercase, digit in password", () => {
    expect(registerSchema.safeParse({ ...base, password: "aaaaaa1" }).success).toBe(
      false
    );
    expect(registerSchema.safeParse({ ...base, password: "AAAAAA1" }).success).toBe(
      false
    );
    expect(registerSchema.safeParse({ ...base, password: "AaAaaaa" }).success).toBe(
      false
    );
  });

  it("requires fullName length >= 5", () => {
    const r = registerSchema.safeParse({ ...base, fullName: "Иван" });
    expect(r.success).toBe(false);
  });
});
