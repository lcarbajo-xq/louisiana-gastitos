import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import { CategoryModal } from '../src/components/CategoryModal'
import { DatePicker } from '../src/components/DatePicker'
import { SuccessMessage } from '../src/components/SuccessMessage'
import { useCategoryStore } from '../src/store/categoryStore'
import { useExpenseStore } from '../src/store/expenseStore'

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date())
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const addExpense = useExpenseStore((state) => state.addExpense)
  const categories = useCategoryStore((state) => state.categories)

  const selectedCategoryData = categories.find(
    (cat) => cat.id === selectedCategory
  )

  const handleAmountChange = (value: string) => {
    // Permitir solo números y punto decimal
    const cleanValue = value.replace(/[^0-9.]/g, '')
    // Evitar múltiples puntos decimales
    const parts = cleanValue.split('.')
    if (parts.length > 2) {
      return
    }
    setAmount(cleanValue)
  }

  const getDisplayAmount = () => {
    if (!amount) return ''
    return amount
  }

  const handleSave = () => {
    const numericAmount = parseFloat(amount)

    if (!amount || numericAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category')
      return
    }

    const categoryData = categories.find((cat) => cat.id === selectedCategory)
    if (!categoryData) {
      Alert.alert('Error', 'Invalid category selected')
      return
    }

    addExpense({
      amount: numericAmount,
      category: categoryData,
      description: description.trim(),
      date,
      paymentMethod: 'card'
    })

    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      router.back()
    }, 1500)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancel}>
              <Text style={styles.headerButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Expense</Text>
            <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
              <Text style={styles.headerButtonText}>✓</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View style={styles.amountSection}>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={getDisplayAmount()}
                onChangeText={handleAmountChange}
                keyboardType='numeric'
                placeholder='0'
                placeholderTextColor='rgba(255,255,255,0.3)'
                maxLength={10}
              />
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Category Selector */}
            <TouchableOpacity
              style={[
                styles.categorySelector,
                selectedCategory && {
                  backgroundColor: selectedCategoryData?.color + '40',
                  borderColor: selectedCategoryData?.color
                }
              ]}
              onPress={() => setShowCategoryModal(true)}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: selectedCategoryData?.color || '#8B5CF6' }
                ]}>
                <Text style={styles.categoryEmoji}>
                  {selectedCategoryData?.icon || '⭐'}
                </Text>
              </View>
              <Text style={styles.categoryText}>
                {selectedCategoryData?.name || 'Select Category'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Date Selector */}
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {date.toDateString() === new Date().toDateString()
                  ? 'Today'
                  : date.toLocaleDateString()}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            {/* Description Input */}
            <TextInput
              style={styles.descriptionInput}
              placeholder='Write more, describe the details'
              placeholderTextColor='rgba(255,255,255,0.5)'
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical='top'
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.attachButton}>
              <Text style={styles.attachIcon}>📎</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveIcon}>✓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}>
              <Text style={styles.cancelIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Modals */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(categoryId: string) => {
          setSelectedCategory(categoryId)
          setShowCategoryModal(false)
        }}
        selectedCategory={selectedCategory}
      />

      <DatePicker
        visible={showDatePicker}
        date={date}
        onDateChange={setDate}
        onClose={() => setShowDatePicker(false)}
      />

      <SuccessMessage
        visible={showSuccess}
        message='Expense added successfully!'
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000'
  },
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  headerButton: {
    width: 40,
    height: 40,
    backgroundColor: '#374151',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 40
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencySymbol: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginRight: 8
  },
  amountInput: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    backgroundColor: 'transparent',
    minWidth: 120
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 20
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  categoryIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryEmoji: {
    fontSize: 20
  },
  categoryText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Helvetica'
  },
  chevron: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600'
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Helvetica'
  },
  calendarIcon: {
    fontSize: 20
  },
  descriptionInput: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Helvetica',
    height: 120,
    textAlignVertical: 'top'
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16
  },
  attachButton: {
    width: 48,
    height: 48,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  attachIcon: {
    fontSize: 20
  },
  saveButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold'
  },
  cancelButton: {
    width: 48,
    height: 48,
    backgroundColor: '#374151',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelIcon: {
    fontSize: 20,
    color: '#FFFFFF'
  }
})
