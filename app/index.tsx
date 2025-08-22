import { Redirect } from 'expo-router'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthFlow } from '../src/screens/AuthFlow'
import { useCurrentUser } from '../src/store/userStore'

export default function App() {
  const { isLoggedIn, isLoading } = useCurrentUser()

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View className='flex-1 bg-gray-900 items-center justify-center'>
          <ActivityIndicator size='large' color='#8B5CF6' />
        </View>
      </SafeAreaProvider>
    )
  }

  // Si está logueado, redirigir a las tabs
  if (isLoggedIn) {
    return <Redirect href='/(tabs)' />
  }

  // Si no está logueado, mostrar flujo de autenticación
  return (
    <SafeAreaProvider>
      <AuthFlow onAuthSuccess={() => {}} />
    </SafeAreaProvider>
  )
}
