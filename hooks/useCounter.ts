import { useCallback, useState } from "preact/hooks";

interface CounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

/**
 * 计数器Hook
 * @param initialValue 初始值
 * @param options 选项配置
 * @returns { count, increment, decrement, reset, set }
 */
export function useCounter(
  initialValue: number = 0,
  options: CounterOptions = {},
) {
  const { min, max, step = 1 } = options;
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => {
      const newValue = prev + step;
      return max !== undefined ? Math.min(newValue, max) : newValue;
    });
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount((prev) => {
      const newValue = prev - step;
      return min !== undefined ? Math.max(newValue, min) : newValue;
    });
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback((value: number) => {
    setCount((_prev) => {
      let newValue = value;
      if (min !== undefined) newValue = Math.max(newValue, min);
      if (max !== undefined) newValue = Math.min(newValue, max);
      return newValue;
    });
  }, [min, max]);

  return {
    count,
    increment,
    decrement,
    reset,
    set,
  };
}
