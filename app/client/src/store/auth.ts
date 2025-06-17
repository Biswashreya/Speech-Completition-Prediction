import { create } from "zustand";

type User = {
  _id: string;
  email: string;
  name: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => {
  return {
    isAuthenticated: false,
    user: null,
    login: (user) => set({ isAuthenticated: true, user: user }),
    logout: () => set({ isAuthenticated: false, user: null }),
  };
});
