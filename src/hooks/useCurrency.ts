import { useSettingsStore } from '../store/settingsStore'

/**
 * Hook para formatear cantidades de dinero según la configuración del usuario
 */
export const useCurrency = () => {
  const currency = useSettingsStore((state) => state.currency)
  const language = useSettingsStore((state) => state.language)

  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch {
      // Fallback si hay problemas con la configuración de idioma/moneda
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  const formatAmount = (amount: number): string => {
    try {
      return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch {
      return amount.toFixed(2)
    }
  }

  const getCurrencySymbol = (): string => {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'Fr',
      CNY: '¥',
      SEK: 'kr',
      NOK: 'kr',
      MXN: '$',
      INR: '₹',
      BRL: 'R$',
      ZAR: 'R'
    }
    return symbols[currency] || currency
  }

  return {
    currency,
    formatCurrency,
    formatAmount,
    getCurrencySymbol
  }
}
