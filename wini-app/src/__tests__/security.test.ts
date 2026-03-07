import { describe, it, expect } from "vitest";
import {
  registerSchema,
  profileUpdateSchema,
  passwordChangeSchema,
  forgotPasswordSchema,
  analyzeSchema,
  translateSchema,
  wineInfoSchema,
  checkoutSchema,
  consentSchema,
  deleteAccountSchema,
  parseBody,
} from "@/lib/validation";

describe("Zod validation schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid registration", () => {
      const result = parseBody(registerSchema, {
        email: "test@example.com",
        password: "securepass123",
        name: "Alice",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = parseBody(registerSchema, {
        email: "not-an-email",
        password: "securepass123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = parseBody(registerSchema, {
        email: "test@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password over 128 chars", () => {
      const result = parseBody(registerSchema, {
        email: "test@example.com",
        password: "a".repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it("rejects name over 100 chars", () => {
      const result = parseBody(registerSchema, {
        email: "test@example.com",
        password: "securepass123",
        name: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("allows registration without name", () => {
      const result = parseBody(registerSchema, {
        email: "test@example.com",
        password: "securepass123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("profileUpdateSchema", () => {
    it("accepts valid profile update", () => {
      const result = parseBody(profileUpdateSchema, { name: "Bob", age: 25 });
      expect(result.success).toBe(true);
    });

    it("rejects age under 18", () => {
      const result = parseBody(profileUpdateSchema, { age: 17 });
      expect(result.success).toBe(false);
    });

    it("rejects age over 120", () => {
      const result = parseBody(profileUpdateSchema, { age: 121 });
      expect(result.success).toBe(false);
    });

    it("accepts null age (clearing field)", () => {
      const result = parseBody(profileUpdateSchema, { age: null });
      expect(result.success).toBe(true);
    });
  });

  describe("passwordChangeSchema", () => {
    it("accepts valid password change", () => {
      const result = parseBody(passwordChangeSchema, {
        currentPassword: "oldpass123",
        newPassword: "newpass456",
      });
      expect(result.success).toBe(true);
    });

    it("rejects new password under 8 chars", () => {
      const result = parseBody(passwordChangeSchema, {
        currentPassword: "oldpass123",
        newPassword: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("accepts valid email", () => {
      const result = parseBody(forgotPasswordSchema, { email: "user@example.com" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = parseBody(forgotPasswordSchema, { email: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  describe("analyzeSchema", () => {
    it("accepts valid analyze request", () => {
      const result = parseBody(analyzeSchema, {
        images: ["data:image/jpeg;base64,/9j/4AAQ"],
        text: "What wine goes with this?",
      });
      expect(result.success).toBe(true);
    });

    it("rejects more than 10 images", () => {
      const result = parseBody(analyzeSchema, {
        images: Array(11).fill("data:image/jpeg;base64,abc"),
      });
      expect(result.success).toBe(false);
    });

    it("rejects text over 500 chars", () => {
      const result = parseBody(analyzeSchema, {
        images: [],
        text: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("translateSchema", () => {
    it("accepts valid translate request", () => {
      const result = parseBody(translateSchema, {
        data: { dishes: [], wines: [] },
        sourceLanguage: "fi",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing sourceLanguage", () => {
      const result = parseBody(translateSchema, { data: {} });
      expect(result.success).toBe(false);
    });
  });

  describe("wineInfoSchema", () => {
    it("accepts valid wine info request", () => {
      const result = parseBody(wineInfoSchema, {
        wineName: "Chateau Margaux",
        wineType: "red",
        grape: "Cabernet Sauvignon",
        region: "Bordeaux",
      });
      expect(result.success).toBe(true);
    });

    it("rejects wineName over 200 chars", () => {
      const result = parseBody(wineInfoSchema, {
        wineName: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("requires wineName", () => {
      const result = parseBody(wineInfoSchema, {});
      expect(result.success).toBe(false);
    });
  });

  describe("checkoutSchema", () => {
    it("accepts valid Stripe price ID", () => {
      const result = parseBody(checkoutSchema, { priceId: "price_1234abc" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid price ID format", () => {
      const result = parseBody(checkoutSchema, { priceId: "invalid_id" });
      expect(result.success).toBe(false);
    });
  });

  describe("consentSchema", () => {
    it("accepts valid consent", () => {
      const result = parseBody(consentSchema, {
        type: "anonymized_analytics",
        granted: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown consent type", () => {
      const result = parseBody(consentSchema, {
        type: "marketing",
        granted: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("deleteAccountSchema", () => {
    it("accepts valid deletion request", () => {
      const result = parseBody(deleteAccountSchema, {
        password: "mypassword",
        confirmation: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects without confirmation", () => {
      const result = parseBody(deleteAccountSchema, {
        password: "mypassword",
        confirmation: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("parseBody helper", () => {
    it("returns descriptive error messages", () => {
      const result = parseBody(registerSchema, { email: "bad", password: "x" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("email");
        expect(result.error).toContain("password");
      }
    });
  });
});
