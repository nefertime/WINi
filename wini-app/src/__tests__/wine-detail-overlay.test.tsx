import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, within } from "@testing-library/react";
import WineDetailOverlay from "@/components/WineDetailOverlay";
import { Wine } from "@/lib/types";

// Mock framer-motion
vi.mock("framer-motion", () => {
  const motionProps = new Set(["initial", "animate", "exit", "transition", "whileHover", "whileTap", "whileFocus", "whileDrag", "whileInView", "variants", "layout", "layoutId", "drag", "dragConstraints", "dragElastic", "dragMomentum"]);
  const Div = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const rest = Object.fromEntries(Object.entries(props).filter(([k]) => !motionProps.has(k)));
    return <div {...rest}>{children}</div>;
  };
  return {
    motion: { div: Div, button: Div, p: Div },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <div data-testid="animate-presence">{children}</div>,
    useReducedMotion: () => false,
  };
});

// Mock matchMedia for touch detection
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockWine: Wine = {
  id: "w1",
  name: "Sancerre",
  type: "white",
  grape: "Sauvignon Blanc",
  region: "Loire Valley, France",
  vintage: "2022",
};

const mockWineInfo = {
  name: "Sancerre",
  type: "white",
  region: "Loire Valley",
  appellation: "Sancerre AOC",
  grape: "Sauvignon Blanc",
  vintage: "2022",
  tasting_notes: "Citrus and mineral",
  origin_story: "Grown on ancient limestone soils.",
  food_pairings: ["Grilled fish", "Goat cheese"],
};

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockWineInfo),
  });
});

// Helper: get the first overlay panel to scope queries (React 19 may double-render)
function getOverlayPanel(container: HTMLElement) {
  return container.querySelector("[class*='rounded-xl']") as HTMLElement;
}

describe("WineDetailOverlay", () => {
  it("renders wine name and type", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    expect(within(panel).getByRole("heading", { name: "Sancerre" })).toBeInTheDocument();
    expect(within(panel).getByText("white")).toBeInTheDocument();
  });

  it("renders grape and region info line", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    expect(within(panel).getByText(/Sauvignon Blanc · Loire Valley, France/)).toBeInTheDocument();
  });

  it("renders pairing reason when provided", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        pairingReason="Crisp acidity complements grilled salmon."
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(within(panel).getByText("Why this pairing works")).toBeInTheDocument();
    expect(within(panel).getByText("Crisp acidity complements grilled salmon.")).toBeInTheDocument();
  });

  it("does not render pairing reason when not provided", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    expect(within(panel).queryByText("Why this pairing works")).not.toBeInTheDocument();
  });

  it("renders origin story after API loads", async () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    await waitFor(() => {
      expect(within(panel).getByText("Origin")).toBeInTheDocument();
    });
    expect(within(panel).getByText("Grown on ancient limestone soils.")).toBeInTheDocument();
  });

  it("does not render Region & Appellation section (removed)", async () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    await waitFor(() => expect(within(panel).getByText("Origin")).toBeInTheDocument());
    expect(within(panel).queryByText("Region & Appellation")).not.toBeInTheDocument();
  });

  it("does not render Tasting Notes section (removed)", async () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    await waitFor(() => expect(within(panel).getByText("Origin")).toBeInTheDocument());
    expect(within(panel).queryByText("Tasting Notes")).not.toBeInTheDocument();
  });

  it("renders Classic Pairings after API loads", async () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    await waitFor(() => expect(within(panel).getByText("Origin")).toBeInTheDocument());
    expect(within(panel).getByText("Classic Pairings")).toBeInTheDocument();
    expect(within(panel).getByText("Grilled fish")).toBeInTheDocument();
    expect(within(panel).getByText("Goat cheese")).toBeInTheDocument();
  });

  it("renders Search on Alko button", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    expect(within(panel).getByRole("button", { name: "Search on Alko" })).toBeInTheDocument();
  });

  it("shows fallback message when API fails", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    await waitFor(() => {
      expect(within(panel).getByText(/Wine details unavailable/)).toBeInTheDocument();
    });
  });
});

describe("WineDetailOverlay — responsive (CSS tokens)", () => {
  it("uses CSS token for panel width when anchored", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 50, y: 200, right: 350 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.width).toBe("var(--overlay-detail-w)");
  });

  it("uses CSS token for max height", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 50, y: 200, right: 350 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.maxHeight).toBe("var(--overlay-detail-max-h)");
  });

  it("uses CSS clamp for anchor positioning", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 400, y: 300, right: 700 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.left).toContain("clamp");
    expect(panel.style.top).toContain("clamp");
  });

  it("uses CSS token for content padding", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const scrollDiv = container.querySelector("[class*='overflow-y-auto']") as HTMLElement;
    expect(scrollDiv.style.padding).toContain("var(--space-overlay-pad");
  });

  it("has no backdrop element — panel floats directly", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 800, y: 200, right: 1100 }}
        onClose={vi.fn()}
      />
    );
    const backdrop = container.querySelector("[class*='fixed inset-0']:not([class*='pointer-events-none'])");
    expect(backdrop).toBeNull();
  });

  it("renders all restored sections after API loads", async () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        pairingReason="Pairs beautifully."
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);

    await waitFor(() => expect(within(panel).getByText("Origin")).toBeInTheDocument());

    expect(within(panel).getByText("white")).toBeInTheDocument();
    expect(within(panel).getByRole("heading", { name: "Sancerre" })).toBeInTheDocument();
    expect(within(panel).getByText("Why this pairing works")).toBeInTheDocument();
    expect(within(panel).getByText("Pairs beautifully.")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Search on Alko" })).toBeInTheDocument();

    expect(within(panel).getByText("Classic Pairings")).toBeInTheDocument();
    expect(within(panel).queryByText("Tasting Notes")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Region & Appellation")).not.toBeInTheDocument();
  });
});
