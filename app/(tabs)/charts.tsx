import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const transactions = [
  {
    id: 1,
    date: 'Today',
    amount: '-$44.80',
    description: 'Cheese, wine and food for cat',
    category: 'Food',
    color: '#F59E0B'
  },
  {
    id: 2,
    date: 'Yesterday',
    amount: '-$247.98',
    description: 'Running shoes and cap',
    category: 'Shopping',
    color: '#EC4899'
  },
  {
    id: 3,
    date: 'Yesterday',
    amount: '-$70.50',
    description: 'Renewed my gym membership',
    category: 'Health & Fitness',
    color: '#8B5CF6'
  },
  {
    id: 4,
    date: '2 days ago',
    amount: '-$22.19',
    description: 'Uber to downtown',
    category: 'Transport',
    color: '#10B981'
  },
  {
    id: 5,
    date: '3 days ago',
    amount: '-$8.80',
    description: 'Coffee and pastry',
    category: 'Food',
    color: '#F59E0B'
  },
  {
    id: 6,
    date: '3 days ago',
    amount: '-$155.00',
    description: 'Groceries for the week',
    category: 'Food',
    color: '#F59E0B'
  },
  {
    id: 7,
    date: '1 week ago',
    amount: '-$89.99',
    description: 'Netflix and Spotify subscriptions',
    category: 'Entertainment',
    color: '#3B82F6'
  }
]

export default function ChartsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gráficos y Historial</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Transacciones</Text>
          {transactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}>
              <View style={styles.transactionIconContainer}>
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.color }
                  ]}>
                  <Text style={styles.transactionIconText}>
                    {transaction.category === 'Food' && '🍕'}
                    {transaction.category === 'Shopping' && '🛍️'}
                    {transaction.category === 'Health & Fitness' && '💪'}
                    {transaction.category === 'Transport' && '🚗'}
                    {transaction.category === 'Entertainment' && '🎬'}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={styles.transactionAmount}>{transaction.amount}</Text>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginBottom: 15
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F'
  },
  transactionIconContainer: {
    marginRight: 12
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  transactionIconText: {
    fontSize: 20
  },
  transactionDetails: {
    flex: 1
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'Helvetica'
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Helvetica'
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Helvetica'
  }
})
