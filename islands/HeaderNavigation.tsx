import { useNavigationState } from "./NavigationState.tsx";
import StatusDropdownIsland from "./StatusDropdown.tsx";

export default function HeaderNavigation() {
  const { isPathActive, isStatusActive } = useNavigationState();

  return (
    <nav className="hidden md:flex items-center gap-1">
      <NavLink href="/" label="首页" active={isPathActive("/")} />
      <NavLink
        href="/components"
        label="组件"
        active={isPathActive("/components")}
      />
      <NavLink href="/hooks" label="Hooks" active={isPathActive("/hooks")} />
      <NavLink href="/state" label="状态" active={isPathActive("/state")} />
      <StatusDropdownIsland active={isStatusActive()} />
      <NavLink href="/about" label="关于" active={isPathActive("/about")} />
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
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </a>
  );
};
