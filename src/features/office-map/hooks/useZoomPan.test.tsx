import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { useZoomPan } from "./useZoomPan";

function mockSvgRect(left: number, top: number) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    left,
    top,
    width: 400,
    height: 300,
    right: left + 400,
    bottom: top + 300,
    x: left,
    y: top,
    toJSON: () => ({}),
  });
  return svg;
}

describe("useZoomPan", () => {
  it("initial state", () => {
    const { result } = renderHook(() => useZoomPan());
    expect(result.current.zoom).toBe(1);
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it("zoomIn / zoomOut stay within bounds", () => {
    const { result } = renderHook(() => useZoomPan());
    act(() => {
      for (let i = 0; i < 50; i++) result.current.zoomIn();
    });
    expect(result.current.zoom).toBe(3);
    act(() => {
      for (let i = 0; i < 80; i++) result.current.zoomOut();
    });
    expect(result.current.zoom).toBe(0.3);
  });

  it("resetView restores defaults", () => {
    const { result } = renderHook(() => useZoomPan());
    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
    });
    act(() => {
      result.current.resetView();
    });
    expect(result.current.zoom).toBe(1);
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it("handleWheel updates zoom and keeps focal point stable", () => {
    const { result } = renderHook(() => useZoomPan());
    const svg = mockSvgRect(100, 200);
    const ref = { current: svg };

    const wheel = (deltaY: number) =>
      ({
        preventDefault: vi.fn(),
        deltaY,
        clientX: 200,
        clientY: 250,
      }) as unknown as React.WheelEvent;

    const beforeZoom = result.current.zoom;
    act(() => {
      result.current.handleWheel(wheel(500), ref);
    });
    expect(result.current.zoom).toBeLessThan(beforeZoom);
    expect(result.current.offset.x).not.toBe(0);
  });

  it("handleWheel without svg only changes zoom", () => {
    const { result } = renderHook(() => useZoomPan());
    const ref = { current: null };
    act(() => {
      result.current.handleWheel(
        { preventDefault: vi.fn(), deltaY: 100, clientX: 0, clientY: 0 } as unknown as React.WheelEvent,
        ref
      );
    });
    expect(result.current.zoom).not.toBe(1);
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it("pan with middle button updates offset", () => {
    const { result } = renderHook(() => useZoomPan());
    act(() => {
      result.current.startPan(100, 100, 2, false);
      result.current.handlePanMove(150, 130);
    });
    expect(result.current.offset).toEqual({ x: 50, y: 30 });
    act(() => {
      result.current.stopPan();
      result.current.handlePanMove(200, 200);
    });
    expect(result.current.offset).toEqual({ x: 50, y: 30 });
  });

  it("pan with primary button requires shift", () => {
    const { result } = renderHook(() => useZoomPan());
    act(() => {
      result.current.startPan(0, 0, 0, false);
      result.current.handlePanMove(10, 10);
    });
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
    act(() => {
      result.current.startPan(0, 0, 0, true);
      result.current.handlePanMove(5, 5);
    });
    expect(result.current.offset).toEqual({ x: 5, y: 5 });
  });
});
