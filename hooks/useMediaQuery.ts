import { useEffect, useState } from "preact/hooks";

/**
 * 媒体查询Hook
 * @param query 媒体查询字符串
 * @returns 是否匹配查询条件
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof globalThis.matchMedia === "undefined") {
      return;
    }

    const mediaQuery = globalThis.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      // 兼容旧版本浏览器
      mediaQuery.addListener(handler);
    }

    // 清理函数
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * 响应式断点Hook
 * @returns 当前断点信息
 */
export function useBreakpoint() {
  const isSm = useMediaQuery("(min-width: 640px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const is2Xl = useMediaQuery("(min-width: 1536px)");

  const breakpoint = is2Xl
    ? "2xl"
    : isXl
    ? "xl"
    : isLg
    ? "lg"
    : isMd
    ? "md"
    : isSm
    ? "sm"
    : "xs";

  return {
    breakpoint,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    isSmDown: !isSm,
    isMdDown: !isMd,
    isLgDown: !isLg,
    isXlDown: !isXl,
  };
}
