import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import WineDetailOverlay from "@/components/WineDetailOverlay";
import { Wine } from "@/lib/types";

// Mock framer-motion
vi.mock("framer-motion", () => {
  const Div = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const {
      initial, animate, exit, transition, whileHover,
      whileTap, whileFocus, whileDrag, whileInView,
      variants, layout, layoutId, drag, dragConstraints,
      dragElastic, dragMomentum,
      ...rest
    } = props;
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

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: height, writable: true, configurable: true });
}

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

  it("renders Buy this wine button", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const panel = getOverlayPanel(container);
    expect(within(panel).getByRole("button", { name: "Buy this wine" })).toBeInTheDocument();
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

describe("WineDetailOverlay — mobile (390x844)", () => {
  beforeEach(() => setViewport(390, 844));

  it("uses mobile-width panel (vw - 16 = 374px)", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 50, y: 200, right: 350 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.width).toBe("374px");
  });

  it("positions at top:40 left:8 on mobile", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 50, y: 200, right: 350 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.top).toBe("40px");
    expect(panel.style.left).toBe("8px");
  });

  it("uses tighter padding on mobile", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const scrollDiv = container.querySelector("[class*='overflow-y-auto']") as HTMLElement;
    expect(scrollDiv.style.padding).toBe("20px 20px 24px");
  });

  it("sets max height to vh - 80 = 764px", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 50, y: 200, right: 350 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.maxHeight).toBe("764px");
  });
});

describe("WineDetailOverlay — iPad (820x1180)", () => {
  beforeEach(() => setViewport(820, 1180));

  it("uses desktop-style panel width (320px)", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 400, y: 300, right: 700 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.width).toBe("320px");
  });

  it("uses desktop padding", () => {
    const { container } = render(<WineDetailOverlay wine={mockWine} onClose={vi.fn()} />);
    const scrollDiv = container.querySelector("[class*='overflow-y-auto']") as HTMLElement;
    expect(scrollDiv.style.padding).toBe("28px 28px 32px");
  });

  it("caps max height at 500px", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 400, y: 300, right: 700 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.maxHeight).toBe("500px");
  });
});

describe("WineDetailOverlay — desktop (1440x900)", () => {
  beforeEach(() => setViewport(1440, 900));

  it("uses max panel width of 420px", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 800, y: 200, right: 1100 }}
        onClose={vi.fn()}
      />
    );
    const panel = getOverlayPanel(container);
    expect(panel.style.width).toBe("420px");
  });

  it("has no backdrop element — panel floats directly", () => {
    const { container } = render(
      <WineDetailOverlay
        wine={mockWine}
        anchorPosition={{ x: 800, y: 200, right: 1100 }}
        onClose={vi.fn()}
      />
    );
    // Drag constraint div exists but has pointer-events-none — not a real backdrop
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
    expect(within(panel).getByRole("button", { name: "Buy this wine" })).toBeInTheDocument();

    expect(within(panel).getByText("Classic Pairings")).toBeInTheDocument();
    expect(within(panel).queryByText("Tasting Notes")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Region & Appellation")).not.toBeInTheDocument();
  });
});
