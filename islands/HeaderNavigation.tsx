import { useNavigationState } from "./NavigationState.tsx";

export default function HeaderNavigation() {
  const { isPathActive } = useNavigationState();

  return (
    <nav className="hidden md:flex items-center gap-1">
      <NavLink href="/" label="首页" active={isPathActive("/")} />
      <NavLink
        href="/dress"
        label="内容浏览"
        active={isPathActive("/dress")}
      />
      <NavLink
        href="/create"
        label="创作内容"
        active={isPathActive("/create")}
      />
    </nav>
  );
}

// 导航链接组件
interface NavLinkProps {
  href: string;
  label: string;
  active?: boolean;
}

const NavLink = ({ href, label, active }: NavLinkProps) => {
  return (
    <a
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </a>
  );
};
