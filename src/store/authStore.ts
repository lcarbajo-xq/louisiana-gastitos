import AsyncStorage from '@react-native-async-storage/async-storage'
import TouchID from 'react-native-biometrics'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { SecureStorageService } from '../services/SecureStorageService'
import type { SecurityConfig } from '../types/banking'

interface AuthState {
  // Estado de autenticación
  isAuthenticated: boolean
  biometricEnabled: boolean
  lastActivity: Date
  sessionTimeout: number // minutos

  // Configuración de seguridad
  securityConfig: SecurityConfig

  // Tokens bancarios (no se persisten aquí, están en SecureStorage)
  connectedBankIds: string[]

  // Estados de carga
  isInitializing: boolean
  isAuthenticating: boolean

  // Métodos
  initialize: () => Promise<void>
  authenticate: (type?: 'biometric' | 'passcode') => Promise<boolean>
  logout: () => Promise<void>

  // Gestión de tokens
  setBankToken: (bankId: string, token: string) => Promise<void>
  getBankToken: (bankId: string) => Promise<string | null>
  clearBankToken: (bankId: string) => Promise<void>
  clearAllBankTokens: () => Promise<void>

  // Configuración biométrica
  enableBiometric: () => Promise<boolean>
  disableBiometric: () => void
  isBiometricAvailable: () => Promise<boolean>

  // Gestión de sesión
  updateLastActivity: () => void
  checkSessionTimeout: () => boolean
  extendSession: () => void

  // Configuración de seguridad
  updateSecurityConfig: (config: Partial<SecurityConfig>) => void

  // Auto-logout
  startAutoLogoutTimer: () => void
  clearAutoLogoutTimer: () => void
}

const secureStorage = SecureStorageService.getInstance()

