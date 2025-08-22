import React from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/Icon'
import { useInvitations } from '../store/sharedBudgetStore'
import { useUserStore } from '../store/userStore'
import { BudgetInvitation } from '../types/user'

interface InvitationsScreenProps {
  onGoBack: () => void
}

export const InvitationsScreen: React.FC<InvitationsScreenProps> = ({
  onGoBack
}) => {
  const { pendingInvitations, acceptInvitation, declineInvitation } =
    useInvitations()
  const { getUser } = useUserStore()

  const handleAcceptInvitation = async (invitation: BudgetInvitation) => {
    try {
      const success = await acceptInvitation(invitation.id)
      if (success) {
        Alert.alert(
          'Invitación aceptada',
          '¡Te has unido al presupuesto exitosamente!',
          [{ text: 'Continuar' }]
        )
      } else {
        Alert.alert('Error', 'No se pudo aceptar la invitación')
      }
    } catch (error) {
      Alert.alert('Error', 'Ha ocurrido un error al aceptar la invitación')
      console.error('Accept invitation error:', error)
    }
  }

  const handleDeclineInvitation = async (invitation: BudgetInvitation) => {
    Alert.alert(
      'Rechazar invitación',
      '¿Estás seguro de que quieres rechazar esta invitación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await declineInvitation(invitation.id)
              if (!success) {
                Alert.alert('Error', 'No se pudo rechazar la invitación')
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Ha ocurrido un error al rechazar la invitación'
              )
              console.error('Decline invitation error:', error)
            }
          }
        }
      ]
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const renderInvitation = (invitation: BudgetInvitation) => {
    const invitedBy = getUser(invitation.invitedBy)
    const expiresIn = Math.ceil(
      (invitation.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    return (
      <View
        key={invitation.id}
        className='rounded-2xl p-4 mb-4'
        style={{
          backgroundColor: '#1F2937',
          borderWidth: 1,
          borderColor: '#374151'
        }}>
        {/* Header */}
        <View className='flex-row items-start justify-between mb-3'>
          <View className='flex-1'>
            <Text className='text-white font-bold text-lg mb-1'>
              Invitación a presupuesto
            </Text>
            <Text className='text-gray-300 text-sm'>
              Invitado por: {invitedBy?.name || 'Usuario desconocido'}
            </Text>
            <Text className='text-gray-400 text-xs'>
              Enviado el {formatDate(invitation.sentAt)}
            </Text>
          </View>

          <View className='items-end'>
            <View
              className={`px-2 py-1 rounded-lg ${
                invitation.role === 'editor' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
              <Text className='text-white text-xs font-medium'>
                {invitation.role === 'editor' ? 'Editor' : 'Visualizador'}
              </Text>
            </View>
            {expiresIn <= 1 && (
              <Text className='text-red-400 text-xs mt-1'>Expira pronto</Text>
            )}
          </View>
        </View>

        {/* Message */}
        {invitation.message && (
          <View
            className='rounded-xl p-3 mb-3'
            style={{ backgroundColor: '#374151' }}>
            <Text style={{ color: '#D1D5DB' }} className='text-sm italic'>
              &ldquo;{invitation.message}&rdquo;
            </Text>
          </View>
        )}

        {/* Info */}
        <View className='mb-4'>
          <Text className='text-gray-400 text-sm'>
            • Podrás{' '}
            {invitation.role === 'editor'
              ? 'editar y agregar gastos'
              : 'ver los gastos'}
          </Text>
          <Text className='text-gray-400 text-sm'>
            • La invitación expira en {expiresIn} día
            {expiresIn !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Actions */}
        <View className='flex-row space-x-3'>
          <TouchableOpacity
            onPress={() => handleAcceptInvitation(invitation)}
            className='flex-1 bg-green-600 rounded-xl py-3 items-center'>
            <Text className='text-white font-semibold'>Aceptar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeclineInvitation(invitation)}
            className='flex-1 bg-red-600 rounded-xl py-3 items-center'>
            <Text className='text-white font-semibold'>Rechazar</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header */}
      <View className='px-6 py-4 border-b border-gray-700'>
        <View className='flex-row items-center'>
          <TouchableOpacity onPress={onGoBack} className='p-2 mr-3'>
            <Text className='text-white text-2xl'>←</Text>
          </TouchableOpacity>
          <View>
            <Text className='text-xl font-bold text-white'>Invitaciones</Text>
            <Text className='text-gray-400 text-sm'>
              {pendingInvitations.length} invitación
              {pendingInvitations.length !== 1 ? 'es' : ''} pendiente
              {pendingInvitations.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
        {pendingInvitations.length === 0 ? (
          /* Empty State */
          <View className='flex-1 items-center justify-center py-20 pb-32'>
            <View
              className='w-24 h-24 rounded-full items-center justify-center mb-6'
              style={{
                backgroundColor: '#1F2937',
                borderWidth: 1,
                borderColor: '#374151'
              }}>
              <Icon name='mail' size={32} color='#9CA3AF' />
            </View>
            <Text className='text-white font-bold text-xl mb-2'>
              Sin invitaciones pendientes
            </Text>
            <Text
              style={{ color: '#9CA3AF' }}
              className='text-center mb-8 max-w-sm'>
              Cuando alguien te invite a un presupuesto compartido, aparecerá
              aquí
            </Text>
            <TouchableOpacity
              onPress={onGoBack}
              className='bg-purple-600 px-8 py-3 rounded-xl'>
              <Text className='text-white font-semibold'>Volver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Invitations List */
          <View className='py-6 pb-24'>
            <Text style={{ color: '#9CA3AF' }} className='text-sm mb-4'>
              Revisa cuidadosamente cada invitación antes de aceptar
            </Text>
            {pendingInvitations.map(renderInvitation)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
