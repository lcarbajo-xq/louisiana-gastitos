import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CreateSharedBudgetScreen } from '../../src/screens/CreateSharedBudgetScreen'
import { InvitationsScreen } from '../../src/screens/InvitationsScreen'
import { SharedBudgetsScreen } from '../../src/screens/SharedBudgetsScreen'
import { useCurrentUser } from '../../src/store/userStore'

type SharedScreen = 'budgets' | 'create-budget' | 'view-budget' | 'invitations'

export default function SharedTab() {
  const [currentScreen, setCurrentScreen] = useState<SharedScreen>('budgets')
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const { isLoggedIn } = useCurrentUser()

  // Si no está logueado, mostrar mensaje
  if (!isLoggedIn) {
    return (
      <SafeAreaView className='flex-1 bg-gray-900'>
        <View className='flex-1 items-center justify-center p-6'>
          <Text className='text-white text-lg text-center mb-4'>
            Inicia sesión para ver tus presupuestos compartidos
          </Text>
          <Text className='text-gray-400 text-center'>
            Ve al perfil para iniciar sesión
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Navegación entre pantallas
  switch (currentScreen) {
    case 'create-budget':
      return (
        <CreateSharedBudgetScreen
          onBudgetCreated={(budgetId) => {
            setSelectedBudgetId(budgetId)
            setCurrentScreen('budgets')
          }}
          onCancel={() => setCurrentScreen('budgets')}
        />
      )

    case 'invitations':
      return <InvitationsScreen onGoBack={() => setCurrentScreen('budgets')} />

    case 'view-budget':
      // Aquí podrías agregar una pantalla específica para ver un presupuesto
      return (
        <SafeAreaView className='flex-1 bg-gray-900'>
          <View className='flex-1 items-center justify-center p-6'>
            <Text className='text-white text-lg mb-4'>
              Vista de presupuesto: {selectedBudgetId}
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentScreen('budgets')}
              className='bg-purple-600 px-6 py-3 rounded-lg'>
              <Text className='text-white font-medium'>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )

    default:
      return (
        <SharedBudgetsScreen
          onCreateBudget={() => setCurrentScreen('create-budget')}
          onViewBudget={(budgetId) => {
            setSelectedBudgetId(budgetId)
            setCurrentScreen('view-budget')
          }}
          onManageInvitations={() => setCurrentScreen('invitations')}
        />
      )
  }
}
