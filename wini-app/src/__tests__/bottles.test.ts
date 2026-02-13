import { describe, it, expect } from "vitest";
import { BOTTLES, isSparklingBottle } from "@/lib/bottles";

describe("bottles", () => {
  it("has bottles defined", () => {
    expect(BOTTLES.length).toBeGreaterThan(0);
    for (const bottle of BOTTLES) {
      expect(bottle.name).toBeTruthy();
      expect(bottle.src).toContain("/bottles/normalized/");
      expect(["red", "white", "both", "sparkling", "rosé"]).toContain(bottle.type);
    }
  });

  it("all bottle srcs end with -full.png", () => {
    for (const bottle of BOTTLES) {
      expect(bottle.src).toMatch(/-full\.png$/);
    }
  });

  it("identifies sparkling bottles correctly", () => {
    expect(isSparklingBottle("Gold Label")).toBe(true);
    expect(isSparklingBottle("Chardonnay Reserve")).toBe(true);
    expect(isSparklingBottle("gold something")).toBe(true);
    expect(isSparklingBottle("Delamotte")).toBe(true);
    expect(isSparklingBottle("Moët Brut Impérial")).toBe(true);
    expect(isSparklingBottle("Hattingley Classic Reserve")).toBe(true);
    expect(isSparklingBottle("Red Label")).toBe(false);
    expect(isSparklingBottle("Shiraz Cabernet")).toBe(false);
    expect(isSparklingBottle("Minarete")).toBe(false);
  });
});
