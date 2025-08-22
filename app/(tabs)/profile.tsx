import React, { useState } from 'react'
import { AuthFlow } from '../../src/screens/AuthFlow'
import { ManageUsersScreen } from '../../src/screens/ManageUsersScreen'
import { ProfileScreen } from '../../src/screens/ProfileScreen'
import { useCurrentUser } from '../../src/store/userStore'

export default function ProfileTab() {
  const [currentScreen, setCurrentScreen] = useState<
    'profile' | 'manage-users' | 'auth'
  >('profile')
  const { isLoggedIn } = useCurrentUser()

  // Si no está logueado, mostrar el flujo de autenticación
  if (!isLoggedIn) {
    return <AuthFlow onAuthSuccess={() => setCurrentScreen('profile')} />
  }

  // Navegación entre pantallas
  if (currentScreen === 'manage-users') {
    return <ManageUsersScreen onBack={() => setCurrentScreen('profile')} />
  }

  // Pantalla principal de perfil
  return (
    <ProfileScreen
      onLogout={() => setCurrentScreen('auth')}
      onManageUsers={() => setCurrentScreen('manage-users')}
    />
  )
}
