import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

export const DashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity style={styles.monthSelector}>
          <Text style={styles.monthText}>June</Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico Circular */}
      <View style={styles.chartContainer}>
        <View style={styles.chartPlaceholder}>
          {/* Placeholder para Victory Chart */}
          <View style={styles.chartCenter}>
            <Text style={styles.chartLabel}>Total expenses</Text>
            <Text style={styles.chartValue}>$ 671.89</Text>
          </View>
        </View>
      </View>

      {/* Leyenda de categorías */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>🍕 Food</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
          <Text style={styles.legendText}>💪 Health & Fitness</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
          <Text style={styles.legendText}>🛍️ Shopping</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
          <Text style={styles.legendText}>🚗 Transport</Text>
        </View>
      </View>

      {/* Lista de gastos recientes */}
      <View style={styles.expensesContainer}>
        <View style={styles.expensesHeader}>
          <Text style={styles.expensesTitle}>Recent Expenses</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.expensesList}>
          <View style={styles.expenseCard}>
            <View style={styles.expenseRow}>
              <View
                style={[styles.expenseIcon, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.expenseEmoji}>🍕</Text>
              </View>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseCategory}>Food</Text>
                <Text style={styles.expenseDescription}>
                  Cheese, wine and food for cat
                </Text>
              </View>
              <Text style={styles.expenseAmount}>-$44.80</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600'
  },
  monthSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  monthText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '500'
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 32
  },
  chartPlaceholder: {
    width: 256,
    height: 256,
    backgroundColor: '#1F2937',
    borderRadius: 128,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  chartCenter: {
    alignItems: 'center'
  },
  chartLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.6
  },
  chartValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold'
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 24
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  legendText: {
    color: '#FFFFFF',
    fontSize: 14
  },
  expensesContainer: {
    flex: 1,
    paddingHorizontal: 24
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  expensesTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  viewAllText: {
    color: '#3B82F6',
    fontSize: 18
  },
  expensesList: {
    flex: 1
  },
  expenseCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  expenseEmoji: {
    color: '#FFFFFF',
    fontSize: 18
  },
  expenseDetails: {
    flex: 1
  },
  expenseCategory: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500'
  },
  expenseDescription: {
    color: '#9CA3AF',
    fontSize: 14
  },
  expenseAmount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  }
})
