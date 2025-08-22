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

interface RegisterScreenProps {
  onRegisterSuccess: () => void
  onSwitchToLogin: () => void
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onSwitchToLogin
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { isLoading } = useUserStore()
  const { register } = useUserActions()

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre')
      return false
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un email válido')
      return false
    }

    if (!password) {
      Alert.alert('Error', 'Por favor ingresa una contraseña')
      return false
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden')
      return false
    }

    return true
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    try {
      const success = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      })

      if (success) {
        Alert.alert('Registro exitoso', '¡Bienvenido a Louisiana Gastitos!', [
          { text: 'Continuar', onPress: onRegisterSuccess }
        ])
      } else {
        Alert.alert('Error', 'No se pudo completar el registro')
      }
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error durante el registro')
      console.error('Register error:', error)
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
          {/* Header minimalista */}
          <View className='items-center mt-16 mb-16'>
            <View className='w-24 h-24 bg-gray-800 rounded-3xl items-center justify-center mb-8 border border-gray-700'>
              <Icon name='receipt' size={36} color='white' />
            </View>
            <Text className='text-4xl font-bold text-white mb-3'>
              Crear Cuenta
            </Text>
            <Text className='text-lg text-gray-300 text-center'>
              Únete y comienza a gestionar tus gastos
            </Text>
          </View>

          {/* Form minimalista */}
          <View className='space-y-4 px-4'>
            {/* Name Input */}
            <View>
              <TextInput
                className='bg-gray-800 rounded-2xl px-6 py-5 text-white text-lg border border-gray-700'
                placeholder='Nombre completo'
                placeholderTextColor='#6B7280'
                value={name}
                onChangeText={setName}
                autoCapitalize='words'
                autoCorrect={false}
              />
            </View>

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
                className='bg-gray-800 rounded-2xl px-6 py-5 text-white text-lg border border-gray-700'
                placeholder='Contraseña (mín. 6 caracteres)'
                placeholderTextColor='#6B7280'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>

            {/* Confirm Password Input */}
            <View>
              <TextInput
                className='bg-gray-800 rounded-2xl px-6 py-5 text-white text-lg border border-gray-700'
                placeholder='Confirmar contraseña'
                placeholderTextColor='#6B7280'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            </View>
          </View>

          {/* Botones circulares */}
          <View className='flex-row justify-center items-center space-x-8 mt-16 mb-8'>
            {/* Botón Login */}
            <TouchableOpacity
              onPress={onSwitchToLogin}
              className='w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-600'>
              <Text className='text-gray-300 text-xs'>Login</Text>
            </TouchableOpacity>

            {/* Botón Register Principal */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className='w-20 h-20 bg-white rounded-full items-center justify-center'>
              {isLoading ? (
                <ActivityIndicator color='#000' size='small' />
              ) : (
                <Icon name='check' size={24} color='#000' />
              )}
            </TouchableOpacity>

            {/* Botón Info */}
            <TouchableOpacity className='w-16 h-16 bg-gray-800 rounded-full items-center justify-center border border-gray-600'>
              <Text className='text-gray-300 text-xs'>Info</Text>
            </TouchableOpacity>
          </View>

          {/* Términos minimalistas */}
          <View className='items-center mb-8'>
            <Text className='text-gray-500 text-center text-xs'>
              Al registrarte aceptas los términos de servicio
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
