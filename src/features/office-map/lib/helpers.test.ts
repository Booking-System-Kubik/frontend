import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GRID_SIZE,
  clamp,
  clientToCanvasCoords,
  createRoomFromPreset,
  genId,
  snapPointToGrid,
  snapToGrid,
} from "./helpers";
import type { Preset } from "../model/types";

describe("clamp", () => {
  it("clamps to range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("snapToGrid / snapPointToGrid", () => {
  it("snaps to default GRID_SIZE", () => {
    expect(snapToGrid(10)).toBe(GRID_SIZE);
    expect(snapToGrid(9)).toBe(0);
  });

  it("respects custom grid size", () => {
    expect(snapToGrid(13, 5)).toBe(15);
    expect(snapToGrid(12, 5)).toBe(10);
  });

  it("snaps both axes", () => {
    expect(snapPointToGrid(11, 29)).toEqual({ x: GRID_SIZE, y: GRID_SIZE });
  });
});

describe("genId", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:00.000Z"));
    vi.spyOn(Math, "random").mockReturnValue(0.42424242);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("prefixes id", () => {
    expect(genId("room_")).toMatch(/^room_/);
  });

  it("produces stable output for mocked time/random", () => {
    expect(genId("p_")).toBe(genId("p_"));
  });
});

describe("clientToCanvasCoords", () => {
  it("falls back to raw client coords without svg", () => {
    expect(
      clientToCanvasCoords({
        clientX: 100,
        clientY: 50,
        svgElement: null,
        offset: { x: 10, y: 20 },
        zoom: 2,
      })
    ).toEqual({ x: 100, y: 50 });
  });

  it("transforms using bbox and offset/zoom", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 200,
      width: 800,
      height: 600,
      right: 900,
      bottom: 800,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    });

    expect(
      clientToCanvasCoords({
        clientX: 150,
        clientY: 250,
        svgElement: svg,
        offset: { x: 10, y: 20 },
        zoom: 2,
      })
    ).toEqual({ x: 20, y: 15 });
  });
});

describe("createRoomFromPreset", () => {
  const fixedId = () => "id-fixed";

  it("creates rect room centered at point", () => {
    const preset: Preset = {
      id: "p1",
      name: "R",
      type: "rect",
      width: 100,
      height: 60,
    };
    const room = createRoomFromPreset(preset, 200, 100, fixedId);
    expect(room.id).toBe("id-fixed");
    expect(room.name).toBe("R");
    expect(room.x).toBe(150);
    expect(room.y).toBe(70);
    expect(room.width).toBe(100);
    expect(room.height).toBe(60);
    expect(room.shape).toBeUndefined();
  });

  it("uses default rect size when missing", () => {
    const preset: Preset = { id: "p", name: "R", type: "rect" };
    const room = createRoomFromPreset(preset, 0, 0, fixedId);
    expect(room.width).toBe(60);
    expect(room.height).toBe(60);
  });

  it("creates polygon room with bounding box and shape", () => {
    const preset: Preset = {
      id: "p2",
      name: "Poly",
      type: "poly",
      poly: [
        [0, 0],
        [80, 0],
        [80, 40],
        [0, 40],
      ],
    };
    const room = createRoomFromPreset(preset, 100, 50, fixedId);
    expect(room.width).toBe(80);
    expect(room.height).toBe(40);
    expect(room.x).toBe(60);
    expect(room.y).toBe(30);
    expect(room.shape).toEqual(preset.poly);
  });

  it("handles degenerate poly with fallback size", () => {
    const preset: Preset = {
      id: "p3",
      name: "P",
      type: "poly",
      poly: [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    };
    const room = createRoomFromPreset(preset, 0, 0, fixedId);
    expect(room.width).toBe(50);
    expect(room.height).toBe(50);
  });
});
