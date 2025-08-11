import React, { useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useCategories } from '../hooks/useCategories'
import { ExpenseCategory } from '../types/expense'

interface CategoryManagerProps {
  visible: boolean
  onClose: () => void
  onSelectCategory?: (category: ExpenseCategory) => void
  mode?: 'select' | 'manage'
}

const PRESET_COLORS = [
  '#F59E0B',
  '#EC4899',
  '#10B981',
  '#8B5CF6',
  '#3B82F6',
  '#EF4444',
  '#F97316',
  '#84CC16',
  '#06B6D4',
  '#8B5A2B',
  '#6B7280',
  '#1F2937'
]

const PRESET_ICONS = [
  '🍽️',
  '🛍️',
  '🚗',
  '⭐',
  '📚',
  '⚡',
  '🏠',
  '💰',
  '🎮',
  '🏥',
  '✈️',
  '🎵',
  '💻',
  '📱',
  '👕',
  '⚽',
  '🎯',
  '🔧'
]

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  visible,
  onClose,
  onSelectCategory,
  mode = 'select'
}) => {
  const { addCategory, updateCategory, deleteCategory, toggleActive, search } =
    useCategories()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '⚡',
    color: '#6B7280',
    budget: ''
  })

  const filteredCategories = search(searchQuery)

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '⚡',
      color: '#6B7280',
      budget: ''
    })
    setEditingCategory(null)
    setShowAddForm(false)
  }

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es requerido')
      return
    }

    const categoryData = {
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      budget: formData.budget ? parseFloat(formData.budget) : undefined
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData)
    } else {
      addCategory(categoryData)
    }

    resetForm()
  }

  const handleEditCategory = (category: ExpenseCategory) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget?.toString() || ''
    })
    setEditingCategory(category)
    setShowAddForm(true)
  }

  const handleDeleteCategory = (category: ExpenseCategory) => {
    if (category.isDefault) {
      Alert.alert('Error', 'No puedes eliminar categorías predefinidas')
      return
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCategory(category.id)
        }
      ]
    )
  }

  const CategoryItem = ({ category }: { category: ExpenseCategory }) => (
    <View
      style={[styles.categoryItem, { opacity: category.isActive ? 1 : 0.5 }]}>
      <TouchableOpacity
        style={styles.categoryInfo}
        onPress={() => onSelectCategory?.(category)}
        disabled={!category.isActive}>
        <View
          style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.budget && (
            <Text style={styles.categoryBudget}>
              Presupuesto: ${category.budget}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {mode === 'manage' && (
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleActive(category.id)}>
            <Text style={styles.actionText}>
              {category.isActive ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCategory(category)}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          {!category.isDefault && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteCategory(category)}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )

  const CategoryForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder='Nombre de la categoría'
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholderTextColor='#6B7280'
      />

      <Text style={styles.sectionTitle}>Icono</Text>
      <View style={styles.iconGrid}>
        {PRESET_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              formData.icon === icon && styles.selectedIcon
            ]}
            onPress={() => setFormData({ ...formData, icon })}>
            <Text style={styles.iconText}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Color</Text>
      <View style={styles.colorGrid}>
        {PRESET_COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              formData.color === color && styles.selectedColor
            ]}
            onPress={() => setFormData({ ...formData, color })}
          />
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder='Presupuesto (opcional)'
        value={formData.budget}
        onChangeText={(text) => setFormData({ ...formData, budget: text })}
        keyboardType='numeric'
        placeholderTextColor='#6B7280'
      />

      <View style={styles.formActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={resetForm}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveCategory}>
          <Text style={[styles.buttonText, styles.saveButtonText]}>
            {editingCategory ? 'Actualizar' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'manage'
              ? 'Gestionar Categorías'
              : 'Seleccionar Categoría'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {!showAddForm ? (
          <>
            <TextInput
              style={styles.searchInput}
              placeholder='Buscar categorías...'
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor='#6B7280'
            />

            {mode === 'manage' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(true)}>
                <Text style={styles.addButtonText}>+ Agregar Categoría</Text>
              </TouchableOpacity>
            )}

            <ScrollView style={styles.categoryList}>
              {filteredCategories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </ScrollView>
          </>
        ) : (
          <ScrollView>
            <CategoryForm />
          </ScrollView>
        )}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  closeButton: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4
  },
  searchInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    color: '#FFFFFF',
    fontSize: 16
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  categoryList: {
    flex: 1,
    padding: 16
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  iconText: {
    fontSize: 18
  },
  categoryDetails: {
    flex: 1
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500'
  },
  categoryBudget: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 8
  },
  actionText: {
    fontSize: 16
  },
  formContainer: {
    padding: 16
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  iconOption: {
    width: 40,
    height: 40,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedIcon: {
    borderColor: '#8B5CF6'
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedColor: {
    borderColor: '#FFFFFF'
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#1F2937'
  },
  saveButton: {
    backgroundColor: '#8B5CF6'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280'
  },
  saveButtonText: {
    color: '#FFFFFF'
  }
})
