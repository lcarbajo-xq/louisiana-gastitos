import React, { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useCategoryPrediction } from '../hooks/useCategories'
import { ExpenseCategory } from '../types/expense'

interface CategorySuggestionsProps {
  description: string
  amount?: number
  onSelectCategory: (category: ExpenseCategory) => void
  selectedCategoryId?: string
  style?: any
}

export const CategorySuggestions: React.FC<CategorySuggestionsProps> = ({
  description,
  amount,
  onSelectCategory,
  selectedCategoryId,
  style
}) => {
  const { getSuggestions, getBestMatch } = useCategoryPrediction()
  const [suggestions, setSuggestions] = useState<ExpenseCategory[]>([])
  const [bestMatch, setBestMatch] = useState<ExpenseCategory | null>(null)

  useEffect(() => {
    if (description.trim()) {
      const newSuggestions = getSuggestions(description, amount, 4)
      const newBestMatch = getBestMatch(description, amount)

      setSuggestions(newSuggestions)
      setBestMatch(newBestMatch)
    } else {
      setSuggestions([])
      setBestMatch(null)
    }
  }, [description, amount, getSuggestions, getBestMatch])

  if (!description.trim() || suggestions.length === 0) {
    return null
  }

  return (
    <View style={[styles.container, style]}>
      {bestMatch && bestMatch.id !== selectedCategoryId && (
        <View style={styles.bestMatchContainer}>
          <Text style={styles.bestMatchLabel}>💡 Sugerencia principal:</Text>
          <TouchableOpacity
            style={[
              styles.bestMatchChip,
              {
                backgroundColor: bestMatch.color + '20',
                borderColor: bestMatch.color
              }
            ]}
            onPress={() => onSelectCategory(bestMatch)}>
            <Text style={styles.chipIcon}>{bestMatch.icon}</Text>
            <Text style={[styles.chipText, { color: bestMatch.color }]}>
              {bestMatch.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.suggestionsLabel}>Otras sugerencias:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}>
        {suggestions
          .filter(
            (category) =>
              category.id !== selectedCategoryId &&
              category.id !== bestMatch?.id
          )
          .map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.suggestionChip,
                { borderColor: category.color + '40' }
              ]}
              onPress={() => onSelectCategory(category)}>
              <Text style={styles.chipIcon}>{category.icon}</Text>
              <Text style={styles.chipText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  )
}

interface SmartCategoryInputProps {
  description: string
  amount?: number
  selectedCategory?: ExpenseCategory
  onSelectCategory: (category: ExpenseCategory) => void
  onShowAllCategories: () => void
  style?: any
}

export const SmartCategoryInput: React.FC<SmartCategoryInputProps> = ({
  description,
  amount,
  selectedCategory,
  onSelectCategory,
  onShowAllCategories,
  style
}) => {
  const { getBestMatch } = useCategoryPrediction()
  const [autoSuggested, setAutoSuggested] = useState(false)

  useEffect(() => {
    // Auto-seleccionar categoría si hay una predicción con alta confianza
    if (description.trim() && !selectedCategory && !autoSuggested) {
      const bestMatch = getBestMatch(description, amount)
      if (bestMatch) {
        onSelectCategory(bestMatch)
        setAutoSuggested(true)
      }
    }
  }, [
    description,
    amount,
    selectedCategory,
    autoSuggested,
    getBestMatch,
    onSelectCategory
  ])

  // Reset auto-suggestion flag when description changes significantly
  useEffect(() => {
    setAutoSuggested(false)
  }, [description])

  return (
    <View style={[styles.smartInputContainer, style]}>
      <Text style={styles.label}>Categoría</Text>

      <TouchableOpacity
        style={[
          styles.categorySelector,
          selectedCategory && {
            backgroundColor: selectedCategory.color + '20',
            borderColor: selectedCategory.color
          }
        ]}
        onPress={onShowAllCategories}>
        {selectedCategory ? (
          <View style={styles.selectedCategoryContent}>
            <View
              style={[
                styles.selectedCategoryIcon,
                { backgroundColor: selectedCategory.color }
              ]}>
              <Text style={styles.selectedCategoryIconText}>
                {selectedCategory.icon}
              </Text>
            </View>
            <Text
              style={[
                styles.selectedCategoryName,
                { color: selectedCategory.color }
              ]}>
              {selectedCategory.name}
            </Text>
            {autoSuggested && (
              <View style={styles.autoSuggestedBadge}>
                <Text style={styles.autoSuggestedText}>AI</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.placeholderText}>Seleccionar categoría</Text>
        )}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <CategorySuggestions
        description={description}
        amount={amount}
        onSelectCategory={(category) => {
          onSelectCategory(category)
          setAutoSuggested(false)
        }}
        selectedCategoryId={selectedCategory?.id}
        style={styles.suggestions}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  bestMatchContainer: {
    marginBottom: 12
  },
  bestMatchLabel: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6
  },
  bestMatchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: 'flex-start'
  },
  suggestionsLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8
  },
  suggestionsContainer: {
    gap: 8,
    paddingRight: 16
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#1F2937'
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  smartInputContainer: {
    marginBottom: 16
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  categorySelector: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#374151'
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  selectedCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  selectedCategoryIconText: {
    fontSize: 16,
    color: '#FFFFFF'
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1
  },
  autoSuggestedBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8
  },
  autoSuggestedText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700'
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 16
  },
  chevron: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600'
  },
  suggestions: {
    marginTop: 12
  }
})
