import React from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/ui/base/Icon'
import { useCurrentUser, useUserActions } from '../store/userStore'

interface ProfileScreenProps {
  onLogout: () => void
  onManageUsers: () => void
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onManageUsers
}) => {
  const { user } = useCurrentUser()
  const { logout } = useUserActions()

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout()
            onLogout()
          }
        }
      ]
    )
  }

  const menuItems = [
    {
      id: 'users',
      title: 'Gestionar usuarios',
      subtitle: 'Añadir y buscar usuarios para presupuestos',
      icon: 'users' as const,
      onPress: onManageUsers
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      subtitle: 'Configurar alertas y recordatorios',
      icon: 'bell' as const,
      onPress: () =>
        Alert.alert('Próximamente', 'Esta función estará disponible pronto')
    },
    {
      id: 'privacy',
      title: 'Privacidad',
      subtitle: 'Configuración de datos y privacidad',
      icon: 'shield' as const,
      onPress: () =>
        Alert.alert('Próximamente', 'Esta función estará disponible pronto')
    },
    {
      id: 'help',
      title: 'Ayuda y soporte',
      subtitle: 'Obtener ayuda con la aplicación',
      icon: 'help-circle' as const,
      onPress: () =>
        Alert.alert('Próximamente', 'Esta función estará disponible pronto')
    }
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Header con información del usuario */}
        <View className='px-6 py-8'>
          <View className='items-center mb-8'>
            <View
              className='w-24 h-24 rounded-full items-center justify-center mb-4'
              style={{
                backgroundColor: '#1F2937',
                borderWidth: 1,
                borderColor: '#374151'
              }}>
              <Text className='text-3xl font-bold text-white'>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className='text-2xl font-bold text-white mb-1'>
              {user?.name}
            </Text>
            <Text style={{ color: '#9CA3AF' }}>{user?.email}</Text>
          </View>

          {/* Estadísticas rápidas */}
          <View
            className='rounded-2xl p-6 mb-6'
            style={{
              backgroundColor: '#1F2937',
              borderWidth: 1,
              borderColor: '#374151'
            }}>
            <Text className='text-white text-lg font-semibold mb-4'>
              Resumen de cuenta
            </Text>
            <View className='flex-row justify-between'>
              <View className='items-center'>
                <Text
                  className='text-2xl font-bold'
                  style={{ color: '#F59E0B' }}>
                  5
                </Text>
                <Text style={{ color: '#9CA3AF' }} className='text-sm'>
                  Presupuestos
                </Text>
              </View>
              <View className='items-center'>
                <Text
                  className='text-2xl font-bold'
                  style={{ color: '#EC4899' }}>
                  12
                </Text>
                <Text style={{ color: '#9CA3AF' }} className='text-sm'>
                  Gastos
                </Text>
              </View>
              <View className='items-center'>
                <Text
                  className='text-2xl font-bold'
                  style={{ color: '#10B981' }}>
                  €850
                </Text>
                <Text style={{ color: '#9CA3AF' }} className='text-sm'>
                  Ahorrados
                </Text>
              </View>
            </View>
          </View>

          {/* Menú de opciones */}
          <View className='space-y-3'>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                className='rounded-2xl p-4 flex-row items-center'
                style={{
                  backgroundColor: '#1F2937',
                  borderWidth: 1,
                  borderColor: '#374151'
                }}>
                <View
                  className='w-12 h-12 rounded-xl items-center justify-center mr-4'
                  style={{ backgroundColor: '#374151' }}>
                  <Icon name={item.icon} size={20} color='#9CA3AF' />
                </View>
                <View className='flex-1'>
                  <Text className='text-white font-semibold text-base mb-1'>
                    {item.title}
                  </Text>
                  <Text style={{ color: '#9CA3AF' }} className='text-sm'>
                    {item.subtitle}
                  </Text>
                </View>
                <Icon name='chevron-right' size={20} color='#6B7280' />
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón de logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className='bg-red-600 rounded-2xl px-6 py-5 mt-12 mb-12 flex-row items-center justify-center'>
            <Icon name='log-out' size={20} color='white' />
            <Text className='text-white font-semibold text-base ml-3'>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
