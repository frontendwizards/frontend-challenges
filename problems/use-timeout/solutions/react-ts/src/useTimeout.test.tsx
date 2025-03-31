import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimeout } from "./useTimeout";

describe("useTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it("should call the callback after the specified delay", () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should clear the timeout on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTimeout(callback, 1000));

    unmount();
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should clear the previous timeout when delay changes", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      {
        initialProps: { delay: 1000 },
      }
    );

    vi.advanceTimersByTime(500);
    rerender({ delay: 2000 });
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should clear timeout when cancel function is called", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    result.current();
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle zero delay", () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 0));

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback multiple times", () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));

    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should use the latest callback reference", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const { rerender } = renderHook(({ cb }) => useTimeout(cb, 1000), {
      initialProps: { cb: callback1 },
    });

    rerender({ cb: callback2 });
    vi.advanceTimersByTime(1000);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("should handle rapid delay changes", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      {
        initialProps: { delay: 1000 },
      }
    );

    // Rapidly change delay multiple times
    rerender({ delay: 500 });
    rerender({ delay: 200 });
    rerender({ delay: 100 });

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
