import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {
  useCategoryAnalytics,
  useCategoryBudgets
} from '../hooks/useCategories'

interface CategoryStatsProps {
  onCategoryPress?: (categoryId: string) => void
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  onCategoryPress
}) => {
  const {
    getCategoryDistribution,
    getTrendingCategories,
    getUnusedCategories
  } = useCategoryAnalytics()
  const { getAllBudgetStatuses, getOverBudgetCategories } = useCategoryBudgets()

  const distribution = getCategoryDistribution()
  const trending = getTrendingCategories()
  const unused = getUnusedCategories()
  const budgetStatuses = getAllBudgetStatuses()
  const overBudget = getOverBudgetCategories()

  const DistributionChart = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Distribución por Categoría</Text>
      <View style={styles.chartContainer}>
        {distribution.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.distributionItem}
            onPress={() =>
              item.category?.id && onCategoryPress?.(item.category.id)
            }>
            <View style={styles.distributionInfo}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: item.category?.color }
                ]}
              />
              <Text style={styles.categoryLabel}>{item.category?.name}</Text>
            </View>
            <View style={styles.distributionStats}>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
              <Text style={styles.percentage}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const BudgetOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Estado de Presupuestos</Text>
      {budgetStatuses.length === 0 ? (
        <Text style={styles.emptyText}>No hay presupuestos configurados</Text>
      ) : (
        <View style={styles.budgetContainer}>
          {budgetStatuses.map((status, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.budgetItem,
                status?.isOverBudget && styles.overBudgetItem
              ]}
              onPress={() =>
                status?.categoryId && onCategoryPress?.(status.categoryId)
              }>
              <View style={styles.budgetHeader}>
                <Text
                  style={[
                    styles.budgetCategory,
                    status?.isOverBudget && styles.overBudgetText
                  ]}>
                  {
                    distribution.find(
                      (d) => d.category?.id === status?.categoryId
                    )?.category?.name
                  }
                </Text>
                <Text
                  style={[
                    styles.budgetStatus,
                    status?.isOverBudget && styles.overBudgetText
                  ]}>
                  {status?.isOverBudget ? '⚠️ Excedido' : '✅ En límite'}
                </Text>
              </View>
              <View style={styles.budgetProgress}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(status?.percentage || 0, 100)}%`,
                      backgroundColor: status?.isOverBudget
                        ? '#EF4444'
                        : '#10B981'
                    }
                  ]}
                />
              </View>
              <Text style={styles.budgetText}>
                ${status?.spent.toFixed(2)} de ${status?.budget.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const TrendingCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categorías en Tendencia</Text>
      {trending.length === 0 ? (
        <Text style={styles.emptyText}>Sin tendencias detectadas</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.trendingContainer}>
            {trending.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.trendingItem, { borderColor: category.color }]}
                onPress={() => onCategoryPress?.(category.id)}>
                <Text style={styles.trendingIcon}>{category.icon}</Text>
                <Text style={styles.trendingName}>{category.name}</Text>
                <Text style={styles.trendingBadge}>📈 Trending</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )

  const UnusedCategories = () =>
    unused.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías Sin Uso</Text>
        <Text style={styles.sectionSubtitle}>
          Estas categorías no han sido utilizadas recientemente
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.unusedContainer}>
            {unused.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.unusedItem}
                onPress={() => onCategoryPress?.(category.id)}>
                <Text style={styles.unusedIcon}>{category.icon}</Text>
                <Text style={styles.unusedName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {overBudget.length > 0 && (
        <View style={[styles.section, styles.alertSection]}>
          <Text style={styles.alertTitle}>⚠️ Alertas de Presupuesto</Text>
          <Text style={styles.alertText}>
            {overBudget.length} categoría
            {overBudget.length > 1 ? 's han' : ' ha'} excedido su presupuesto
          </Text>
        </View>
      )}

      <DistributionChart />
      <BudgetOverview />
      <TrendingCategories />
      <UnusedCategories />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  section: {
    padding: 16,
    marginBottom: 8
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12
  },
  alertSection: {
    backgroundColor: '#FEF2F2',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  alertTitle: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  alertText: {
    color: '#7F1D1D',
    fontSize: 14
  },
  chartContainer: {
    gap: 8
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8
  },
  distributionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1
  },
  distributionStats: {
    alignItems: 'flex-end'
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  percentage: {
    color: '#9CA3AF',
    fontSize: 12
  },
  budgetContainer: {
    gap: 12
  },
  budgetItem: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12
  },
  overBudgetItem: {
    backgroundColor: '#1F1917',
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  budgetCategory: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500'
  },
  budgetStatus: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500'
  },
  overBudgetText: {
    color: '#EF4444'
  },
  budgetProgress: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    borderRadius: 2
  },
  budgetText: {
    color: '#9CA3AF',
    fontSize: 14
  },
  trendingContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16
  },
  trendingItem: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1
  },
  trendingIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  trendingName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4
  },
  trendingBadge: {
    fontSize: 10,
    color: '#10B981'
  },
  unusedContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16
  },
  unusedItem: {
    backgroundColor: '#1F2937',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.7,
    minWidth: 80
  },
  unusedIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  unusedName: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center'
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20
  }
})
