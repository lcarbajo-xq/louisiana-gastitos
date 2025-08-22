import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Share from 'react-native-share'
import { useAdvancedFeatures } from '../hooks/useAdvancedFeatures'
import { ExportService } from '../services/ExportService'
import { useAutoReports } from '../store/advancedStore'

export const ExportScreen: React.FC = () => {
  const { exportData, generateCustomReport } = useAdvancedFeatures()
  const { reports, createReport, toggleReport } = useAutoReports()
  const [isExporting, setIsExporting] = useState(false)
  const [lastExportUrl, setLastExportUrl] = useState<string | null>(null)

  const handleExport = async (
    format: 'csv' | 'excel' | 'json',
    dataType: 'expenses' | 'budgets' | 'full',
    period: number // días hacia atrás
  ) => {
    setIsExporting(true)
    try {
      const endDate = new Date()
      const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)

      const exportContent = await exportData(format, dataType, {
        start: startDate,
        end: endDate
      })

      // Guardar archivo
      const filename = `expense_tracker_${dataType}_${format}_${Date.now()}.${format}`
      const filePath = await ExportService.saveExportFile(
        exportContent,
        filename
      )
      setLastExportUrl(filePath)

      Alert.alert(
        'Exportación Completada',
        `Los datos se han exportado correctamente.`,
        [
          { text: 'OK' },
          {
            text: 'Compartir',
            onPress: () => shareFile(filePath, exportContent, format)
          }
        ]
      )
    } catch (error) {
      console.error('Error exporting data:', error)
      Alert.alert('Error', 'No se pudieron exportar los datos')
    } finally {
      setIsExporting(false)
    }
  }

  const shareFile = async (
    filePath: string,
    content: string,
    format: string
  ) => {
    try {
      const options = {
        title: 'Compartir datos de gastos',
        message: `Datos exportados en formato ${format.toUpperCase()}`,
        url: `data:text/${format};charset=utf-8,${encodeURIComponent(content)}`,
        filename: `expense_data.${format}`
      }

      await Share.open(options)
    } catch (error) {
      console.log('Error sharing file:', error)
    }
  }

  const handleGenerateReport = async (
    type: 'summary' | 'detailed' | 'categories'
  ) => {
    setIsExporting(true)
    try {
      const report = await generateCustomReport(type, 'monthly')

      const options = {
        title: 'Compartir reporte',
        message: 'Reporte de gastos generado automáticamente',
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(report)}`,
        filename: `expense_report_${type}.txt`
      }

      await Share.open(options)
    } catch (error) {
      console.error('Error generating report:', error)
      Alert.alert('Error', 'No se pudo generar el reporte')
    } finally {
      setIsExporting(false)
    }
  }

  const setupAutoReport = () => {
    Alert.alert(
      'Nuevo Reporte Automático',
      'Selecciona la frecuencia del reporte',
      [
        {
          text: 'Semanal',
          onPress: () => createAutoReport('weekly')
        },
        {
          text: 'Mensual',
          onPress: () => createAutoReport('monthly')
        },
        {
          text: 'Trimestral',
          onPress: () => createAutoReport('quarterly')
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  const createAutoReport = (type: 'weekly' | 'monthly' | 'quarterly') => {
    createReport({
      name: `Reporte ${
        type === 'weekly'
          ? 'Semanal'
          : type === 'monthly'
          ? 'Mensual'
          : 'Trimestral'
      } Automático`,
      type,
      recipients: [], // Se configuraría con emails reales
      template: 'summary',
      includeSections: {
        overview: true,
        categoryBreakdown: true,
        budgetStatus: true,
        savings: true,
        predictions: true,
        recommendations: true
      },
      schedule: {
        dayOfWeek: type === 'weekly' ? 1 : undefined, // Lunes
        dayOfMonth: type === 'monthly' ? 1 : undefined, // Primer día del mes
        time: '09:00'
      },
      isActive: true
    })

    Alert.alert('Éxito', `Reporte ${type} configurado correctamente`)
  }

  if (isExporting) {
    return (
      <View className='flex-1 bg-gray-900 justify-center items-center'>
        <ActivityIndicator size='large' color='#3B82F6' />
        <Text className='text-white text-lg mt-4'>
          Procesando exportación...
        </Text>
      </View>
    )
  }

  return (
    <ScrollView className='flex-1 bg-gray-900 px-4 py-6'>
      <Text className='text-white text-2xl font-bold mb-6'>Exportar Datos</Text>

      {/* Exportación rápida */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <Text className='text-white text-lg font-semibold mb-4'>
          Exportación Rápida
        </Text>
        <Text className='text-gray-400 text-sm mb-4'>
          Exporta tus datos de los últimos 30 días en diferentes formatos
        </Text>

        <View className='space-y-3'>
          <View className='flex-row space-x-3'>
            <TouchableOpacity
              onPress={() => handleExport('csv', 'expenses', 30)}
              className='flex-1 bg-blue-600 py-3 rounded-xl items-center'>
              <Text className='text-white font-medium'>CSV - Gastos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExport('excel', 'expenses', 30)}
              className='flex-1 bg-green-600 py-3 rounded-xl items-center'>
              <Text className='text-white font-medium'>Excel - Gastos</Text>
            </TouchableOpacity>
          </View>

          <View className='flex-row space-x-3'>
            <TouchableOpacity
              onPress={() => handleExport('json', 'full', 30)}
              className='flex-1 bg-purple-600 py-3 rounded-xl items-center'>
              <Text className='text-white font-medium'>JSON - Todo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExport('csv', 'budgets', 30)}
              className='flex-1 bg-orange-600 py-3 rounded-xl items-center'>
              <Text className='text-white font-medium'>CSV - Presupuestos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Períodos personalizados */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <Text className='text-white text-lg font-semibold mb-4'>
          Períodos Personalizados
        </Text>

        <View className='space-y-3'>
          <TouchableOpacity
            onPress={() => handleExport('csv', 'expenses', 7)}
            className='bg-gray-700 py-3 px-4 rounded-xl flex-row justify-between items-center'>
            <Text className='text-white'>Última semana (CSV)</Text>
            <Text className='text-gray-400'>📅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleExport('excel', 'full', 90)}
            className='bg-gray-700 py-3 px-4 rounded-xl flex-row justify-between items-center'>
            <Text className='text-white'>Últimos 3 meses (Excel)</Text>
            <Text className='text-gray-400'>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleExport('json', 'full', 365)}
            className='bg-gray-700 py-3 px-4 rounded-xl flex-row justify-between items-center'>
            <Text className='text-white'>Último año (JSON completo)</Text>
            <Text className='text-gray-400'>🗂️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reportes automáticos */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <Text className='text-white text-lg font-semibold mb-4'>Reportes</Text>

        <View className='space-y-3'>
          <TouchableOpacity
            onPress={() => handleGenerateReport('summary')}
            className='bg-blue-600 py-3 px-4 rounded-xl flex-row justify-between items-center'>
            <Text className='text-white font-medium'>
              Generar Reporte Resumen
            </Text>
            <Text className='text-white'>📋</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleGenerateReport('detailed')}
            className='bg-green-600 py-3 px-4 rounded-xl flex-row justify-between items-center'>
            <Text className='text-white font-medium'>Reporte Detallado</Text>
            <Text className='text-white'>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleGenerateReport('categories')}
            className='bg-purple-600 py-3 px-4 rounded-xl flex-row justify-between items-center'>
            <Text className='text-white font-medium'>
              Reporte por Categorías
            </Text>
            <Text className='text-white'>🏷️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reportes automáticos configurados */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <View className='flex-row justify-between items-center mb-4'>
          <Text className='text-white text-lg font-semibold'>
            Reportes Automáticos
          </Text>
          <TouchableOpacity
            onPress={setupAutoReport}
            className='bg-blue-600 px-3 py-2 rounded-lg'>
            <Text className='text-white text-sm'>+ Nuevo</Text>
          </TouchableOpacity>
        </View>

        {reports.length === 0 ? (
          <View className='items-center py-4'>
            <Text className='text-gray-400 mb-2'>
              No hay reportes automáticos configurados
            </Text>
            <TouchableOpacity
              onPress={setupAutoReport}
              className='bg-blue-600 px-4 py-2 rounded-lg'>
              <Text className='text-white text-sm'>
                Configurar Primer Reporte
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} className='bg-gray-700 rounded-xl p-3 mb-2'>
              <View className='flex-row justify-between items-center'>
                <View>
                  <Text className='text-white font-medium'>{report.name}</Text>
                  <Text className='text-gray-400 text-xs'>
                    {report.type} • {report.schedule.time} •{' '}
                    {report.isActive ? 'Activo' : 'Pausado'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleReport(report.id)}
                  className={`px-3 py-1 rounded ${
                    report.isActive ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                  <Text className='text-white text-xs'>
                    {report.isActive ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Google Sheets Integration */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <Text className='text-white text-lg font-semibold mb-4'>
          Integración Google Sheets
        </Text>
        <Text className='text-gray-400 text-sm mb-4'>
          Próximamente: Sincroniza automáticamente tus datos con Google Sheets
        </Text>
        <TouchableOpacity
          disabled
          className='bg-gray-600 py-3 rounded-xl items-center'>
          <Text className='text-gray-400 font-medium'>
            Configurar Google Sheets (Próximamente)
          </Text>
        </TouchableOpacity>
      </View>

      {lastExportUrl && (
        <View className='bg-green-900/20 border border-green-500/30 rounded-2xl p-4 mb-6'>
          <Text className='text-green-400 font-medium mb-2'>
            ✅ Última exportación completada
          </Text>
          <Text className='text-green-300 text-sm'>{lastExportUrl}</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default ExportScreen
