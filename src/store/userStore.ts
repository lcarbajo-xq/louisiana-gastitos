import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  User,
  UserLogin,
  UserRegistration,
  UserSession
} from '../types/user'

interface UserState {
  // Estado de usuario
  currentUser: User | null
  session: UserSession | null
  isLoggedIn: boolean

  // Estados de carga
  isLoading: boolean
  isAuthenticating: boolean

  // Lista de usuarios conocidos (para invitaciones)
  knownUsers: User[]

  // Acciones
  register: (userData: UserRegistration) => Promise<boolean>
  login: (credentials: UserLogin) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<boolean>

  // Gestión de usuarios
  searchUsers: (query: string) => User[]
  addKnownUser: (user: User) => void
  getUser: (userId: string) => User | null

  // Sesión
  refreshSession: () => Promise<boolean>
  updateLastActive: () => void

  // Utilidades
  clearUserData: () => void
  resetStore: () => void
}

// Usuarios demo para desarrollo (en producción sería una API)
const DEMO_USERS: User[] = [
  {
    id: 'user_1',
    email: 'juan@example.com',
    name: 'Juan Pérez',
    phone: '+1234567890',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(),
    preferences: {
      currency: 'USD',
      notifications: true,
      theme: 'dark',
      language: 'es'
    },
    isActive: true
  },
  {
    id: 'user_2',
    email: 'maria@example.com',
    name: 'María García',
    phone: '+1234567891',
    joinedAt: new Date('2024-02-10'),
    lastActive: new Date(),
    preferences: {
      currency: 'USD',
      notifications: true,
      theme: 'light',
      language: 'es'
    },
    isActive: true
  },
  {
    id: 'user_3',
    email: 'carlos@example.com',
    name: 'Carlos López',
    phone: '+1234567892',
    joinedAt: new Date('2024-03-05'),
    lastActive: new Date(),
    preferences: {
      currency: 'EUR',
      notifications: false,
      theme: 'auto',
      language: 'es'
    },
    isActive: true
  }
]

