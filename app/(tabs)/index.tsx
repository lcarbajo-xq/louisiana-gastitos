import { ThemedText } from '@/components/ThemedText'
import React, { useEffect } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import { useCategoryStore } from '../../src/store/categoryStore'

// Datos mock para la demostración
const mockExpenses = [
  {
    id: '1',
    name: 'Food & Drinks',
    amount: 44.8,
    description: 'Cheese, wine and food for cat',
    icon: '🍔',
    categoryName: 'Food & Drinks'
  },
  {
    id: '2',
    name: 'Shopping',
    amount: 247.98,
    description: 'Running shoes and cap',
    icon: '🛍️',
    categoryName: 'Shopping'
  },
  {
    id: '3',
    name: 'Health & Fitness',
    amount: 70.5,
    description: 'Renewed my gym membership',
    icon: '💪',
    categoryName: 'Health & Fitness'
  },
  {
    id: '4',
    name: 'Transport',
    amount: 22.19,
    description: 'Uber to downtown',
    icon: '🚗',
    categoryName: 'Transport'
  },
  {
    id: '5',
    name: 'Education',
    amount: 8.8,
    description: 'Ingredients for pasta and salads',
    icon: '📚',
    categoryName: 'Education'
  }
]

// Componente DonutChart con segmentos
interface DonutChartProps {
  data: {
    name: string
    total: number
    color: string
  }[]
  size?: number
  strokeWidth?: number
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 160,
  strokeWidth = 20
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const total = data.reduce((sum, item) => sum + item.total, 0)

  // Si no hay datos, mostrar un círculo gris
  if (total === 0 || data.length === 0) {
    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='transparent'
            stroke='#374151'
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
        </Svg>

        <View
          style={{
            position: 'absolute',
            top: strokeWidth,
            left: strokeWidth,
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: '#1F2937',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#374151'
          }}>
          <ThemedText
            style={{ fontSize: 18, fontWeight: 'bold', color: '#9CA3AF' }}>
            $0
          </ThemedText>
          <ThemedText style={{ fontSize: 12, opacity: 0.7, color: '#9CA3AF' }}>
            No data
          </ThemedText>
        </View>
      </View>
    )
  }

  let currentAngle = -90 // Start from top

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = item.total / total
          const strokeDasharray = percentage * circumference

          // Calculate rotation for this segment
          const rotation = currentAngle
          currentAngle += percentage * 360

          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill='transparent'
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeDasharray} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap='round'
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              opacity={0.9}
            />
          )
        })}
      </Svg>

      {/* Centro del donut */}
      <View
        style={{
          position: 'absolute',
          top: strokeWidth,
          left: strokeWidth,
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          backgroundColor: '#1F2937',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#374151'
        }}>
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
          ${total.toFixed(0)}
        </ThemedText>
        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Total</ThemedText>
      </View>
    </View>
  )
}

export default function HomeScreen() {
  const { categories, initializeDefaultCategories } = useCategoryStore()

  // Inicializar categorías predeterminadas si es necesario
  useEffect(() => {
    initializeDefaultCategories()
  }, [initializeDefaultCategories])

  // Obtener color de categoría por nombre
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName)
    return category?.color || '#6B7280'
  }

  // Obtener estadísticas de categorías mock
  const getCategoryStats = () => {
    const categoryTotals: { [key: string]: number } = {}

    mockExpenses.forEach((expense) => {
      categoryTotals[expense.categoryName] =
        (categoryTotals[expense.categoryName] || 0) + expense.amount
    })

    return Object.entries(categoryTotals)
      .map(([name, total]) => ({
        name,
        total,
        color: getCategoryColor(name)
      }))
      .sort((a, b) => b.total - a.total)
  }

  const categoryStats = getCategoryStats()

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior='automatic'
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity style={styles.monthSelector}>
            <Text style={styles.monthText}>June</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Gráfico circular segmentado con colores por categoría */}
        <View style={styles.chartSection}>
          <DonutChart data={categoryStats} size={200} strokeWidth={30} />

          {/* Leyenda de colores con círculos horizontal */}
          <View style={styles.legend}>
            {categoryStats.length > 0 ? (
              <>
                <View style={styles.legendRowHorizontal}>
                  {categoryStats.slice(0, 3).map((category) => {
                    return (
                      <View
                        key={category.name}
                        style={styles.legendItemHorizontal}>
                        <View
                          style={[
                            styles.legendCircle,
                            { backgroundColor: category.color }
                          ]}
                        />
                        <Text style={styles.legendText}>{category.name}</Text>
                      </View>
                    )
                  })}
                </View>
                {categoryStats.length > 3 && (
                  <View style={styles.legendRowHorizontal}>
                    {categoryStats.slice(3, 6).map((category) => {
                      return (
                        <View
                          key={category.name}
                          style={styles.legendItemHorizontal}>
                          <View
                            style={[
                              styles.legendCircle,
                              { backgroundColor: category.color }
                            ]}
                          />
                          <Text style={styles.legendText}>{category.name}</Text>
                        </View>
                      )
                    })}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.legendRowHorizontal}>
                <Text style={styles.noDataText}>No hay gastos registrados</Text>
              </View>
            )}
          </View>
        </View>

        {/* Lista de gastos recientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {mockExpenses.length > 0 ? (
            mockExpenses.map((expense) => (
              <TouchableOpacity key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseIconContainer}>
                  <View
                    style={[
                      styles.expenseIcon,
                      {
                        backgroundColor: getCategoryColor(expense.categoryName)
                      }
                    ]}>
                    <Text style={styles.expenseEmoji}>{expense.icon}</Text>
                  </View>
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseName}>{expense.name}</Text>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>
                  -${expense.amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.expenseItem}>
              <Text style={styles.noDataText}>
                No hay gastos recientes. ¡Agrega tu primer gasto!
              </Text>
            </View>
          )}
        </View>

        {/* Espacio adicional para la barra de navegación */}
        <View style={{ height: 120 }} />
      </ScrollView>
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
    padding: 20,
    paddingTop: 15,
    backgroundColor: '#000000'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Helvetica'
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666666'
  },
  chartSection: {
    alignItems: 'center',
    paddingVertical: 30
  },
  donutChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 25,
    borderColor: '#F59E0B',
    // Simularemos el efecto multicolor con un borde gradiente
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0
  },
  donutInner: {
    alignItems: 'center',
    backgroundColor: '#000000',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center'
  },
  totalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
    fontFamily: 'Helvetica'
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  legend: {
    marginTop: 25,
    paddingHorizontal: 20,
    paddingVertical: 5
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16
  },
  legendRowHorizontal: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12
  },
  legendItemHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontWeight: '400'
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  viewAllText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Helvetica'
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F'
  },
  expenseIconContainer: {
    marginRight: 12
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  expenseEmoji: {
    fontSize: 20
  },
  expenseDetails: {
    flex: 1
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'Helvetica'
  },
  expenseDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Helvetica'
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  noDataText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20
  },
  topCategoryText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Helvetica'
  }
})