// Timer para auto-logout
let autoLogoutTimer: ReturnType<typeof setTimeout> | null = null

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      isAuthenticated: false,
      biometricEnabled: false,
      lastActivity: new Date(),
      sessionTimeout: 15, // 15 minutos por defecto

      securityConfig: {
        biometricEnabled: false,
        autoLogoutMinutes: 15,
        encryptionEnabled: true,
        requireBiometricForBanking: false,
        lastActivity: new Date()
      },

      connectedBankIds: [],
      isInitializing: false,
      isAuthenticating: false,

      // Inicialización
      initialize: async () => {
        set((state) => {
          state.isInitializing = true
        })

        try {
          await secureStorage.initialize()

          // Verificar integridad de datos
          const isValid = await secureStorage.validateDataIntegrity()
          if (!isValid) {
            console.warn(
              'Data integrity validation failed, clearing sensitive data'
            )
            await secureStorage.clearAllSensitiveData()
          }

          // Cargar configuración de seguridad
          const savedConfig = await secureStorage.getSecurityConfig()
          if (savedConfig) {
            set((state) => {
              state.securityConfig = { ...state.securityConfig, ...savedConfig }
              state.biometricEnabled = savedConfig.biometricEnabled
              state.sessionTimeout = savedConfig.autoLogoutMinutes
            })
          }

          // Verificar si hay tokens bancarios guardados
          const bankIds =
            (await secureStorage.getEncryptedBankingData<string[]>(
              'bank_ids'
            )) || []
          set((state) => {
            state.connectedBankIds = bankIds
          })

          // Verificar timeout de sesión
          const shouldLogout = await secureStorage.shouldAutoLogout(
            get().sessionTimeout
          )
          if (shouldLogout) {
            await get().logout()
          } else {
            // Iniciar timer de auto-logout
            get().startAutoLogoutTimer()
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
        } finally {
          set((state) => {
            state.isInitializing = false
          })
        }
      },

      // Autenticación
      authenticate: async (type = 'biometric') => {
        set((state) => {
          state.isAuthenticating = true
        })

        try {
          let success = false

          if (type === 'biometric' && get().biometricEnabled) {
            const biometrics = new TouchID()
            const { available } = await biometrics.isSensorAvailable()

            if (available) {
              const { success: bioSuccess } = await biometrics.simplePrompt({
                promptMessage: 'Authenticate to access banking features',
                cancelButtonText: 'Cancel'
              })
              success = bioSuccess
            }
          } else {
            // Fallback a autenticación por defecto o passcode
            success = true // Por ahora, implementar según necesidades
          }

          if (success) {
            set((state) => {
              state.isAuthenticated = true
              state.lastActivity = new Date()
            })

            await secureStorage.updateLastActivity()
            get().startAutoLogoutTimer()
          }

          return success
        } catch (error) {
          console.error('Authentication failed:', error)
          return false
        } finally {
          set((state) => {
            state.isAuthenticating = false
          })
        }
      },

      // Logout
      logout: async () => {
        try {
          set((state) => {
            state.isAuthenticated = false
            state.lastActivity = new Date()
          })

          get().clearAutoLogoutTimer()

          // No limpiar tokens, solo desautenticar
          await secureStorage.updateLastActivity()
        } catch (error) {
          console.error('Logout failed:', error)
        }
      },

      // Gestión de tokens bancarios
      setBankToken: async (bankId: string, token: string) => {
        try {
          await secureStorage.setBankToken(bankId, token)
          await secureStorage.addBankId(bankId)

          set((state) => {
            if (!state.connectedBankIds.includes(bankId)) {
              state.connectedBankIds.push(bankId)
            }
          })
        } catch (error) {
          console.error('Error setting bank token:', error)
          throw error
        }
      },

      getBankToken: async (bankId: string) => {
        try {
          return await secureStorage.getBankToken(bankId)
        } catch (error) {
          console.error('Error getting bank token:', error)
          return null
        }
      },

      clearBankToken: async (bankId: string) => {
        try {
          await secureStorage.clearBankToken(bankId)
          await secureStorage.removeBankId(bankId)

          set((state) => {
            state.connectedBankIds = state.connectedBankIds.filter(
              (id) => id !== bankId
            )
          })
        } catch (error) {
          console.error('Error clearing bank token:', error)
        }
      },

      clearAllBankTokens: async () => {
        try {
          await secureStorage.clearAllBankTokens()

          set((state) => {
            state.connectedBankIds = []
          })
        } catch (error) {
          console.error('Error clearing all bank tokens:', error)
        }
      },

      // Configuración biométrica
      enableBiometric: async () => {
        try {
          const available = await get().isBiometricAvailable()
          if (!available) return false

          // Probar autenticación biométrica
          const success = await get().authenticate('biometric')
          if (success) {
            set((state) => {
              state.biometricEnabled = true
              state.securityConfig.biometricEnabled = true
            })

            await secureStorage.setSecurityConfig(get().securityConfig)
            return true
          }

          return false
        } catch (error) {
          console.error('Error enabling biometric:', error)
          return false
        }
      },

      disableBiometric: () => {
        set((state) => {
          state.biometricEnabled = false
          state.securityConfig.biometricEnabled = false
        })

        secureStorage.setSecurityConfig(get().securityConfig)
      },

      isBiometricAvailable: async () => {
        try {
          return await secureStorage.isBiometricAvailable()
        } catch (error) {
          console.error('Error checking biometric availability:', error)
          return false
        }
      },

      // Gestión de sesión
      updateLastActivity: () => {
        const now = new Date()
        set((state) => {
          state.lastActivity = now
          state.securityConfig.lastActivity = now
        })

        secureStorage.updateLastActivity()
        get().startAutoLogoutTimer()
      },

      checkSessionTimeout: () => {
        const now = Date.now()
        const lastActivity = get().lastActivity.getTime()
        const timeoutMs = get().sessionTimeout * 60 * 1000

        return now - lastActivity > timeoutMs
      },

      extendSession: () => {
        get().updateLastActivity()
      },

      // Configuración de seguridad
      updateSecurityConfig: (config) => {
        set((state) => {
          state.securityConfig = { ...state.securityConfig, ...config }

          if (config.autoLogoutMinutes) {
            state.sessionTimeout = config.autoLogoutMinutes
          }
          if (config.biometricEnabled !== undefined) {
            state.biometricEnabled = config.biometricEnabled
          }
        })

        secureStorage.setSecurityConfig(get().securityConfig)
        get().startAutoLogoutTimer()
      },

      // Auto-logout timer
      startAutoLogoutTimer: () => {
        get().clearAutoLogoutTimer()

        const timeoutMs = get().sessionTimeout * 60 * 1000
        autoLogoutTimer = setTimeout(() => {
          console.log('Session timeout, logging out...')
          get().logout()
        }, timeoutMs)
      },

      clearAutoLogoutTimer: () => {
        if (autoLogoutTimer) {
          clearTimeout(autoLogoutTimer)
          autoLogoutTimer = null
        }
      }
    })),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name)
        }
      },
      // Solo persistir configuración no sensible
      partialize: (state) =>
        ({
          biometricEnabled: state.biometricEnabled,
          sessionTimeout: state.sessionTimeout,
          securityConfig: state.securityConfig,
          connectedBankIds: state.connectedBankIds
        } as AuthState)
    }
  )
)
