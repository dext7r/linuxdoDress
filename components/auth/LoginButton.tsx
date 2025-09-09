/**
 * Linux.do 登录按钮组件
 */

import { JSX } from "preact";

interface LoginButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  redirectTo?: string;
  className?: string;
  children?: JSX.Element | string;
}

export default function LoginButton({
  variant = "primary",
  size = "md",
  redirectTo = "/",
  className = "",
  children,
}: LoginButtonProps) {
  const handleLogin = () => {
    const loginUrl = `/api/auth/linuxdo?redirect=${encodeURIComponent(redirectTo)}`;
    globalThis.location.href = loginUrl;
  };

  // 按钮样式映射
  const variantStyles = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
    outline: "border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900",
    ghost: "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500";

  return (
    <button
      type="button"
      onClick={handleLogin}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {/* Linux.do 图标 */}
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm-1-13h2v6h-2V7zm0 8h2v2h-2v-2z" />
      </svg>
      
      {/* 按钮文本 */}
      {children || "使用 Linux.do 登录"}
    </button>
  );
}

// 预设样式的登录按钮变体
export function LinuxDoLoginButton({ className = "", ...props }: Omit<LoginButtonProps, "children">) {
  return (
    <LoginButton
      variant="primary"
      className={`bg-[#0066cc] hover:bg-[#0052a3] text-white dark:bg-[#0066cc] dark:hover:bg-[#0052a3] ${className}`}
      {...props}
    >
      使用 Linux.do 继续
    </LoginButton>
  );
}

// 简洁的登录按钮
export function SimpleLoginButton({ className = "", ...props }: Omit<LoginButtonProps, "children">) {
  return (
    <LoginButton
      variant="outline"
      size="sm"
      className={className}
      {...props}
    >
      登录
    </LoginButton>
  );
}
