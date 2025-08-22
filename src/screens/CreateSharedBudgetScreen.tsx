import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/ui/base/Icon'
import { useCategoryStore } from '../store/categoryStore'
import { useSharedBudgetActions } from '../store/sharedBudgetStore'
import { useCurrentUser, useUserActions } from '../store/userStore'
import { User } from '../types/user'

interface CreateSharedBudgetScreenProps {
  onBudgetCreated: (budgetId: string) => void
  onCancel: () => void
}

export const CreateSharedBudgetScreen: React.FC<
  CreateSharedBudgetScreenProps
> = ({ onBudgetCreated, onCancel }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [canAddExpenses, setCanAddExpenses] = useState(true)
  const [canEditBudget, setCanEditBudget] = useState(false)
  const [canInviteUsers, setCanInviteUsers] = useState(false)
  const [requireApproval, setRequireApproval] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [showUserSearch, setShowUserSearch] = useState(false)

  const { createBudget } = useSharedBudgetActions()
  const { categories } = useCategoryStore()
  const { user } = useCurrentUser()
  const { searchUsers } = useUserActions()

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '')
    if (numericValue === '') return ''

    const number = parseFloat(numericValue)
    if (isNaN(number)) return ''

    return number.toLocaleString('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el presupuesto')
      return false
    }

    if (!amount || parseFloat(amount.replace(/[^0-9.]/g, '')) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido')
      return false
    }

    if (!selectedCategoryId) {
      Alert.alert('Error', 'Por favor selecciona una categoría')
      return false
    }

    return true
  }

  const handleCreateBudget = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const budgetId = await createBudget({
        name: name.trim(),
        description: description.trim() || undefined,
        totalAmount: parseFloat(amount.replace(/[^0-9.]/g, '')),
        period,
        categoryId: selectedCategoryId,
        permissions: {
          canAddExpenses,
          canEditBudget,
          canInviteUsers,
          requireApproval
        },
        alertThresholds: {
          warning: 80,
          danger: 95
        },
        status: 'active',
        isPublic,
        startDate: new Date()
      })

      Alert.alert(
        'Presupuesto creado',
        '¡Tu presupuesto compartido ha sido creado exitosamente!',
        [
          {
            text: 'Continuar',
            onPress: () => onBudgetCreated(budgetId)
          }
        ]
      )
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el presupuesto')
      console.error('Create budget error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const periodOptions = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' }
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header */}
      <View className='px-6 py-4 border-b border-gray-700'>
        <View className='flex-row items-center justify-between'>
          <TouchableOpacity onPress={onCancel} className='p-2'>
            <Icon name='x' size={24} color='white' />
          </TouchableOpacity>
          <Text className='text-xl font-bold text-white'>
            Nuevo Presupuesto
          </Text>
          <View className='w-8' />
        </View>
      </View>

      <ScrollView className='flex-1 px-6' showsVerticalScrollIndicator={false}>
        <View className='py-6 space-y-6'>
          {/* Basic Info */}
          <View>
            <Text className='text-white font-bold text-lg mb-4'>
              Información básica
            </Text>

            {/* Name */}
            <View className='mb-4'>
              <Text className='text-white font-medium mb-2'>
                Nombre del presupuesto
              </Text>
              <TextInput
                style={{ backgroundColor: '#1F2937' }}
                className='text-white px-4 py-4 rounded-xl text-base'
                placeholder='Ej: Gastos del hogar'
                placeholderTextColor='#6B7280'
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            {/* Description */}
            <View className='mb-4'>
              <Text className='text-white font-medium mb-2'>
                Descripción (opcional)
              </Text>
              <TextInput
                style={{ backgroundColor: '#1F2937' }}
                className='text-white px-4 py-4 rounded-xl text-base'
                placeholder='Describe el propósito de este presupuesto'
                placeholderTextColor='#6B7280'
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Amount */}
            <View className='mb-4'>
              <Text className='text-white font-medium mb-2'>Monto total</Text>
              <TextInput
                style={{ backgroundColor: '#1F2937' }}
                className='text-white px-4 py-4 rounded-xl text-base'
                placeholder='$0.00'
                placeholderTextColor='#6B7280'
                value={formatCurrency(amount)}
                onChangeText={(value) =>
                  setAmount(value.replace(/[^0-9.]/g, ''))
                }
                keyboardType='numeric'
              />
            </View>

            {/* Period */}
            <View className='mb-4'>
              <Text className='text-white font-medium mb-2'>Período</Text>
              <View className='flex-row space-x-2'>
                {periodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setPeriod(option.value as any)}
                    className={`flex-1 py-3 px-4 rounded-xl ${
                      period === option.value
                        ? 'bg-purple-600'
                        : 'style={{backgroundColor:"#1F2937"}}'
                    }`}>
                    <Text
                      className={`text-center font-medium ${
                        period === option.value ? 'text-white' : 'text-gray-300'
                      }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Category Selection */}
          <View>
            <Text className='text-white font-bold text-lg mb-4'>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className='flex-row space-x-3'>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategoryId(category.id)}
                    className={`p-4 rounded-xl min-w-[100px] items-center ${
                      selectedCategoryId === category.id
                        ? 'bg-purple-600'
                        : 'style={{backgroundColor:"#1F2937"}}'
                    }`}>
                    <View
                      className='w-8 h-8 rounded-full items-center justify-center mb-2'
                      style={{ backgroundColor: category.color }}>
                      <Icon
                        name={category.icon as any}
                        size={16}
                        color='white'
                      />
                    </View>
                    <Text
                      className={`text-sm font-medium text-center ${
                        selectedCategoryId === category.id
                          ? 'text-white'
                          : 'text-gray-300'
                      }`}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Permissions */}
          <View>
            <Text className='text-white font-bold text-lg mb-4'>
              Permisos y configuración
            </Text>

            <View className='space-y-4'>
              {/* Public Budget */}
              <View className='flex-row items-center justify-between bg-gray-800 p-4 rounded-xl'>
                <View className='flex-1'>
                  <Text className='text-white font-medium'>
                    Presupuesto público
                  </Text>
                  <Text className='text-gray-400 text-sm'>
                    Otros usuarios pueden encontrar y solicitar unirse
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: '#374151', true: '#8B5CF6' }}
                  thumbColor={isPublic ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>

              {/* Can Add Expenses */}
              <View className='flex-row items-center justify-between bg-gray-800 p-4 rounded-xl'>
                <View className='flex-1'>
                  <Text className='text-white font-medium'>
                    Permitir agregar gastos
                  </Text>
                  <Text className='text-gray-400 text-sm'>
                    Los miembros pueden agregar gastos al presupuesto
                  </Text>
                </View>
                <Switch
                  value={canAddExpenses}
                  onValueChange={setCanAddExpenses}
                  trackColor={{ false: '#374151', true: '#8B5CF6' }}
                  thumbColor={canAddExpenses ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>

              {/* Can Edit Budget */}
              <View className='flex-row items-center justify-between bg-gray-800 p-4 rounded-xl'>
                <View className='flex-1'>
                  <Text className='text-white font-medium'>
                    Permitir editar presupuesto
                  </Text>
                  <Text className='text-gray-400 text-sm'>
                    Los editores pueden modificar el presupuesto
                  </Text>
                </View>
                <Switch
                  value={canEditBudget}
                  onValueChange={setCanEditBudget}
                  trackColor={{ false: '#374151', true: '#8B5CF6' }}
                  thumbColor={canEditBudget ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>

              {/* Can Invite Users */}
              <View className='flex-row items-center justify-between bg-gray-800 p-4 rounded-xl'>
                <View className='flex-1'>
                  <Text className='text-white font-medium'>
                    Permitir invitar usuarios
                  </Text>
                  <Text className='text-gray-400 text-sm'>
                    Los editores pueden invitar nuevos miembros
                  </Text>
                </View>
                <Switch
                  value={canInviteUsers}
                  onValueChange={setCanInviteUsers}
                  trackColor={{ false: '#374151', true: '#8B5CF6' }}
                  thumbColor={canInviteUsers ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>

              {/* Require Approval */}
              <View className='flex-row items-center justify-between bg-gray-800 p-4 rounded-xl'>
                <View className='flex-1'>
                  <Text className='text-white font-medium'>
                    Requerir aprobación
                  </Text>
                  <Text className='text-gray-400 text-sm'>
                    Los gastos deben ser aprobados por el propietario
                  </Text>
                </View>
                <Switch
                  value={requireApproval}
                  onValueChange={setRequireApproval}
                  trackColor={{ false: '#374151', true: '#8B5CF6' }}
                  thumbColor={requireApproval ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            </View>
          </View>

          {/* Invite Users Section */}
          <View>
            <Text className='text-white font-bold text-lg mb-4'>
              Invitar usuarios
            </Text>
            <Text className='text-gray-400 text-sm mb-4'>
              Añade usuarios que puedan ver y gestionar este presupuesto
            </Text>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <View className='mb-4'>
                <Text className='text-white font-medium mb-3'>
                  Usuarios seleccionados ({selectedUsers.length})
                </Text>
                <View className='space-y-2'>
                  {selectedUsers.map((selectedUser) => (
                    <View
                      key={selectedUser.id}
                      className='bg-gray-800 rounded-xl p-3 flex-row items-center justify-between'>
                      <View className='flex-row items-center flex-1'>
                        <View className='w-10 h-10 bg-purple-600 rounded-full items-center justify-center mr-3'>
                          <Text className='text-white font-bold text-sm'>
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className='flex-1'>
                          <Text className='text-white font-medium'>
                            {selectedUser.name}
                          </Text>
                          <Text className='text-gray-400 text-sm'>
                            {selectedUser.email}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedUsers((prev) =>
                            prev.filter((u) => u.id !== selectedUser.id)
                          )
                        }}
                        className='p-2'>
                        <Icon name='x' size={16} color='#EF4444' />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Add Users Button */}
            <TouchableOpacity
              onPress={() => setShowUserSearch(true)}
              className='bg-gray-800 rounded-xl p-4 flex-row items-center justify-center border-2 border-dashed border-gray-600'>
              <Icon name='users' size={20} color='#8B5CF6' />
              <Text className='text-purple-400 font-medium ml-2'>
                {selectedUsers.length === 0
                  ? 'Invitar usuarios'
                  : 'Añadir más usuarios'}
              </Text>
            </TouchableOpacity>

            {/* User Search Modal */}
            {showUserSearch && (
              <View className='absolute inset-0 bg-black bg-opacity-50 z-50'>
                <View className='flex-1 justify-center px-6'>
                  <View className='bg-gray-800 rounded-2xl p-6 max-h-96'>
                    <View className='flex-row items-center justify-between mb-4'>
                      <Text className='text-white font-bold text-lg'>
                        Buscar usuarios
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowUserSearch(false)}
                        className='p-2'>
                        <Icon name='x' size={20} color='#6B7280' />
                      </TouchableOpacity>
                    </View>

                    <Text className='text-gray-400 text-sm mb-4'>
                      Los usuarios disponibles aparecerán aquí. En una versión
                      completa, podrías buscar por email o nombre.
                    </Text>

                    {/* Demo Users */}
                    <ScrollView className='max-h-48'>
                      {searchUsers('')
                        .filter(
                          (searchUser) =>
                            searchUser.id !== user?.id &&
                            !selectedUsers.some(
                              (selected) => selected.id === searchUser.id
                            )
                        )
                        .map((availableUser) => (
                          <TouchableOpacity
                            key={availableUser.id}
                            onPress={() => {
                              setSelectedUsers((prev) => [
                                ...prev,
                                availableUser
                              ])
                              setShowUserSearch(false)
                            }}
                            className='bg-gray-700 rounded-xl p-3 flex-row items-center mb-2'>
                            <View className='w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3'>
                              <Text className='text-white font-bold text-sm'>
                                {availableUser.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View className='flex-1'>
                              <Text className='text-white font-medium'>
                                {availableUser.name}
                              </Text>
                              <Text className='text-gray-400 text-sm'>
                                {availableUser.email}
                              </Text>
                            </View>
                            <Icon name='check' size={16} color='#10B981' />
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            onPress={handleCreateBudget}
            disabled={isLoading}
            className='bg-purple-600 rounded-xl py-4 items-center mt-8 mb-8'>
            {isLoading ? (
              <ActivityIndicator color='white' />
            ) : (
              <Text className='text-white font-semibold text-lg'>
                Crear Presupuesto
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
