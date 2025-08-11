import AsyncStorage from '@react-native-async-storage/async-storage'

export class StorageService {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
      console.error('Error saving data:', error)
      throw error
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
      console.error('Error reading data:', error)
      return null
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing data:', error)
      throw error
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error('Error clearing data:', error)
      throw error
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return [...keys] // Convert readonly array to mutable array
    } catch (error) {
      console.error('Error getting keys:', error)
      return []
    }
  }
}
