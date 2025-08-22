import React, { useState } from 'react'
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useAdvancedFeatures } from '../hooks/useAdvancedFeatures'
import { ExportService } from '../services/ExportService'
import { useAutoReports } from '../store/advancedStore'

export const DataExportScreen: React.FC = () => {
  const { exportData, generateCustomReport } = useAdvancedFeatures()
  const autoReports = useAutoReports()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>(
    'csv'
  )
  const [exportType, setExportType] = useState<'expenses' | 'budgets' | 'full'>(
    'expenses'
  )
  const [reportPeriod, setReportPeriod] = useState<
    'weekly' | 'monthly' | 'quarterly'
  >('monthly')

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        end: new Date()
      }

      const data = await exportData(exportFormat, exportType, dateRange)

      // Guardar archivo
      const filename = `expense-tracker-${exportType}-${Date.now()}.${exportFormat}`
      const filePath = await ExportService.saveExportFile(data, filename)

      // Compartir archivo
      await Share.share({
        message: `Exportación de ${exportType} en formato ${exportFormat.toUpperCase()}`,
        title: 'Expense Tracker - Exportación'
      })

      Alert.alert(
        'Exportación Completada',
        `Los datos han sido exportados exitosamente en formato ${exportFormat.toUpperCase()}`,
        [
          {
            text: 'Compartir',
            onPress: () => ExportService.shareExportFile(filePath)
          },
          { text: 'OK' }
        ]
      )
    } catch (error) {
      console.error('Export error:', error)
      Alert.alert('Error', 'No se pudo completar la exportación')
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateReport = async () => {
    setIsExporting(true)
    try {
      const report = await generateCustomReport('detailed', reportPeriod)

      // Compartir reporte
      await Share.share({
        message: report,
        title: `Reporte ${reportPeriod} - Expense Tracker`
      })

      Alert.alert(
        'Reporte Generado',
        'El reporte ha sido generado y está listo para compartir'
      )
    } catch (error) {
      console.error('Report error:', error)
      Alert.alert('Error', 'No se pudo generar el reporte')
    } finally {
      setIsExporting(false)
    }
  }

  const createAutoReport = () => {
    autoReports.createReport({
      name: `Reporte Automático ${reportPeriod}`,
      type: reportPeriod,
      recipients: ['usuario@email.com'], // Configurable
      template: 'detailed',
      includeSections: {
        overview: true,
        categoryBreakdown: true,
        budgetStatus: true,
        savings: true,
        predictions: true,
        recommendations: true
      },
      schedule: {
        time: '09:00'
      },
      isActive: true
    })

    Alert.alert('Éxito', 'Reporte automático configurado correctamente')
  }

  return (
    <ScrollView className='flex-1 bg-gray-900 px-4 py-6'>
      {/* Header */}
      <Text className='text-white text-2xl font-bold mb-6'>
        Exportar y Reportes
      </Text>

      {/* Exportación de Datos */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <Text className='text-white text-lg font-semibold mb-4'>
          Exportar Datos
        </Text>

        {/* Formato */}
        <Text className='text-gray-300 text-sm mb-2'>Formato de archivo:</Text>
        <View className='flex-row mb-4'>
          {['csv', 'excel', 'json'].map((format) => (
            <TouchableOpacity
              key={format}
              onPress={() => setExportFormat(format as any)}
              className={`mr-3 px-4 py-2 rounded-lg ${
                exportFormat === format ? 'bg-blue-600' : 'bg-gray-700'
              }`}>
              <Text className='text-white text-sm font-medium'>
                {format.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tipo de datos */}
        <Text className='text-gray-300 text-sm mb-2'>Datos a exportar:</Text>
        <View className='flex-row mb-6'>
          {[
            { key: 'expenses', label: 'Gastos' },
            { key: 'budgets', label: 'Presupuestos' },
            { key: 'full', label: 'Todo' }
          ].map((type) => (
            <TouchableOpacity
              key={type.key}
              onPress={() => setExportType(type.key as any)}
              className={`mr-3 px-4 py-2 rounded-lg ${
                exportType === type.key ? 'bg-green-600' : 'bg-gray-700'
              }`}>
              <Text className='text-white text-sm font-medium'>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleExportData}
          disabled={isExporting}
          className={`py-3 rounded-xl items-center ${
            isExporting ? 'bg-gray-600' : 'bg-blue-600'
          }`}>
          <Text className='text-white font-medium'>
            {isExporting ? 'Exportando...' : 'Exportar Datos'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generación de Reportes */}
      <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
        <Text className='text-white text-lg font-semibold mb-4'>
          Generar Reporte
        </Text>

        {/* Período */}
        <Text className='text-gray-300 text-sm mb-2'>Período del reporte:</Text>
        <View className='flex-row mb-6'>
          {[
            { key: 'weekly', label: 'Semanal' },
            { key: 'monthly', label: 'Mensual' },
            { key: 'quarterly', label: 'Trimestral' }
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => setReportPeriod(period.key as any)}
              className={`mr-3 px-4 py-2 rounded-lg ${
                reportPeriod === period.key ? 'bg-purple-600' : 'bg-gray-700'
              }`}>
              <Text className='text-white text-sm font-medium'>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className='flex-row space-x-3'>
          <TouchableOpacity
            onPress={handleGenerateReport}
            disabled={isExporting}
            className={`flex-1 py-3 rounded-xl items-center ${
              isExporting ? 'bg-gray-600' : 'bg-purple-600'
            }`}>
            <Text className='text-white font-medium'>
              {isExporting ? 'Generando...' : 'Generar Reporte'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={createAutoReport}
            className='flex-1 bg-orange-600 py-3 rounded-xl items-center'>
            <Text className='text-white font-medium'>Programar Automático</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reportes Automáticos Configurados */}
      {autoReports.reports.length > 0 && (
        <View className='bg-gray-800 rounded-2xl p-4 mb-6'>
          <Text className='text-white text-lg font-semibold mb-4'>
            Reportes Automáticos
          </Text>

          {autoReports.reports.map((report) => (
            <View key={report.id} className='bg-gray-700 rounded-xl p-3 mb-3'>
              <View className='flex-row justify-between items-start'>
                <View className='flex-1'>
                  <Text className='text-white font-medium'>{report.name}</Text>
                  <Text className='text-gray-400 text-sm'>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}{' '}
                    - {report.schedule.time}
                  </Text>
                  <Text className='text-gray-400 text-xs'>
                    Destinatarios: {report.recipients.length}
                  </Text>
                </View>

                <View className='flex-row space-x-2'>
                  <TouchableOpacity
                    onPress={() => autoReports.toggleReport(report.id)}
                    className={`px-3 py-1 rounded-lg ${
                      report.isActive ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                    <Text className='text-white text-xs'>
                      {report.isActive ? 'Activo' : 'Pausado'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Eliminar Reporte',
                        `¿Eliminar "${report.name}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Eliminar',
                            style: 'destructive',
                            onPress: () => autoReports.deleteReport(report.id)
                          }
                        ]
                      )
                    }}
                    className='bg-red-600 px-3 py-1 rounded-lg'>
                    <Text className='text-white text-xs'>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Integraciones */}
      <View className='bg-gray-800 rounded-2xl p-4'>
        <Text className='text-white text-lg font-semibold mb-4'>
          Integraciones
        </Text>

        <TouchableOpacity className='bg-green-600 py-3 rounded-xl items-center mb-3'>
          <Text className='text-white font-medium'>
            📊 Conectar Google Sheets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className='bg-blue-600 py-3 rounded-xl items-center mb-3'>
          <Text className='text-white font-medium'>📧 Configurar Email</Text>
        </TouchableOpacity>

        <TouchableOpacity className='bg-purple-600 py-3 rounded-xl items-center'>
          <Text className='text-white font-medium'>🔗 API Access Tokens</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default DataExportScreen
