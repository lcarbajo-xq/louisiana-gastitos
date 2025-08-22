import React, { useState } from 'react'
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/ui/base/Icon'
import {
  useSharedBudgetActions,
  useSharedBudgetData
} from '../store/sharedBudgetStore'
import { useCurrentUser } from '../store/userStore'
import { SharedBudget } from '../types/user'

interface SharedBudgetsScreenProps {
  onCreateBudget: () => void
  onViewBudget: (budgetId: string) => void
  onManageInvitations: () => void
}

export const SharedBudgetsScreen: React.FC<SharedBudgetsScreenProps> = ({
  onCreateBudget,
  onViewBudget,
  onManageInvitations
}) => {
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useCurrentUser()
  const { budgets, invitations, calculateUsage } = useSharedBudgetData()
  const { deleteBudget } = useSharedBudgetActions()

  const onRefresh = async () => {
    setRefreshing(true)
    // En un sistema real, aquí se sincronizaría con el servidor
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleDeleteBudget = (budget: SharedBudget) => {
    const isOwner = budget.createdBy === user?.id

    Alert.alert(
      'Eliminar presupuesto',
      isOwner
        ? `¿Estás seguro de que quieres eliminar "${budget.name}"? Esta acción no se puede deshacer.`
        : `¿Estás seguro de que quieres salir del presupuesto "${budget.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isOwner ? 'Eliminar' : 'Salir',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteBudget(budget.id)
            if (!success) {
              Alert.alert('Error', 'No se pudo eliminar el presupuesto')
            }
          }
        }
      ]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusColor = (status: SharedBudget['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-blue-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: SharedBudget['status']) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'paused':
        return 'Pausado'
      case 'completed':
        return 'Completado'
      case 'archived':
        return 'Archivado'
      default:
        return 'Desconocido'
    }
  }

  const renderBudgetCard = (budget: SharedBudget) => {
    const usage = calculateUsage(budget.id)
    const userParticipant = budget.participants.find(
      (p) => p.userId === user?.id
    )

    return (
      <TouchableOpacity
        key={budget.id}
        onPress={() => onViewBudget(budget.id)}
        className='rounded-2xl p-4 mb-4'
        style={{
          backgroundColor: '#1F2937',
          borderWidth: 1,
          borderColor: '#374151'
        }}>
        {/* Header */}
        <View className='flex-row items-center justify-between mb-3'>
          <View className='flex-1'>
            <Text className='text-white font-bold text-lg' numberOfLines={1}>
              {budget.name}
            </Text>
            <Text style={{ color: '#9CA3AF' }} className='text-sm'>
              {budget.participants.length} participante
              {budget.participants.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <View className='items-end'>
            <View
              className={`px-2 py-1 rounded-lg ${getStatusColor(
                budget.status
              )}`}>
              <Text className='text-white text-xs font-medium'>
                {getStatusText(budget.status)}
              </Text>
            </View>
            <Text style={{ color: '#9CA3AF' }} className='text-xs mt-1'>
              {userParticipant?.role === 'owner'
                ? 'Propietario'
                : userParticipant?.role === 'editor'
                ? 'Editor'
                : 'Visualizador'}
            </Text>
          </View>
        </View>

        {/* Budget Progress */}
        <View className='mb-3'>
          <View className='flex-row justify-between items-center mb-2'>
            <Text style={{ color: '#D1D5DB' }} className='text-sm'>
              Progreso del presupuesto
            </Text>
            <Text className='text-white font-medium'>
              {formatCurrency(usage.totalSpent)} /{' '}
              {formatCurrency(budget.totalAmount)}
            </Text>
          </View>

          <View
            className='h-2 rounded-full overflow-hidden'
            style={{ backgroundColor: '#374151' }}>
            <View
              className={`h-full rounded-full ${
                usage.percentage >= 100
                  ? 'bg-red-500'
                  : usage.percentage >= 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </View>

          <Text style={{ color: '#9CA3AF' }} className='text-xs mt-1'>
            {usage.percentage.toFixed(1)}% utilizado •{' '}
            {formatCurrency(usage.remaining)} restante
          </Text>
        </View>

        {/* Description */}
        {budget.description && (
          <Text
            style={{ color: '#D1D5DB' }}
            className='text-sm mb-3'
            numberOfLines={2}>
            {budget.description}
          </Text>
        )}

        {/* Footer */}
        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center'>
            <Icon name='calendar' size={16} color='#9CA3AF' />
            <Text style={{ color: '#9CA3AF' }} className='text-xs ml-1'>
              {budget.period === 'weekly'
                ? 'Semanal'
                : budget.period === 'monthly'
                ? 'Mensual'
                : 'Anual'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleDeleteBudget(budget)}
            className='p-2'>
            <Icon name='x' size={16} color='#EF4444' />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header */}
      <View
        className='px-6 py-4'
        style={{ borderBottomWidth: 1, borderBottomColor: '#374151' }}>
        <View className='flex-row items-center justify-between'>
          <View>
            <Text className='text-2xl font-bold text-white'>
              Presupuestos Compartidos
            </Text>
            <Text style={{ color: '#9CA3AF' }} className='text-sm'>
              Gestiona tus gastos en equipo
            </Text>
          </View>

          <View className='flex-row items-center space-x-3'>
            {invitations.length > 0 && (
              <TouchableOpacity
                onPress={onManageInvitations}
                className='bg-purple-600 px-3 py-2 rounded-lg flex-row items-center'>
                <Text className='text-white font-medium text-sm mr-1'>
                  {invitations.length}
                </Text>
                <Text className='text-white text-xs'>
                  invitación{invitations.length !== 1 ? 'es' : ''}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onCreateBudget}
              className='bg-purple-600 w-10 h-10 rounded-full items-center justify-center'>
              <Text className='text-white font-bold text-lg'>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className='flex-1 px-6'
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {budgets.length === 0 ? (
          /* Empty State */
          <View className='flex-1 items-center justify-center py-20 pb-32'>
            <View
              className='w-24 h-24 rounded-full items-center justify-center mb-6'
              style={{
                backgroundColor: '#1F2937',
                borderWidth: 1,
                borderColor: '#374151'
              }}>
              <Icon name='shopping-bag' size={32} color='#9CA3AF' />
            </View>
            <Text className='text-white font-bold text-xl mb-2'>
              Sin presupuestos compartidos
            </Text>
            <Text
              style={{ color: '#9CA3AF' }}
              className='text-center mb-8 max-w-sm'>
              Crea tu primer presupuesto compartido o acepta una invitación para
              comenzar
            </Text>
            <TouchableOpacity
              onPress={onCreateBudget}
              className='bg-purple-600 px-8 py-3 rounded-xl'>
              <Text className='text-white font-semibold'>
                Crear Presupuesto
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Budget List */
          <View className='py-6 pb-24'>{budgets.map(renderBudgetCard)}</View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
