import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user" | "guest";
}

interface UserState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;

  // 动作
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,

  // 动作实现
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  login: (user) => {
    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  updateUser: (updates) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...updates },
      });
    }
  },
}));
