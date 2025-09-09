import { JSX } from "preact";
import Button from "../ui/Button.tsx";
import ThemeToggleIsland from "../../islands/ThemeToggle.tsx";
import HeaderNavigationIsland from "../../islands/HeaderNavigation.tsx";
import AuthMenuIsland from "../../islands/AuthMenu.tsx";

interface HeaderProps {
  title?: string;
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  showThemeToggle?: boolean;
  showUserMenu?: boolean;
  className?: string;
  children?: JSX.Element | JSX.Element[];
}

const Header = ({
  title = "Linux.do 女装展示",
  showSidebarToggle = true,
  onSidebarToggle,
  showThemeToggle = true,
  showUserMenu = true,
  className = "",
  children,
}: HeaderProps) => {
  return (
    <header
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* 左侧 */}
        <div className="flex items-center gap-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              aria-label="切换侧边栏"
            >
              <MenuIcon />
            </Button>
          )}

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Logo />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            </a>
          </div>
        </div>

        {/* 中间自定义内容 */}
        {children && (
          <div className="flex-1 flex justify-center">
            {children}
          </div>
        )}

        {/* 右侧 */}
        <div className="flex items-center gap-3">
          {/* 导航链接 */}
          <HeaderNavigationIsland />

          {/* 主题切换按钮 */}
          {showThemeToggle && <ThemeToggleIsland />}

          {/* 用户菜单 */}
          {showUserMenu && <AuthMenuIsland />}
        </div>
      </div>
    </header>
  );
};

// Logo组件
const Logo = () => (
  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-sm">💄</span>
  </div>
);

// 菜单图标组件
const MenuIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);



export default Header;
