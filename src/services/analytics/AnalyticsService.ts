import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'

export class AnalyticsService {
  /**
   * Track custom events
   */
  static async trackEvent(eventName: string, parameters?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, parameters)
    } catch (error) {
      console.warn('Analytics tracking failed:', error)
    }
  }

  /**
   * Track screen views
   */
  static async trackScreen(screenName: string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName
      })
    } catch (error) {
      console.warn('Screen tracking failed:', error)
    }
  }

  /**
   * Track user actions
   */
  static async trackUserAction(
    action: string,
    category: string,
    value?: number
  ) {
    try {
      await this.trackEvent('user_action', {
        action,
        category,
        value,
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('User action tracking failed:', error)
    }
  }

  /**
   * Track expense-related events
   */
  static async trackExpense(
    action: 'add' | 'edit' | 'delete',
    amount: number,
    category: string
  ) {
    try {
      await this.trackEvent('expense_action', {
        action,
        amount,
        category,
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('Expense tracking failed:', error)
    }
  }

  /**
   * Track advanced features usage
   */
  static async trackAdvancedFeature(
    feature: string,
    details?: Record<string, any>
  ) {
    try {
      await this.trackEvent('advanced_feature_used', {
        feature,
        ...details,
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('Advanced feature tracking failed:', error)
    }
  }

  /**
   * Set user properties
   */
  static async setUserProperty(name: string, value: string) {
    try {
      await analytics().setUserProperty(name, value)
    } catch (error) {
      console.warn('User property setting failed:', error)
    }
  }

  /**
   * Track app performance
   */
  static async trackPerformance(
    metric: string,
    value: number,
    unit: string = 'ms'
  ) {
    try {
      await this.trackEvent('performance_metric', {
        metric,
        value,
        unit,
        timestamp: Date.now()
      })
    } catch (error) {
      console.warn('Performance tracking failed:', error)
    }
  }
}

export class CrashReportingService {
  /**
   * Initialize crash reporting
   */
  static initialize() {
    try {
      crashlytics().setCrashlyticsCollectionEnabled(true)
    } catch (error) {
      console.warn('Crashlytics initialization failed:', error)
    }
  }

  /**
   * Log non-fatal errors
   */
  static recordError(error: Error, context?: Record<string, any>) {
    try {
      if (context) {
        Object.keys(context).forEach((key) => {
          crashlytics().setAttribute(key, String(context[key]))
        })
      }
      crashlytics().recordError(error)
    } catch (e) {
      console.warn('Error recording failed:', e)
    }
  }

  /**
   * Log custom messages
   */
  static log(message: string) {
    try {
      crashlytics().log(message)
    } catch (error) {
      console.warn('Crash logging failed:', error)
    }
  }

  /**
   * Set user identifier
   */
  static setUserId(userId: string) {
    try {
      crashlytics().setUserId(userId)
    } catch (error) {
      console.warn('User ID setting failed:', error)
    }
  }

  /**
   * Set custom attributes
   */
  static setAttribute(key: string, value: string) {
    try {
      crashlytics().setAttribute(key, value)
    } catch (error) {
      console.warn('Attribute setting failed:', error)
    }
  }

  /**
   * Force crash (for testing only)
   */
  static forceCrash() {
    if (__DEV__) {
      crashlytics().crash()
    }
  }
}

// Performance monitoring
export class PerformanceService {
  private static traces: Map<string, any> = new Map()

  /**
   * Start performance trace
   */
  static async startTrace(traceName: string) {
    try {
      const trace = analytics().startTrace(traceName)
      this.traces.set(traceName, trace)
      return trace
    } catch (error) {
      console.warn('Performance trace start failed:', error)
    }
  }

  /**
   * Stop performance trace
   */
  static async stopTrace(traceName: string, metrics?: Record<string, number>) {
    try {
      const trace = this.traces.get(traceName)
      if (trace) {
        if (metrics) {
          Object.keys(metrics).forEach((key) => {
            trace.putMetric(key, metrics[key])
          })
        }
        await trace.stop()
        this.traces.delete(traceName)
      }
    } catch (error) {
      console.warn('Performance trace stop failed:', error)
    }
  }

  /**
   * Track loading times
   */
  static async trackLoadTime(screen: string, startTime: number) {
    const loadTime = Date.now() - startTime
    await AnalyticsService.trackPerformance(`${screen}_load_time`, loadTime)
  }
}

// Error boundary for React components
export class ErrorBoundaryService {
  static logError(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    CrashReportingService.recordError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })
  }
}
