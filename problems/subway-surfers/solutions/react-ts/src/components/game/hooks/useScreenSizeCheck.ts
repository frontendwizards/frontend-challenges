import { useState, useEffect } from "react";

/**
 * Custom hook to check if the screen size is too small for the game
 * @param minWidth Minimum width required for the game
 * @returns {boolean} Whether the screen is too small
 */
export const useScreenSizeCheck = (minWidth: number): boolean => {
  // Initialize with actual screen check to avoid flicker on first render
  const [isScreenTooSmall, setIsScreenTooSmall] = useState<boolean>(() => {
    return window.innerWidth < minWidth;
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth < minWidth;
      setIsScreenTooSmall(isSmall);
    };

    // Add resize event listener
    window.addEventListener("resize", checkScreenSize);

    // Initial check (though we already set the initial value in useState)
    checkScreenSize();

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [minWidth]);

  return isScreenTooSmall;
};

export default useScreenSizeCheck;
