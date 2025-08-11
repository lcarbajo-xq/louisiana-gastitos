import React, { useState } from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { useCategories, useCategorySearch } from '../hooks/useCategories'
import { ExpenseCategory } from '../types/expense'

interface CategoryModalProps {
  visible: boolean
  onClose: () => void
  onSelect: (category: ExpenseCategory) => void
  selectedCategory: ExpenseCategory | null
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { initDefaults } = useCategories()
  const filteredCategories = useCategorySearch(searchQuery)

  // Inicializar categorías por defecto si no hay ninguna
  React.useEffect(() => {
    initDefaults()
  }, [initDefaults])

  const handleSelect = (category: ExpenseCategory) => {
    onSelect(category)
    onClose()
    setSearchQuery('')
  }

  const renderCategory = ({ item }: { item: ExpenseCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory?.id === item.id && styles.selectedCategory,
        !item.isActive && styles.inactiveCategory
      ]}
      onPress={() => handleSelect(item)}
      disabled={!item.isActive}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text
          style={[styles.categoryName, !item.isActive && styles.inactiveText]}>
          {item.name}
        </Text>
        {item.budget && (
          <Text
            style={[
              styles.categoryBudget,
              !item.isActive && styles.inactiveText
            ]}>
            Presupuesto: ${item.budget}
          </Text>
        )}
        {!item.isActive && (
          <Text style={styles.inactiveLabel}>Desactivada</Text>
        )}
      </View>
      {selectedCategory?.id === item.id && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seleccionar Categoría</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='Buscar categorías...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor='#6B7280'
          />
        </View>

        <FlatList
          data={filteredCategories.filter((cat) => cat.isActive !== false)}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#374151',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  listContainer: {
    paddingHorizontal: 20
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  selectedCategory: {
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#8B5CF6'
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryEmoji: {
    fontSize: 20
  },
  categoryInfo: {
    flex: 1
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  categoryBudget: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Helvetica',
    marginTop: 2
  },
  checkmark: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold'
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16
  },
  searchInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16
  },
  inactiveCategory: {
    opacity: 0.5
  },
  inactiveText: {
    color: '#6B7280'
  },
  inactiveLabel: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginTop: 2
  }
})
