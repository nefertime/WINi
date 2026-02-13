import { describe, it, expect, vi, beforeEach } from "vitest";

const mockWineInfo = {
  name: "Chateau Margaux",
  type: "red",
  region: "Bordeaux",
  appellation: "Margaux AOC",
  grape: "Cabernet Sauvignon",
  vintage: "2018",
  tasting_notes: "Rich and complex",
  origin_story: "Historic estate",
  food_pairings: ["Lamb", "Beef"],
};

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate };
    },
  };
});

describe("/api/wine-info", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockCreate.mockReset();
  });

  it("returns 500 when API key is missing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.resetModules();

    const { POST } = await import("@/app/api/wine-info/route");

    const request = new Request("http://localhost:3000/api/wine-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wineName: "Margaux" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(500);
  });

  it("returns wine info when API key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");

    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify(mockWineInfo) }],
    });

    vi.resetModules();
    const { POST } = await import("@/app/api/wine-info/route");

    const request = new Request("http://localhost:3000/api/wine-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wineName: "Chateau Margaux",
        wineType: "red",
        grape: "Cabernet Sauvignon",
        region: "Bordeaux",
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe("Chateau Margaux");
    expect(data.food_pairings).toHaveLength(2);
  });
});
