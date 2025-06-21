import { useCallback, useState } from "preact/hooks";

/**
 * 布尔值切换Hook
 * @param initialValue 初始值
 * @returns [value, toggle, setTrue, setFalse, setValue]
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse, setValue] as const;
}

/**
 * 多状态切换Hook
 * @param states 状态数组
 * @param initialIndex 初始状态索引
 * @returns [currentState, currentIndex, next, previous, setIndex]
 */
export function useCycleToggle<T>(states: T[], initialIndex: number = 0) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % states.length);
  }, [states.length]);

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + states.length) % states.length);
  }, [states.length]);

  const setIndex = useCallback((index: number) => {
    if (index >= 0 && index < states.length) {
      setCurrentIndex(index);
    }
  }, [states.length]);

  return [
    states[currentIndex],
    currentIndex,
    next,
    previous,
    setIndex,
  ] as const;
}
