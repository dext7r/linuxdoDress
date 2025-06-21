import { useEffect, useRef, useState } from "preact/hooks";

interface StatusDropdownProps {
  active?: boolean;
}

export default function StatusDropdown(
  { active = false }: StatusDropdownProps,
) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusItems = [
    { href: "/status", label: "状态码总览", icon: "📋" },
    { href: "/status/401", label: "401 未授权", icon: "🔒" },
    { href: "/status/403", label: "403 禁止访问", icon: "🚫" },
    { href: "/nonexistent-page", label: "404 页面未找到", icon: "🔍" },
    { href: "/status/500", label: "500 服务器错误", icon: "❌" },
    { href: "/status/502", label: "502 网关错误", icon: "🌐" },
    { href: "/status/503", label: "503 服务不可用", icon: "🔧" },
  ];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
          isOpen || active
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        状态码
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
          <div className="py-1">
            {statusItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
