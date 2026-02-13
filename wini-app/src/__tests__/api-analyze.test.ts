import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

describe("/api/analyze", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockCreate.mockReset();
  });

  it("returns 500 when API key is not configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.resetModules();

    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: [], text: "test" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain("ANTHROPIC_API_KEY");
  });

  it("returns pairing data when API key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");

    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            dishes: [{ id: "d1", name: "Steak", description: "Grilled", category: "meat" }],
            wines: [{ id: "w1", name: "Merlot", type: "red", grape: "Merlot", region: "Bordeaux", vintage: "2020" }],
            pairings: [{ dish_id: "d1", wine_id: "w1", score: 0.95, reason: "Classic", detailed_reason: "Classic pairing" }],
          }),
        },
      ],
    });

    vi.resetModules();
    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: ["data:image/jpeg;base64,/9j/4AAQ"],
        text: "test menu",
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.dishes).toHaveLength(1);
    expect(data.wines).toHaveLength(1);
    expect(data.pairings).toHaveLength(1);
  });
});
