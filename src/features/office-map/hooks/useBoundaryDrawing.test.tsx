import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBoundaryDrawing } from "./useBoundaryDrawing";

describe("useBoundaryDrawing", () => {
  it("starts in drawing mode with empty boundary", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    expect(result.current.isDrawingBoundary).toBe(true);
    expect(result.current.boundaryClosed).toBe(false);
    expect(result.current.boundaryPoints).toEqual([]);
  });

  it("adds points while drawing", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    act(() => {
      result.current.addBoundaryPoint([0, 0]);
      result.current.addBoundaryPoint([10, 0]);
    });
    expect(result.current.boundaryPoints).toEqual([
      [0, 0],
      [10, 0],
    ]);
  });

  it("closes boundary when >= 3 points", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    act(() => result.current.addBoundaryPoint([0, 0]));
    act(() => result.current.addBoundaryPoint([10, 0]));
    act(() => result.current.addBoundaryPoint([5, 10]));
    act(() => result.current.closeBoundary());
    expect(result.current.boundaryClosed).toBe(true);
    expect(result.current.isDrawingBoundary).toBe(false);
  });

  it("does not close with fewer than 3 points", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    act(() => {
      result.current.addBoundaryPoint([0, 0]);
      result.current.addBoundaryPoint([10, 0]);
      result.current.closeBoundary();
    });
    expect(result.current.boundaryClosed).toBe(false);
  });

  it("resetBoundary clears state", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    act(() => {
      result.current.addBoundaryPoint([1, 1]);
      result.current.addBoundaryPoint([2, 2]);
      result.current.addBoundaryPoint([3, 3]);
      result.current.closeBoundary();
      result.current.resetBoundary();
    });
    expect(result.current.boundaryPoints).toEqual([]);
    expect(result.current.boundaryClosed).toBe(false);
    expect(result.current.isDrawingBoundary).toBe(true);
  });

  it("forceCloseBoundary sets closed without point count check", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    act(() => {
      result.current.addBoundaryPoint([0, 0]);
      result.current.forceCloseBoundary();
    });
    expect(result.current.boundaryClosed).toBe(true);
    expect(result.current.isDrawingBoundary).toBe(false);
  });

  it("does not add points after boundary is closed", () => {
    const { result } = renderHook(() => useBoundaryDrawing());
    act(() => result.current.addBoundaryPoint([0, 0]));
    act(() => result.current.addBoundaryPoint([10, 0]));
    act(() => result.current.addBoundaryPoint([5, 10]));
    act(() => result.current.closeBoundary());
    act(() => result.current.addBoundaryPoint([99, 99]));
    expect(result.current.boundaryPoints).toHaveLength(3);
  });
});
