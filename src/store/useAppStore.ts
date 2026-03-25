import { create } from 'zustand'

export interface User {
  email: string
  name: string
  avatar: string
  balance: number
  cashback: number
  level: string
}

interface AppStore {
  user: User | null
  isLoggedIn: boolean
  activeTab: string
  login: (email: string, name: string) => void
  logout: () => void
  setActiveTab: (tab: string) => void
  updateBalance: (amount: number) => void
  updateAvatar: (avatar: string) => void
  spinWheelUsed: boolean
  setSpinWheelUsed: (v: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  isLoggedIn: false,
  activeTab: 'games',
  spinWheelUsed: false,

  login: (email, name) =>
    set({
      isLoggedIn: true,
      user: {
        email,
        name,
        avatar: '🦁',
        balance: 5000,
        cashback: 320,
        level: 'Серебро',
      },
    }),

  logout: () => set({ isLoggedIn: false, user: null, activeTab: 'games' }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateBalance: (amount) =>
    set((state) => ({
      user: state.user ? { ...state.user, balance: state.user.balance + amount } : null,
    })),

  updateAvatar: (avatar) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatar } : null,
    })),

  setSpinWheelUsed: (v) => set({ spinWheelUsed: v }),
}))
