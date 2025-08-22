import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useCurrentUser } from '../store/userStore'
import { LoginScreen } from './LoginScreen'
import { RegisterScreen } from './RegisterScreen'

interface AuthFlowProps {
  onAuthSuccess: () => void
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>(
    'login'
  )
  const { isLoggedIn, isLoading } = useCurrentUser()

  useEffect(() => {
    if (isLoggedIn) {
      onAuthSuccess()
    }
  }, [isLoggedIn, onAuthSuccess])

  if (isLoading) {
    return (
      <View className='flex-1 bg-gray-900 items-center justify-center'>
        <ActivityIndicator size='large' color='#8B5CF6' />
      </View>
    )
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={onAuthSuccess}
        onSwitchToRegister={() => setCurrentScreen('register')}
      />
    )
  }

  return (
    <RegisterScreen
      onRegisterSuccess={onAuthSuccess}
      onSwitchToLogin={() => setCurrentScreen('login')}
    />
  )
}
