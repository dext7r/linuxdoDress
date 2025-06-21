import { JSX } from "preact";

/**
 * 客户端专用组件包装器
 * 用于解决SSR时某些组件无法正常工作的问题
 */
interface ClientOnlyProps {
  children: JSX.Element | (() => JSX.Element);
  fallback?: JSX.Element;
}

export function ClientOnly(
  { children, fallback = <div></div> }: ClientOnlyProps,
) {
  // 在服务端渲染时，直接返回fallback
  if (typeof globalThis.window === "undefined") {
    return fallback;
  }

  // 在客户端，返回实际内容
  return typeof children === "function" ? children() : children;
}

/**
 * 检查是否在客户端环境
 */
export const isClient = typeof window !== "undefined";

/**
 * 检查是否在服务端环境
 */
export const isServer = typeof window === "undefined";
