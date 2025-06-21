import { create } from "zustand";

interface AppState {
  // 应用全局状态
  isLoading: boolean;
  error: string | null;

  // 应用设置
  sidebarOpen: boolean;

  // 动作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  isLoading: false,
  error: null,
  sidebarOpen: false,

  // 动作实现
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
