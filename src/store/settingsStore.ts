import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Theme } from '../types/expense'

interface SettingsStore {
  currency: string
  theme: Theme
  notificationsEnabled: boolean
  budgetAlertsEnabled: boolean
  budgetAlertThreshold: number
  defaultCurrency: string
  language: string
  setCurrency: (currency: string) => void
  setTheme: (theme: Theme) => void
  toggleNotifications: () => void
  toggleBudgetAlerts: () => void
  setBudgetAlertThreshold: (threshold: number) => void
  setLanguage: (language: string) => void
  resetSettings: () => void
}

const defaultSettings = {
  currency: 'EUR',
  theme: 'system' as Theme,
  notificationsEnabled: true,
  budgetAlertsEnabled: true,
  budgetAlertThreshold: 80, // 80% del presupuesto
  defaultCurrency: 'EUR',
  language: 'es'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set, get) => ({
      ...defaultSettings,

      setCurrency: (currency) =>
        set((state) => {
          state.currency = currency
          state.defaultCurrency = currency
        }),

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme
        }),

      toggleNotifications: () =>
        set((state) => {
          state.notificationsEnabled = !state.notificationsEnabled
        }),

      toggleBudgetAlerts: () =>
        set((state) => {
          state.budgetAlertsEnabled = !state.budgetAlertsEnabled
        }),

      setBudgetAlertThreshold: (threshold) =>
        set((state) => {
          state.budgetAlertThreshold = Math.max(0, Math.min(100, threshold))
        }),

      setLanguage: (language) =>
        set((state) => {
          state.language = language
        }),

      resetSettings: () =>
        set((state) => {
          Object.assign(state, defaultSettings)
        })
    })),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1
    }
  )
)
