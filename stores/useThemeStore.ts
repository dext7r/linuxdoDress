import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  // 主题状态
  theme: Theme;
  isDark: boolean;
  
  // 动作
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        theme: 'system',
        isDark: false,
        
        // 动作实现
        setTheme: (theme) => {
          set({ theme });
          get().initializeTheme();
        },
        
        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },
        
        initializeTheme: () => {
          const { theme } = get();
          let isDark = false;
          
          if (theme === 'system') {
            // 检查系统主题偏好
            if (typeof window !== 'undefined') {
              isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
          } else {
            isDark = theme === 'dark';
          }
          
          set({ isDark });
          
          // 更新HTML类名
          if (typeof document !== 'undefined') {
            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        },
      }),
      {
        name: 'theme-storage',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    {
      name: 'theme-store',
    }
  )
);
