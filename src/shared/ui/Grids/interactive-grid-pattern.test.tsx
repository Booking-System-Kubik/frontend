import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InteractiveGridPattern } from "./interactive-grid-pattern";

describe("InteractiveGridPattern", () => {
  it("renders svg with width/height from grid size", () => {
    const { container } = render(
      <InteractiveGridPattern squares={[3, 2]} width={50} height={40} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "150");
    expect(svg).toHaveAttribute("height", "80");
  });

  it("uses default 24x24 squares and cell size 40", () => {
    const { container } = render(<InteractiveGridPattern />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", String(24 * 40));
    expect(svg).toHaveAttribute("height", String(24 * 40));
  });

  it("expands grid via expandGrid", () => {
    const { container } = render(
      <InteractiveGridPattern
        squares={[2, 2]}
        width={10}
        height={10}
        expandGrid={{ left: 1, right: 1, top: 1, bottom: 1 }}
      />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "40");
  });

  it("applies custom className", () => {
    const { container } = render(
      <InteractiveGridPattern className="custom-grid" data-testid="igp" />
    );
    expect(container.querySelector("svg")).toHaveClass("custom-grid");
  });

  it("does not start trail timer when trailMs is 0", () => {
    const spy = vi.spyOn(window, "setInterval");
    render(<InteractiveGridPattern trailMs={0} squares={[2, 2]} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("starts interval when trail enabled", () => {
    const spy = vi.spyOn(window, "setInterval");
    render(<InteractiveGridPattern trailMs={400} squares={[2, 2]} />);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe("interaction", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("isometric hover shows cube polygons", async () => {
      const { container } = render(
        <InteractiveGridPattern isometric squares={[2, 2]} width={32} height={32} trailMs={0} />
      );
      const hit = container.querySelector('rect[fill="transparent"]');
      expect(hit).toBeTruthy();
      await user.hover(hit!);
      expect(container.querySelectorAll("polygon").length).toBeGreaterThan(0);
      await user.unhover(hit!);
    });

    it("non-isometric hover highlights active cell", async () => {
      const { container } = render(
        <InteractiveGridPattern isometric={false} squares={[2, 2]} width={40} height={40} trailMs={0} />
      );
      const hit = container.querySelector('rect[fill="transparent"]');
      expect(hit).toBeTruthy();
      await user.hover(hit!);
      expect(container.querySelector(".fill-blue-500")).toBeInTheDocument();
    });
  });

  it("forward arbitrary svg props", () => {
    const { container } = render(
      <InteractiveGridPattern role="img" aria-label="Grid" squares={[1, 1]} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "Grid");
  });
});
