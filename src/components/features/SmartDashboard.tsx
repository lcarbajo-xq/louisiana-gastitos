import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import {
  useFinancialInsights,
  useSmartBudgeting
} from '../hooks/useAdvancedFeatures'
import { useRecommendations } from '../store/advancedStore'
import {
  BudgetAlert,
  OptimizationRecommendation,
  SpendingPrediction
} from '../types/advanced'

export const SmartDashboard: React.FC = () => {
  const { alerts, unreadAlerts, predictions } = useSmartBudgeting()
  const {
    getOverallFinancialHealth,
    analyzeSpendingPatterns,
    generateSmartRecommendations
  } = useFinancialInsights()
  const recommendations = useRecommendations()

  const [financialHealth, setFinancialHealth] = useState<any>(null)
  const [spendingPatterns, setSpendingPatterns] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Calcular salud financiera al cargar
    const health = getOverallFinancialHealth()
    setFinancialHealth(health)
  }, [getOverallFinancialHealth])

  const handleAnalyzePatterns = async () => {
    setIsAnalyzing(true)
    try {
      const patterns = await analyzeSpendingPatterns()
      setSpendingPatterns(patterns)

      // Generar recomendaciones basadas en patrones
      await generateSmartRecommendations()
    } catch (error) {
      console.error('Error analyzing patterns:', error)
      Alert.alert('Error', 'No se pudieron analizar los patrones de gasto')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getHealthColor = (score: number): string => {
    if (score >= 80) return '#10B981' // verde
    if (score >= 60) return '#F59E0B' // amarillo
    if (score >= 40) return '#F97316' // naranja
    return '#EF4444' // rojo
  }

  return (
    <ScrollView className='flex-1 bg-gray-900 px-4 py-6'>
      {/* Header */}
      <Text className='text-white text-2xl font-bold mb-6'>
        Dashboard Inteligente
      </Text>

      {/* Salud Financiera */}
      {financialHealth && (
        <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
          <Text className='text-white text-lg font-semibold mb-4'>
            Salud Financiera General
          </Text>

          <View className='flex-row items-center justify-between mb-4'>
            <Text className='text-gray-300 text-base'>Score General</Text>
            <View className='flex-row items-center'>
              <View
                className='w-3 h-3 rounded-full mr-2'
                style={{
                  backgroundColor: getHealthColor(financialHealth.score)
                }}
              />
              <Text
                className='text-lg font-bold'
                style={{ color: getHealthColor(financialHealth.score) }}>
                {financialHealth.score}/100
              </Text>
            </View>
          </View>

          <View className='space-y-2'>
            <View className='flex-row justify-between'>
              <Text className='text-gray-400'>Presupuestos:</Text>
              <Text className='text-white'>
                {financialHealth.budgetHealth}%
              </Text>
            </View>
            <View className='flex-row justify-between'>
              <Text className='text-gray-400'>Ahorros:</Text>
              <Text className='text-white'>
                {financialHealth.savingsHealth}%
              </Text>
            </View>
            <View className='flex-row justify-between'>
              <Text className='text-gray-400'>Consistencia:</Text>
              <Text className='text-white'>
                {financialHealth.consistencyHealth}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Alertas Activas */}
      {unreadAlerts.length > 0 && (
        <View className='bg-red-900/20 border border-red-500/30 rounded-2xl p-4 mb-6'>
          <Text className='text-red-400 text-lg font-semibold mb-3'>
            Alertas Activas ({unreadAlerts.length})
          </Text>
          {unreadAlerts.slice(0, 3).map((alert: BudgetAlert) => (
            <View key={alert.id} className='bg-red-900/10 rounded-xl p-3 mb-2'>
              <Text className='text-red-300 text-sm font-medium'>
                {alert.message}
              </Text>
              <Text className='text-red-400 text-xs mt-1'>
                {alert.type.toUpperCase()} - {alert.percentage}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Predicciones ML */}
      {predictions.length > 0 && (
        <View className='bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 mb-6'>
          <Text className='text-blue-400 text-lg font-semibold mb-3'>
            Predicciones de Gasto
          </Text>
          {predictions.slice(0, 3).map((prediction: SpendingPrediction) => (
            <View
              key={`${prediction.categoryId}-${prediction.period}`}
              className='bg-blue-900/10 rounded-xl p-3 mb-2'>
              <View className='flex-row justify-between items-start'>
                <View>
                  <Text className='text-blue-300 text-sm font-medium'>
                    {prediction.categoryId}
                  </Text>
                  <Text className='text-blue-400 text-xs'>
                    Próximo {prediction.period === 'week' ? 'semana' : 'mes'}
                  </Text>
                </View>
                <View className='items-end'>
                  <Text className='text-blue-200 font-bold'>
                    ${prediction.predictedAmount.toFixed(2)}
                  </Text>
                  <Text className='text-blue-400 text-xs'>
                    Confianza: {Math.round(prediction.confidence * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Análisis de Patrones */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <View className='flex-row justify-between items-center mb-4'>
          <Text className='text-white text-lg font-semibold'>
            Patrones de Gasto
          </Text>
          <TouchableOpacity
            onPress={handleAnalyzePatterns}
            disabled={isAnalyzing}
            className='bg-blue-600 px-4 py-2 rounded-lg'>
            <Text className='text-white text-sm'>
              {isAnalyzing ? 'Analizando...' : 'Analizar'}
            </Text>
          </TouchableOpacity>
        </View>

        {spendingPatterns.length > 0 ? (
          spendingPatterns.map((pattern, index) => (
            <View key={index} className='bg-gray-700 rounded-xl p-3 mb-2'>
              <Text className='text-white font-medium'>{pattern.pattern}</Text>
              <Text className='text-gray-400 text-xs mt-1'>
                Frecuencia: {pattern.frequency} veces - Promedio: $
                {pattern.averageAmount.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text className='text-gray-400 text-center py-4'>
            Analiza tus patrones de gasto para obtener insights personalizados
          </Text>
        )}
      </View>

      {/* Recomendaciones */}
      {recommendations.recommendations.filter(
        (rec: OptimizationRecommendation) => !rec.isImplemented
      ).length > 0 && (
        <View className='bg-green-900/20 border border-green-500/30 rounded-2xl p-4 mb-6'>
          <Text className='text-green-400 text-lg font-semibold mb-3'>
            Recomendaciones
          </Text>
          {recommendations.recommendations
            .filter((rec: OptimizationRecommendation) => !rec.isImplemented)
            .slice(0, 3)
            .map((rec: OptimizationRecommendation) => (
              <View
                key={rec.id}
                className='bg-green-900/10 rounded-xl p-3 mb-2'>
                <Text className='text-green-300 text-sm font-medium'>
                  {rec.title}
                </Text>
                <Text className='text-green-400 text-xs mt-1'>
                  {rec.description}
                </Text>
                <View className='flex-row justify-between items-center mt-2'>
                  <Text
                    className={`text-xs font-medium ${
                      rec.impact === 'high'
                        ? 'text-red-400'
                        : rec.impact === 'medium'
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                    Impacto: {rec.impact.toUpperCase()}
                  </Text>
                  {rec.potentialSavings && (
                    <Text className='text-green-300 text-xs font-bold'>
                      Ahorro: ${rec.potentialSavings.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  )
}

export default SmartDashboard
