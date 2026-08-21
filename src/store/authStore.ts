import { create } from 'zustand';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

/** Mock users for demo login — any password accepted */
const MOCK_CREDENTIALS: Record<string, User> = {
  'elder@demo.com': {
    id: 'u1', name: '陳先生', email: 'elder@demo.com',
    role: 'elder', age: 82, tier: '金會員',
  },
  'creator@demo.com': {
    id: 'c1', name: '李美華', email: 'creator@demo.com',
    role: 'creator', age: 24, tier: 'certified',
    credits: 2450, practiceCredits: 800,
  },
  'sponsor@demo.com': {
    id: 's1', name: '張先生', email: 'sponsor@demo.com',
    role: 'sponsor', age: 45, tier: 'ESG 夥伴',
  },
  'admin@demo.com': {
    id: 'a1', name: '系統管理員', email: 'admin@demo.com',
    role: 'admin',
  },
};

const DEFAULT_BY_ROLE: Record<UserRole, User> = {
  elder: MOCK_CREDENTIALS['elder@demo.com'],
  creator: MOCK_CREDENTIALS['creator@demo.com'],
  sponsor: MOCK_CREDENTIALS['sponsor@demo.com'],
  admin: MOCK_CREDENTIALS['admin@demo.com'],
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, _password: string, role: UserRole) => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    // Find by email or fall back to role default
    const user = MOCK_CREDENTIALS[email.toLowerCase()] ?? DEFAULT_BY_ROLE[role];
    const finalUser = { ...user, role };

    set({ user: finalUser, isAuthenticated: true, isLoading: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cofilmery-user', JSON.stringify(finalUser));
      // Mock JWT token
      localStorage.setItem('cofilmery-token', `mock.jwt.${role}.${Date.now()}`);
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cofilmery-user');
      localStorage.removeItem('cofilmery-token');
    }
  },

  setUser: (user: User) => set({ user, isAuthenticated: true }),
}));

/** Rehydrate auth from localStorage on app start */
export function rehydrateAuth() {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('cofilmery-user');
  const token = localStorage.getItem('cofilmery-token');
  if (stored && token) {
    try {
      const user = JSON.parse(stored) as User;
      useAuthStore.getState().setUser(user);
    } catch {
      // ignore
    }
  }
}
