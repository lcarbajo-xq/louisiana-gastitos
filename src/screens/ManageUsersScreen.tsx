import React, { useState } from 'react'
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/ui/base/Icon'
import { useCurrentUser, useUserActions } from '../store/userStore'
import { User } from '../types/user'

interface ManageUsersScreenProps {
  onBack: () => void
}

export const ManageUsersScreen: React.FC<ManageUsersScreenProps> = ({
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useCurrentUser()
  const { searchUsers } = useUserActions()

  const searchResults = searchQuery.trim() ? searchUsers(searchQuery) : []

  const handleAddUser = (selectedUser: User) => {
    if (selectedUser.id === user?.id) {
      Alert.alert('Error', 'No puedes añadirte a ti mismo')
      return
    }

    Alert.alert(
      'Usuario añadido',
      `${selectedUser.name} ha sido añadido a tu lista de contactos. Ahora puedes invitarlo a presupuestos compartidos.`
    )
    setSearchQuery('')
  }

  const demoUsers: User[] = [
    {
      id: 'user_demo_1',
      name: 'Ana García',
      email: 'ana@example.com',
      phone: '+1234567893',
      avatar: undefined,
      joinedAt: new Date('2024-01-20'),
      lastActive: new Date(),
      preferences: {
        currency: 'EUR',
        notifications: true,
        theme: 'dark',
        language: 'es'
      },
      isActive: true
    },
    {
      id: 'user_demo_2',
      name: 'Pedro Rodríguez',
      email: 'pedro@example.com',
      phone: '+1234567894',
      avatar: undefined,
      joinedAt: new Date('2024-02-15'),
      lastActive: new Date(),
      preferences: {
        currency: 'EUR',
        notifications: true,
        theme: 'light',
        language: 'es'
      },
      isActive: true
    },
    {
      id: 'user_demo_3',
      name: 'Laura Martín',
      email: 'laura@example.com',
      phone: '+1234567895',
      avatar: undefined,
      joinedAt: new Date('2024-03-10'),
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

  return (
    <SafeAreaView className='flex-1 bg-gray-900'>
      {/* Header */}
      <View className='flex-row items-center px-6 py-4 border-b border-gray-800'>
        <TouchableOpacity onPress={onBack} className='mr-4'>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name='chevron-right' size={24} color='#6B7280' />
          </View>
        </TouchableOpacity>
        <Text className='text-xl font-bold text-white flex-1'>
          Gestionar usuarios
        </Text>
      </View>

      <ScrollView
        className='flex-1 px-6 py-6'
        showsVerticalScrollIndicator={false}>
        {/* Descripción */}
        <View className='mb-6'>
          <Text className='text-gray-300 text-base leading-6'>
            Busca y añade usuarios para poder invitarlos a tus presupuestos
            compartidos. Una vez añadidos, aparecerán como opciones al crear o
            editar presupuestos.
          </Text>
        </View>

        {/* Buscador */}
        <View className='mb-6'>
          <Text className='text-white font-semibold text-lg mb-3'>
            Buscar usuarios
          </Text>
          <View className='relative'>
            <TextInput
              className='bg-gray-800 rounded-2xl px-6 py-4 text-white text-base border border-gray-700'
              placeholder='Buscar por nombre o email...'
              placeholderTextColor='#6B7280'
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize='none'
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className='absolute right-4 top-4'>
                <Icon name='x' size={20} color='#6B7280' />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Resultados de búsqueda */}
        {searchQuery.trim().length > 0 && (
          <View className='mb-6'>
            <Text className='text-white font-semibold text-lg mb-3'>
              Resultados ({searchResults.length})
            </Text>
            {searchResults.length > 0 ? (
              <View className='space-y-3'>
                {searchResults.map((searchUser) => (
                  <View
                    key={searchUser.id}
                    className='bg-gray-800 rounded-2xl p-4 border border-gray-700 flex-row items-center'>
                    <View className='w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full items-center justify-center mr-4'>
                      <Text className='text-white font-bold text-lg'>
                        {searchUser.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className='flex-1'>
                      <Text className='text-white font-semibold text-base mb-1'>
                        {searchUser.name}
                      </Text>
                      <Text className='text-gray-400 text-sm'>
                        {searchUser.email}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddUser(searchUser)}
                      className='bg-purple-600 rounded-full w-10 h-10 items-center justify-center'>
                      <Icon name='check' size={16} color='white' />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View className='bg-gray-800 rounded-2xl p-6 border border-gray-700 items-center'>
                <Icon name='users' size={48} color='#6B7280' />
                <Text className='text-gray-400 text-base mt-3 text-center'>
                  No se encontraron usuarios con &quot;{searchQuery}&quot;
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Usuarios sugeridos */}
        <View className='mb-6'>
          <Text className='text-white font-semibold text-lg mb-3'>
            Usuarios sugeridos
          </Text>
          <Text className='text-gray-400 text-sm mb-4'>
            Usuarios populares que podrías conocer
          </Text>
          <View className='space-y-3'>
            {demoUsers.map((demoUser) => (
              <View
                key={demoUser.id}
                className='bg-gray-800 rounded-2xl p-4 border border-gray-700 flex-row items-center'>
                <View className='w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full items-center justify-center mr-4'>
                  <Text className='text-white font-bold text-lg'>
                    {demoUser.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className='flex-1'>
                  <Text className='text-white font-semibold text-base mb-1'>
                    {demoUser.name}
                  </Text>
                  <Text className='text-gray-400 text-sm'>
                    {demoUser.email}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleAddUser(demoUser)}
                  className='bg-gray-700 rounded-full w-10 h-10 items-center justify-center border border-gray-600'>
                  <Icon name='check' size={16} color='#9CA3AF' />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Información adicional */}
        <View className='bg-blue-900 bg-opacity-50 rounded-2xl p-4 border border-blue-700'>
          <View className='flex-row items-start'>
            <View className='w-8 h-8 bg-blue-600 rounded-lg items-center justify-center mr-3 mt-1'>
              <Text className='text-white text-lg'>ℹ️</Text>
            </View>
            <View className='flex-1'>
              <Text className='text-blue-300 font-semibold mb-2'>
                ¿Cómo funciona?
              </Text>
              <Text className='text-blue-200 text-sm leading-5'>
                • Busca usuarios por nombre o email{'\n'}• Añádelos a tu lista
                de contactos{'\n'}• Invítalos cuando crees presupuestos
                compartidos{'\n'}• Gestiona gastos en conjunto de forma fácil
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
