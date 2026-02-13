import { describe, it, expect, beforeEach } from "vitest";
import { getSessions, saveSession, getSession, deleteSession, generateId } from "@/lib/storage";
import { Session } from "@/lib/types";

const mockSession: Session = {
  id: "test-123",
  timestamp: Date.now(),
  dishes: [{ id: "d1", name: "Test Dish", description: "A test", category: "meat" }],
  wines: [{ id: "w1", name: "Test Wine", type: "red", grape: "Merlot", region: "Bordeaux", vintage: "2020" }],
  pairings: [{ dish_id: "d1", wine_id: "w1", score: 0.9, reason: "Great", detailed_reason: "Really great" }],
  selections: [],
  preview: "Test Dish",
};

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("returns empty array when no sessions stored", () => {
    expect(getSessions()).toEqual([]);
  });

  it("saves and retrieves a session", () => {
    saveSession(mockSession);
    const sessions = getSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe("test-123");
  });

  it("retrieves a session by id", () => {
    saveSession(mockSession);
    const session = getSession("test-123");
    expect(session).not.toBeNull();
    expect(session!.id).toBe("test-123");
  });

  it("returns null for non-existent session", () => {
    expect(getSession("nonexistent")).toBeNull();
  });

  it("deletes a session", () => {
    saveSession(mockSession);
    deleteSession("test-123");
    expect(getSessions()).toHaveLength(0);
  });

  it("updates existing session instead of duplicating", () => {
    saveSession(mockSession);
    saveSession({ ...mockSession, preview: "Updated" });
    const sessions = getSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].preview).toBe("Updated");
  });

  it("filters out expired sessions (>7 days)", () => {
    const expired: Session = {
      ...mockSession,
      id: "old",
      timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem("wini_sessions", JSON.stringify([expired]));
    expect(getSessions()).toHaveLength(0);
  });

  it("generateId returns unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
