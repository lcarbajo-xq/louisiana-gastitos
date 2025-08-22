import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/ui/base/Icon'
import { useUserActions, useUserStore } from '../store/userStore'

interface LoginScreenProps {
  onLoginSuccess: () => void
  onSwitchToRegister: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSwitchToRegister
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { isAuthenticating } = useUserStore()
  const { login } = useUserActions()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    try {
      const success = await login({ email: email.trim(), password })

      if (success) {
        onLoginSuccess()
      } else {
        Alert.alert('Error', 'Credenciales incorrectas')
      }
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error al iniciar sesión')
      console.error('Login error:', error)
    }
  }

  const handleDemoLogin = async () => {
    try {
      const success = await login({
        email: 'juan@example.com',
        password: 'demo123'
      })
      if (success) {
        onLoginSuccess()
      }
    } catch (error) {
      console.error('Demo login error:', error)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-900'>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>
        <ScrollView
          className='flex-1 px-6'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header con gradiente */}
          <View className='items-center mt-20 mb-16'>
            <View className='w-24 h-24 bg-gray-800 rounded-3xl items-center justify-center mb-8 border border-gray-700'>
              <Icon name='receipt' size={36} color='white' />
            </View>
            <Text className='text-4xl font-bold text-white mb-3'>
              Louisiana Gastitos
            </Text>
            <Text className='text-lg text-gray-300 text-center'>
              Gestiona tus gastos de forma inteligente
            </Text>
          </View>

          {/* Form minimalista */}
          <View className='space-y-4 px-4'>
            {/* Email Input */}
            <View>
              <TextInput
                className='bg-gray-800 rounded-2xl px-6 py-5 text-white text-lg border border-gray-700'
                placeholder='Correo electrónico'
                placeholderTextColor='#6B7280'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View>
              <TextInput
                className='rounded-2xl px-6 py-5  text-lg border border-gray-700 text-white bg-gray-800'
                placeholder='Contraseña'
                placeholderTextColor='#6B7280'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>
          </View>

          {/* Botones circulares */}
          <View className='flex-row justify-center items-center space-x-8 mt-16 mb-8'>
            {/* Botón Demo */}
            <TouchableOpacity
              onPress={handleDemoLogin}
              disabled={isAuthenticating}
              className='w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-600'>
              <Text className='text-gray-300 text-xs'>Demo</Text>
            </TouchableOpacity>

            {/* Botón Login Principal */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isAuthenticating}
              className='w-20 h-20 bg-white rounded-full items-center text-red-500 justify-center'>
              {isAuthenticating ? (
                <ActivityIndicator color='#000' size='small' />
              ) : (
                <Icon name='check' size={24} color='#000' />
              )}
            </TouchableOpacity>

            {/* Botón Registro */}
            <TouchableOpacity
              onPress={onSwitchToRegister}
              className='w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-600'>
              <Text className='text-gray-300 text-xs'>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
