const debounce = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number = 600
) => {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFunction = (...args: T) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };

  const clearDebounce = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return [debouncedFunction, clearDebounce] as const;
};

export default debounce;
