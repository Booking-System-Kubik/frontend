import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCustomPreset } from "./useCustomPreset";

describe("useCustomPreset", () => {
  it("opens and closes modal; close resets drawing state", () => {
    const setPresets = vi.fn();
    const { result } = renderHook(() => useCustomPreset(setPresets));

    act(() => result.current.openModal());
    expect(result.current.isModalOpen).toBe(true);

    act(() => result.current.closeModal());
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.modalPolyPoints).toEqual([]);
  });

  it("addPreset shows alert when fewer than 3 points", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const setPresets = vi.fn();
    const { result } = renderHook(() => useCustomPreset(setPresets));

    act(() => result.current.addPreset());

    expect(alertSpy).toHaveBeenCalled();
    expect(setPresets).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("handleModalMouseUp clears drawing flag", () => {
    const setPresets = vi.fn();
    const { result } = renderHook(() => useCustomPreset(setPresets));
    act(() => result.current.handleModalMouseUp());
    expect(result.current.modalPolyPoints).toEqual([]);
  });
});
