import { useEffect, useState } from "preact/hooks";

// 导航状态管理
export function useNavigationState() {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // 获取当前路径
    const updatePath = () => {
      if (typeof globalThis.location !== "undefined") {
        setCurrentPath(globalThis.location.pathname);
      }
    };

    updatePath();

    // 监听路径变化
    const handlePopState = () => {
      updatePath();
    };

    if (typeof globalThis.window !== "undefined") {
      globalThis.window.addEventListener("popstate", handlePopState);
    }

    return () => {
      if (typeof globalThis.window !== "undefined") {
        globalThis.window.removeEventListener("popstate", handlePopState);
      }
    };
  }, []);

  // 检查路径是否激活
  const isPathActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  // 检查状态码页面是否激活
  const isStatusActive = () => {
    return currentPath.startsWith("/status") ||
      currentPath === "/nonexistent-page";
  };

  return {
    currentPath,
    isPathActive,
    isStatusActive,
  };
}

// 导航状态提供者组件（如果需要全局状态）
export default function NavigationStateProvider(
  { children }: { children: preact.ComponentChildren },
) {
  return <div>{children}</div>;
}
