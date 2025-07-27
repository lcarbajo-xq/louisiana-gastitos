import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Theme } from '../types'

interface SettingsStore {
  currency: string
  theme: Theme
  notifications: boolean
  budgetAlerts: boolean
  setCurrency: (currency: string) => void
  setTheme: (theme: Theme) => void
  toggleNotifications: () => void
  toggleBudgetAlerts: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      theme: 'dark',
      notifications: true,
      budgetAlerts: true,

      setCurrency: (currency) => {
        set({ currency })
      },

      setTheme: (theme) => {
        set({ theme })
      },

      toggleNotifications: () => {
        set((state) => ({ notifications: !state.notifications }))
      },

      toggleBudgetAlerts: () => {
        set((state) => ({ budgetAlerts: !state.budgetAlerts }))
      }
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
)
