import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const expenseCategories = [
  {
    name: 'Food',
    amount: '-$44.80',
    description: 'Cheese, wine and food for cat',
    color: '#F59E0B',
    icon: '🧀'
  },
  {
    name: 'Shopping',
    amount: '-$247.98',
    description: 'Running shoes and cap',
    color: '#EC4899',
    icon: '🛍️'
  },
  {
    name: 'Health & Fitness',
    amount: '-$70.50',
    description: 'Renewed my gym membership',
    color: '#8B5CF6',
    icon: '💜'
  },
  {
    name: 'Transport',
    amount: '-$22.19',
    description: 'Uber to downtown',
    color: '#10B981',
    icon: '🚗'
  },
  {
    name: 'Education',
    amount: '-$8.80',
    description: 'Ingredients for pasta and salads',
    color: '#3B82F6',
    icon: '📚'
  }
]

export default function HomeScreen() {
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

        {/* Gráfico circular simplificado */}
        <View style={styles.chartSection}>
          <View style={styles.donutChart}>
            <View style={styles.donutInner}>
              <Text style={styles.totalLabel}>Total expenses</Text>
              <Text style={styles.totalAmount}>$ 671.89</Text>
            </View>
          </View>

          {/* Leyenda de colores */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: '#F59E0B' }]}
                />
                <Text style={styles.legendText}>Food</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: '#10B981' }]}
                />
                <Text style={styles.legendText}>Health & Fitness</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: '#8B5CF6' }]}
                />
                <Text style={styles.legendText}>Transport</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: '#EC4899' }]}
                />
                <Text style={styles.legendText}>Shopping</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: '#3B82F6' }]}
                />
                <Text style={styles.legendText}>Education</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: '#6B7280' }]}
                />
                <Text style={styles.legendText}>Other</Text>
              </View>
            </View>
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

          {expenseCategories.map((expense, index) => (
            <TouchableOpacity key={index} style={styles.expenseItem}>
              <View style={styles.expenseIconContainer}>
                <View
                  style={[
                    styles.expenseIcon,
                    { backgroundColor: expense.color }
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
              <Text style={styles.expenseAmount}>{expense.amount}</Text>
            </TouchableOpacity>
          ))}
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
    marginTop: 30,
    paddingHorizontal: 20
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
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
  }
})
