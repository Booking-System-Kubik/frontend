import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    logger.clearHistory();
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records entries in history for each level", () => {
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");

    const history = logger.getHistory();
    expect(history).toHaveLength(4);
    expect(history.map((h) => h.level)).toEqual(["debug", "info", "warn", "error"]);
    expect(history.every((h) => h.timestamp.length > 0)).toBe(true);
  });

  it("stores optional data on entry", () => {
    logger.info("with data", { id: 1 });
    const entry = logger.getHistory()[0];
    expect(entry.message).toBe("with data");
    expect(entry.data).toEqual({ id: 1 });
  });

  it("clearHistory empties history", () => {
    logger.info("x");
    expect(logger.getHistory()).toHaveLength(1);
    logger.clearHistory();
    expect(logger.getHistory()).toHaveLength(0);
  });

  it("getHistory returns a copy", () => {
    logger.info("a");
    const a = logger.getHistory();
    const b = logger.getHistory();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});
