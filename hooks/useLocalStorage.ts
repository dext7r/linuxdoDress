import { useState } from "preact/hooks";

/**
 * 本地存储Hook
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof globalThis.localStorage === "undefined") {
      return initialValue;
    }

    try {
      const item = globalThis.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 设置值的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许传入函数来更新值
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;
      setStoredValue(valueToStore);

      // 保存到localStorage
      if (typeof globalThis.localStorage !== "undefined") {
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 移除值的函数
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof globalThis.localStorage !== "undefined") {
        globalThis.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}
