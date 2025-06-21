interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  return (
    <footer
      className={`relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20 border-t border-gray-200/60 dark:border-gray-700/60 overflow-hidden ${className}`}
    >
      {/* 优化的渐变背景 */}
      <div className="absolute inset-0">
        {/* 简化的主渐变背景 - 添加动画 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 animate-gradient-flow">
        </div>

        {/* 优化的顶部装饰线 */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent dark:via-blue-500/40">
        </div>

        {/* 简化的动态光效 */}
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-400/8 dark:bg-blue-500/4 rounded-full blur-3xl animate-float">
        </div>
        <div className="absolute bottom-1/2 right-1/3 w-32 h-32 bg-purple-400/8 dark:bg-purple-500/4 rounded-full blur-2xl animate-float-delayed">
        </div>
      </div>

      <div className="relative container-custom py-3 md:py-4">
        {/* 移动端：简化布局 */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            {/* 品牌标识 */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Athena
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  © 2025 h7ml
                </p>
              </div>
            </div>

            {/* 社交链接 */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/dext7r/athena.git"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                title="GitHub"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:h7ml@qq.com"
                className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Email"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 桌面端：简化布局 */}
        <div className="hidden md:flex md:items-center md:justify-between">
          {/* 左侧：品牌信息 */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300">
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Athena Template
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基于 Fresh + Deno + TailwindCSS
              </p>
            </div>
          </div>

          {/* 中间：快速导航 */}
          <div className="flex items-center gap-6">
            <a
              href="/components"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group"
            >
              组件
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300">
              </span>
            </a>
            <a
              href="/hooks"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors relative group"
            >
              Hooks
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300">
              </span>
            </a>
            <a
              href="/state"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative group"
            >
              状态
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300">
              </span>
            </a>
            <a
              href="/about"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group"
            >
              关于
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300">
              </span>
            </a>
          </div>

          {/* 右侧：作者和社交链接 */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 •
              <a
                href="mailto:h7ml@qq.com"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors ml-1"
              >
                h7ml
              </a>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/dext7r/athena.git"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                title="GitHub"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:h7ml@qq.com"
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                title="Email"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