export const useUserStore = create<UserState>()(
  persist(
    immer((set, get) => ({
      // Estado inicial
      currentUser: null,
      session: null,
      isLoggedIn: false,
      isLoading: false,
      isAuthenticating: false,
      knownUsers: DEMO_USERS,

      // Registro de usuario
      register: async (userData) => {
        set((state) => {
          state.isLoading = true
        })

        try {
          // Validar datos
          if (userData.password !== userData.confirmPassword) {
            throw new Error('Las contraseñas no coinciden')
          }

          if (userData.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres')
          }

          // Verificar que el email no exista
          const existingUser = get().knownUsers.find(
            (u) => u.email === userData.email
          )
          if (existingUser) {
            throw new Error('Este email ya está registrado')
          }

          // Crear nuevo usuario
          const newUser: User = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: userData.email,
            name: userData.name,
            joinedAt: new Date(),
            lastActive: new Date(),
            preferences: {
              currency: 'USD',
              notifications: true,
              theme: 'dark',
              language: 'es'
            },
            isActive: true
          }

          // Crear sesión
          const session: UserSession = {
            user: newUser,
            token: `token_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            refreshToken: `refresh_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
          }

          set((state) => {
            state.currentUser = newUser
            state.session = session
            state.isLoggedIn = true
            state.knownUsers.push(newUser)
          })

          return true
        } catch (error) {
          console.error('Registration failed:', error)
          return false
        } finally {
          set((state) => {
            state.isLoading = false
          })
        }
      },

      // Login de usuario
      login: async (credentials) => {
        set((state) => {
          state.isAuthenticating = true
        })

        try {
          // Buscar usuario en los conocidos
          const user = get().knownUsers.find(
            (u) => u.email === credentials.email
          )

          if (!user) {
            throw new Error('Usuario no encontrado')
          }

          // En un sistema real, verificaríamos la contraseña aquí
          // Por simplicidad, aceptamos cualquier contraseña para usuarios demo

          // Crear sesión
          const session: UserSession = {
            user,
            token: `token_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            refreshToken: `refresh_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
          }

          set((state) => {
            state.currentUser = user
            state.session = session
            state.isLoggedIn = true
          })

          // Actualizar última actividad
          get().updateLastActive()

          return true
        } catch (error) {
          console.error('Login failed:', error)
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
            state.currentUser = null
            state.session = null
            state.isLoggedIn = false
          })
        } catch (error) {
          console.error('Logout failed:', error)
        }
      },

      // Actualizar perfil
      updateProfile: async (updates) => {
        const currentUser = get().currentUser
        if (!currentUser) return false

        try {
          const updatedUser = { ...currentUser, ...updates }

          set((state) => {
            state.currentUser = updatedUser
            if (state.session) {
              state.session.user = updatedUser
            }

            // Actualizar en la lista de usuarios conocidos
            const userIndex = state.knownUsers.findIndex(
              (u) => u.id === currentUser.id
            )
            if (userIndex !== -1) {
              state.knownUsers[userIndex] = updatedUser
            }
          })

          return true
        } catch (error) {
          console.error('Profile update failed:', error)
          return false
        }
      },

      // Buscar usuarios
      searchUsers: (query) => {
        const users = get().knownUsers
        if (!query.trim()) return users

        const lowerQuery = query.toLowerCase()
        return users.filter(
          (user) =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        )
      },

      // Agregar usuario conocido
      addKnownUser: (user) => {
        set((state) => {
          const exists = state.knownUsers.some((u) => u.id === user.id)
          if (!exists) {
            state.knownUsers.push(user)
          }
        })
      },

      // Obtener usuario por ID
      getUser: (userId) => {
        return get().knownUsers.find((user) => user.id === userId) || null
      },

      // Refrescar sesión
      refreshSession: async () => {
        const session = get().session
        if (!session) return false

        try {
          // En un sistema real, aquí validaríamos el refresh token
          const newSession: UserSession = {
            ...session,
            token: `token_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }

          set((state) => {
            state.session = newSession
          })

          return true
        } catch (error) {
          console.error('Session refresh failed:', error)
          await get().logout()
          return false
        }
      },

      // Actualizar última actividad
      updateLastActive: () => {
        const currentUser = get().currentUser
        if (!currentUser) return

        const updatedUser = { ...currentUser, lastActive: new Date() }

        set((state) => {
          state.currentUser = updatedUser
          if (state.session) {
            state.session.user = updatedUser
          }
        })
      },

      // Limpiar datos de usuario
      clearUserData: () => {
        set((state) => {
          state.currentUser = null
          state.session = null
          state.isLoggedIn = false
        })
      },

      // Reset completo del store
      resetStore: () => {
        set({
          currentUser: null,
          session: null,
          isLoggedIn: false,
          isLoading: false,
          isAuthenticating: false,
          knownUsers: DEMO_USERS
        })
      }
    })),
    {
      name: 'user-storage',
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
      // Solo persistir datos no sensibles
      partialize: (state) =>
        ({
          currentUser: state.currentUser,
          isLoggedIn: state.isLoggedIn,
          knownUsers: state.knownUsers,
          session: state.session,
          isLoading: false,
          isAuthenticating: false,
          register: state.register,
          login: state.login,
          logout: state.logout,
          updateProfile: state.updateProfile,
          searchUsers: state.searchUsers,
          addKnownUser: state.addKnownUser,
          getUser: state.getUser,
          refreshSession: state.refreshSession,
          updateLastActive: state.updateLastActive,
          clearUserData: state.clearUserData,
          resetStore: state.resetStore
        } as UserState)
    }
  )
)

// Hook para acciones de usuario
export const useUserActions = () => {
  const store = useUserStore()
  return {
    register: store.register,
    login: store.login,
    logout: store.logout,
    updateProfile: store.updateProfile,
    searchUsers: store.searchUsers,
    updateLastActive: store.updateLastActive
  }
}

// Hook para datos de usuario
export const useCurrentUser = () => {
  const store = useUserStore()
  return {
    user: store.currentUser,
    session: store.session,
    isLoggedIn: store.isLoggedIn,
    isLoading: store.isLoading,
    isAuthenticating: store.isAuthenticating
  }
}
