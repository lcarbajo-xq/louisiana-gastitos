import AsyncStorage from '@react-native-async-storage/async-storage'
import CryptoJS from 'crypto-js'
import DeviceInfo from 'react-native-device-info'
import * as Keychain from 'react-native-keychain'

// Configuración de seguridad
const ENCRYPTION_KEY = 'banking_data_encryption_key'

export class SecureStorageService {
  private static instance: SecureStorageService
  private deviceId: string | null = null

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService()
    }
    return SecureStorageService.instance
  }

  async initialize(): Promise<void> {
    try {
      this.deviceId = await DeviceInfo.getUniqueId()
    } catch (error) {
      console.warn('Failed to get device ID:', error)
      this.deviceId = 'fallback-device-id'
    }
  }

  // Gestión de tokens bancarios seguros
  async setBankToken(bankId: string, token: string): Promise<void> {
    try {
      const encryptedToken = this.encryptData(token)
      await Keychain.setInternetCredentials(
        `bank_token_${bankId}`,
        bankId,
        JSON.stringify({
          token: encryptedToken,
          timestamp: Date.now(),
          deviceId: this.deviceId
        })
      )
    } catch (error) {
      console.error('Error storing bank token:', error)
      throw new Error('Failed to store bank token securely')
    }
  }

  async getBankToken(bankId: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(
        `bank_token_${bankId}`
      )
      if (!credentials) return null

      const parsedData = JSON.parse(credentials.password)

      // Verificar que el token fue creado en este dispositivo
      if (parsedData.deviceId !== this.deviceId) {
        console.warn('Token was created on different device, clearing...')
        await this.clearBankToken(bankId)
        return null
      }

      // Verificar que el token no sea muy antiguo (30 días)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000
      if (Date.now() - parsedData.timestamp > thirtyDays) {
        console.warn('Token expired, clearing...')
        await this.clearBankToken(bankId)
        return null
      }

      return this.decryptData(parsedData.token)
    } catch (error) {
      console.error('Error retrieving bank token:', error)
      return null
    }
  }

  async clearBankToken(bankId: string): Promise<void> {
    try {
      await Keychain.resetInternetCredentials({
        server: `bank_token_${bankId}`
      })
    } catch (error) {
      console.error('Error clearing bank token:', error)
    }
  }

  async clearAllBankTokens(): Promise<void> {
    try {
      // Para simplicidad, mantenemos una lista de bank IDs en AsyncStorage
      const bankIds =
        (await this.getEncryptedBankingData<string[]>('bank_ids')) || []

      await Promise.all([
        ...bankIds.map((bankId: string) =>
          Keychain.resetInternetCredentials({ server: `bank_token_${bankId}` })
        ),
        this.clearEncryptedBankingData('bank_ids')
      ])
    } catch (error) {
      console.error('Error clearing all bank tokens:', error)
    }
  }

  // Helper para mantener lista de bank IDs
  async addBankId(bankId: string): Promise<void> {
    const bankIds =
      (await this.getEncryptedBankingData<string[]>('bank_ids')) || []
    if (!bankIds.includes(bankId)) {
      bankIds.push(bankId)
      await this.setEncryptedBankingData('bank_ids', bankIds)
    }
  }

  async removeBankId(bankId: string): Promise<void> {
    const bankIds =
      (await this.getEncryptedBankingData<string[]>('bank_ids')) || []
    const filteredIds = bankIds.filter((id: string) => id !== bankId)
    await this.setEncryptedBankingData('bank_ids', filteredIds)
  }

  // Gestión de datos bancarios encriptados
  async setEncryptedBankingData(key: string, data: any): Promise<void> {
    try {
      const encryptedData = this.encryptData(JSON.stringify(data))
      await AsyncStorage.setItem(`banking_${key}`, encryptedData)
    } catch (error) {
      console.error('Error storing encrypted banking data:', error)
      throw new Error('Failed to store banking data')
    }
  }

  async getEncryptedBankingData<T>(key: string): Promise<T | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(`banking_${key}`)
      if (!encryptedData) return null

      const decryptedData = this.decryptData(encryptedData)
      return JSON.parse(decryptedData)
    } catch (error) {
      console.error('Error retrieving encrypted banking data:', error)
      return null
    }
  }

  async clearEncryptedBankingData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`banking_${key}`)
    } catch (error) {
      console.error('Error clearing encrypted banking data:', error)
    }
  }

  // Gestión de configuración de seguridad
  async setSecurityConfig(config: any): Promise<void> {
    await this.setEncryptedBankingData('security_config', config)
  }

  async getSecurityConfig(): Promise<any> {
    return await this.getEncryptedBankingData('security_config')
  }

  // Validar integridad de datos
  async validateDataIntegrity(): Promise<boolean> {
    try {
      // Verificar que podemos acceder a los datos críticos
      const securityConfig = await this.getSecurityConfig()
      if (!securityConfig) return false

      // Verificar que el dispositivo no ha cambiado
      const currentDeviceId = await DeviceInfo.getUniqueId()
      if (currentDeviceId !== this.deviceId) {
        console.warn('Device ID changed, clearing sensitive data...')
        await this.clearAllSensitiveData()
        return false
      }

      return true
    } catch (error) {
      console.error('Data integrity validation failed:', error)
      return false
    }
  }

  // Limpiar todos los datos sensibles
  async clearAllSensitiveData(): Promise<void> {
    try {
      await Promise.all([
        this.clearAllBankTokens(),
        this.clearEncryptedBankingData('accounts'),
        this.clearEncryptedBankingData('transactions'),
        this.clearEncryptedBankingData('connections'),
        this.clearEncryptedBankingData('security_config')
      ])
    } catch (error) {
      console.error('Error clearing sensitive data:', error)
    }
  }

  // Funciones de encriptación privadas
  private encryptData(data: string): string {
    const key = this.getEncryptionKey()
    return CryptoJS.AES.encrypt(data, key).toString()
  }

  private decryptData(encryptedData: string): string {
    const key = this.getEncryptionKey()
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  private getEncryptionKey(): string {
    // Combinar clave base con device ID para mayor seguridad
    return `${ENCRYPTION_KEY}_${this.deviceId || 'fallback'}`
  }

  // Verificación biométrica
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType()
      return biometryType !== null
    } catch (error) {
      console.error('Error checking biometric availability:', error)
      return false
    }
  }

  async getBiometryType(): Promise<string | null> {
    try {
      return await Keychain.getSupportedBiometryType()
    } catch (error) {
      console.error('Error getting biometry type:', error)
      return null
    }
  }

  // Gestión de actividad del usuario (para auto-logout)
  async updateLastActivity(): Promise<void> {
    try {
      await AsyncStorage.setItem('last_activity', Date.now().toString())
    } catch (error) {
      console.error('Error updating last activity:', error)
    }
  }

  async getLastActivity(): Promise<number> {
    try {
      const lastActivity = await AsyncStorage.getItem('last_activity')
      return lastActivity ? parseInt(lastActivity, 10) : Date.now()
    } catch (error) {
      console.error('Error getting last activity:', error)
      return Date.now()
    }
  }

  async shouldAutoLogout(timeoutMinutes: number): Promise<boolean> {
    const lastActivity = await this.getLastActivity()
    const timeoutMs = timeoutMinutes * 60 * 1000
    return Date.now() - lastActivity > timeoutMs
  }
}
