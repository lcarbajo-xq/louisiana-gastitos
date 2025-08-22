import React, { useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSavingsGoals } from '../store/advancedStore'
import { SavingsGoal } from '../types/advanced'

export const SavingsGoalsScreen: React.FC = () => {
  const { goals, createGoal, updateGoal, deleteGoal, addToGoal } =
    useSavingsGoals()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'other' as SavingsGoal['category'],
    priority: 'medium' as SavingsGoal['priority']
  })
  const [addAmount, setAddAmount] = useState('')

  const handleCreateGoal = () => {
    if (!formData.title || !formData.targetAmount || !formData.targetDate) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios')
      return
    }

    const targetDate = new Date(formData.targetDate)
    if (targetDate <= new Date()) {
      Alert.alert('Error', 'La fecha objetivo debe ser futura')
      return
    }

    createGoal({
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      targetDate,
      category: formData.category,
      priority: formData.priority,
      milestones: [
        { percentage: 25, achieved: false },
        { percentage: 50, achieved: false },
        { percentage: 75, achieved: false },
        { percentage: 100, achieved: false }
      ]
    })

    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      category: 'other',
      priority: 'medium'
    })
    setShowCreateModal(false)
    Alert.alert('Éxito', 'Meta de ahorro creada correctamente')
  }

  const handleAddToGoal = () => {
    if (!selectedGoal || !addAmount) {
      Alert.alert('Error', 'Por favor ingresa un monto válido')
      return
    }

    const amount = parseFloat(addAmount)
    if (amount <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor a 0')
      return
    }

    addToGoal(selectedGoal, amount)
    setAddAmount('')
    setShowAddModal(false)
    setSelectedGoal(null)
    Alert.alert(
      'Éxito',
      `Se agregaron $${amount.toFixed(2)} a tu meta de ahorro`
    )
  }

  const calculateProgress = (goal: SavingsGoal): number => {
    return goal.targetAmount > 0
      ? (goal.currentAmount / goal.targetAmount) * 100
      : 0
  }

  const calculateDaysLeft = (targetDate: Date): number => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const getPriorityColor = (priority: SavingsGoal['priority']): string => {
    switch (priority) {
      case 'high':
        return '#EF4444'
      case 'medium':
        return '#F59E0B'
      case 'low':
        return '#10B981'
      default:
        return '#6B7280'
    }
  }

  const getCategoryEmoji = (category: SavingsGoal['category']): string => {
    switch (category) {
      case 'emergency':
        return '🚨'
      case 'vacation':
        return '✈️'
      case 'purchase':
        return '🛍️'
      case 'investment':
        return '📈'
      default:
        return '💰'
    }
  }

  return (
    <View className='flex-1 bg-gray-900'>
      <ScrollView className='flex-1 px-4 py-6'>
        {/* Header */}
        <View className='flex-row justify-between items-center mb-6'>
          <Text className='text-white text-2xl font-bold'>Metas de Ahorro</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className='bg-blue-600 px-4 py-2 rounded-xl'>
            <Text className='text-white font-medium'>+ Nueva Meta</Text>
          </TouchableOpacity>
        </View>

        {/* Goals List */}
        {goals.length === 0 ? (
          <View className='bg-gray-800 rounded-2xl p-8 items-center'>
            <Text className='text-6xl mb-4'>🎯</Text>
            <Text className='text-white text-lg font-medium mb-2'>
              No tienes metas de ahorro
            </Text>
            <Text className='text-gray-400 text-center mb-4'>
              Crea tu primera meta de ahorro y comienza a construir tu futuro
              financiero
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className='bg-blue-600 px-6 py-3 rounded-xl'>
              <Text className='text-white font-medium'>Crear Primera Meta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal)
            const daysLeft = calculateDaysLeft(goal.targetDate)
            const dailyRequired =
              daysLeft > 0
                ? (goal.targetAmount - goal.currentAmount) / daysLeft
                : 0

            return (
              <View key={goal.id} className='bg-gray-800 rounded-2xl p-4 mb-4'>
                <View className='flex-row justify-between items-start mb-3'>
                  <View className='flex-1'>
                    <View className='flex-row items-center mb-2'>
                      <Text className='text-2xl mr-2'>
                        {getCategoryEmoji(goal.category)}
                      </Text>
                      <Text className='text-white text-lg font-semibold flex-1'>
                        {goal.title}
                      </Text>
                      <View
                        className='w-3 h-3 rounded-full'
                        style={{
                          backgroundColor: getPriorityColor(goal.priority)
                        }}
                      />
                    </View>
                    {goal.description && (
                      <Text className='text-gray-400 text-sm mb-2'>
                        {goal.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Progress Bar */}
                <View className='mb-3'>
                  <View className='flex-row justify-between mb-2'>
                    <Text className='text-gray-300 text-sm'>
                      ${goal.currentAmount.toFixed(2)} de $
                      {goal.targetAmount.toFixed(2)}
                    </Text>
                    <Text className='text-gray-300 text-sm font-medium'>
                      {Math.round(progress)}%
                    </Text>
                  </View>
                  <View className='bg-gray-700 rounded-full h-2'>
                    <View
                      className='bg-blue-500 rounded-full h-2'
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </View>
                </View>

                {/* Stats */}
                <View className='flex-row justify-between mb-4'>
                  <View className='items-center'>
                    <Text className='text-gray-400 text-xs'>
                      Días restantes
                    </Text>
                    <Text className='text-white font-bold'>{daysLeft}</Text>
                  </View>
                  <View className='items-center'>
                    <Text className='text-gray-400 text-xs'>
                      Diario requerido
                    </Text>
                    <Text className='text-white font-bold'>
                      ${Math.max(0, dailyRequired).toFixed(2)}
                    </Text>
                  </View>
                  <View className='items-center'>
                    <Text className='text-gray-400 text-xs'>Restante</Text>
                    <Text className='text-white font-bold'>
                      $
                      {Math.max(
                        0,
                        goal.targetAmount - goal.currentAmount
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Milestones */}
                <View className='flex-row justify-between mb-4'>
                  {goal.milestones.map((milestone, index) => (
                    <View key={index} className='items-center'>
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          milestone.achieved ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                        <Text className='text-white text-xs font-bold'>
                          {milestone.percentage}
                        </Text>
                      </View>
                      <Text className='text-gray-400 text-xs mt-1'>
                        {milestone.achieved ? '✓' : `${milestone.percentage}%`}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View className='flex-row space-x-3'>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGoal(goal.id)
                      setShowAddModal(true)
                    }}
                    className='flex-1 bg-green-600 py-3 rounded-xl items-center'>
                    <Text className='text-white font-medium'>
                      Agregar Dinero
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Eliminar Meta',
                        `¿Estás seguro de que quieres eliminar "${goal.title}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Eliminar',
                            style: 'destructive',
                            onPress: () => deleteGoal(goal.id)
                          }
                        ]
                      )
                    }}
                    className='bg-red-600 px-4 py-3 rounded-xl items-center'>
                    <Text className='text-white font-medium'>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })
        )}
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={showCreateModal} transparent animationType='slide'>
        <View className='flex-1 bg-black/50 justify-end'>
          <View className='bg-gray-800 rounded-t-3xl p-6'>
            <Text className='text-white text-xl font-bold mb-6'>
              Nueva Meta de Ahorro
            </Text>

            <TextInput
              placeholder='Nombre de la meta'
              placeholderTextColor='#9CA3AF'
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              className='bg-gray-700 text-white px-4 py-3 rounded-xl mb-4'
            />

            <TextInput
              placeholder='Descripción (opcional)'
              placeholderTextColor='#9CA3AF'
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              className='bg-gray-700 text-white px-4 py-3 rounded-xl mb-4'
              multiline
            />

            <TextInput
              placeholder='Monto objetivo'
              placeholderTextColor='#9CA3AF'
              value={formData.targetAmount}
              onChangeText={(text) =>
                setFormData({ ...formData, targetAmount: text })
              }
              className='bg-gray-700 text-white px-4 py-3 rounded-xl mb-4'
              keyboardType='numeric'
            />

            <TextInput
              placeholder='Fecha objetivo (YYYY-MM-DD)'
              placeholderTextColor='#9CA3AF'
              value={formData.targetDate}
              onChangeText={(text) =>
                setFormData({ ...formData, targetDate: text })
              }
              className='bg-gray-700 text-white px-4 py-3 rounded-xl mb-6'
            />

            <View className='flex-row space-x-3'>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                className='flex-1 bg-gray-600 py-3 rounded-xl items-center'>
                <Text className='text-white font-medium'>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateGoal}
                className='flex-1 bg-blue-600 py-3 rounded-xl items-center'>
                <Text className='text-white font-medium'>Crear Meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal visible={showAddModal} transparent animationType='slide'>
        <View className='flex-1 bg-black/50 justify-end'>
          <View className='bg-gray-800 rounded-t-3xl p-6'>
            <Text className='text-white text-xl font-bold mb-6'>
              Agregar Dinero
            </Text>

            <TextInput
              placeholder='Monto a agregar'
              placeholderTextColor='#9CA3AF'
              value={addAmount}
              onChangeText={setAddAmount}
              className='bg-gray-700 text-white px-4 py-3 rounded-xl mb-6 text-center text-2xl'
              keyboardType='numeric'
            />

            <View className='flex-row space-x-3'>
              <TouchableOpacity
                onPress={() => {
                  setShowAddModal(false)
                  setSelectedGoal(null)
                  setAddAmount('')
                }}
                className='flex-1 bg-gray-600 py-3 rounded-xl items-center'>
                <Text className='text-white font-medium'>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddToGoal}
                className='flex-1 bg-green-600 py-3 rounded-xl items-center'>
                <Text className='text-white font-medium'>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default SavingsGoalsScreen
