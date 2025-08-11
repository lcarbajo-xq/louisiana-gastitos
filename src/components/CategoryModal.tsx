import React from 'react'
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { useCategoryStore } from '../store/categoryStore'

interface CategoryModalProps {
  visible: boolean
  onClose: () => void
  onSelect: (categoryId: string) => void
  selectedCategory: string | null
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCategory
}) => {
  const categories = useCategoryStore((state) => state.categories)

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => onSelect(item.id)}>
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.budget && (
          <Text style={styles.categoryBudget}>Budget: ${item.budget}</Text>
        )}
      </View>
      {selectedCategory === item.id && <Text style={styles.checkmark}>✓</Text>}
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
          <Text style={styles.title}>Select Category</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
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
  }
})
