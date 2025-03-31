import { useEffect, useRef, useCallback } from "react";

/**
 * A React hook for handling timeouts with automatic cleanup
 * @param callback Function to be executed after the delay
 * @param delay Time in milliseconds to wait before executing the callback
 * @returns A function to cancel the timeout
 */
export function useTimeout(callback: () => void, delay: number = 0) {
  const timeoutRef = useRef<number>();

  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    timeoutRef.current = setTimeout(memoizedCallback, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [memoizedCallback, delay]);

  const cancelTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return cancelTimeout;
}
