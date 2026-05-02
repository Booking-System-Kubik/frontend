import { describe, expect, it } from "vitest";
import { DEFAULT_FLOOR_NAME, DEFAULT_PRESETS } from "./constants";

describe("office-map constants", () => {
  it("DEFAULT_FLOOR_NAME is set", () => {
    expect(DEFAULT_FLOOR_NAME).toBe("1 этаж");
  });

  it("DEFAULT_PRESETS has square and rectangle", () => {
    expect(DEFAULT_PRESETS).toHaveLength(2);
    const names = DEFAULT_PRESETS.map((p) => p.name);
    expect(names).toContain("Квадрат");
    expect(names).toContain("Прямоугольник");
    expect(DEFAULT_PRESETS.every((p) => p.type === "rect")).toBe(true);
    expect(DEFAULT_PRESETS.every((p) => typeof p.id === "string" && p.id.length > 0)).toBe(
      true
    );
  });

  it("preset dimensions match expectations", () => {
    const square = DEFAULT_PRESETS.find((p) => p.name === "Квадрат");
    expect(square?.width).toBe(80);
    expect(square?.height).toBe(80);
    const rect = DEFAULT_PRESETS.find((p) => p.name === "Прямоугольник");
    expect(rect?.width).toBe(140);
    expect(rect?.height).toBe(80);
  });
});
