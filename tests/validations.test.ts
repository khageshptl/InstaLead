import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  searchInputSchema,
  passwordSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  it("validates registration input", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "weak",
    });
    expect(result.success).toBe(false);
  });

  it("validates login input", () => {
    const result = loginSchema.safeParse({
      email: "jane@example.com",
      password: "any",
    });
    expect(result.success).toBe(true);
  });

  it("validates search input types", () => {
    const result = searchInputSchema.safeParse({
      inputType: "INSTAGRAM_USERNAME",
      inputValue: "acmecorp",
    });
    expect(result.success).toBe(true);
  });

  it("requires password complexity", () => {
    expect(passwordSchema.safeParse("Abcd1234").success).toBe(true);
    expect(passwordSchema.safeParse("nouppercase1").success).toBe(false);
    expect(passwordSchema.safeParse("NOLOWERCASE1").success).toBe(false);
    expect(passwordSchema.safeParse("NoNumbers").success).toBe(false);
  });
});
