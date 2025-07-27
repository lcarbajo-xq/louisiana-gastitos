# Guía de Prompts para Expense Tracker App

_Aplicación de seguimiento de gastos con React Native_

## 1. Definición del Proyecto y Arquitectura

### Prompt Inicial

```
Necesito crear una aplicación de seguimiento de gastos en React Native. La app debe tener:

FUNCIONALIDADES CORE:
- Seguimiento manual de gastos por categorías
- Dashboard con gráficos circulares y estadísticas
- Sistema de categorización (Food, Shopping, Transport, Health & Fitness, Education, Other)
- Vista de gastos recientes
- Entrada de nuevos gastos con descripción
- Integración futura con APIs bancarias

ARQUITECTURA TÉCNICA:
- React Native con TypeScript
- Zustand para manejo de estado
- React Navigation 6 para navegación
- Async Storage para persistencia local
- Victory Charts para gráficos
- NativeWind para estilos (Tailwind CSS)

ESTRUCTURA DE CARPETAS:
```

src/
├── components/
├── screens/
├── navigation/
├── store/
├── services/
├── utils/
├── types/
└── assets/

```

Genera la estructura inicial del proyecto con configuración de TypeScript, dependencias principales y setup básico.
```

## 2. Guía de Estilo y Design System

### Prompt para Design System

````
Basándome en el diseño adjunto, necesito crear un design system completo para mi expense tracker app usando NativeWind:

CONFIGURACIÓN DE NATIVEWIND:
- Setup completo de NativeWind v4 con React Native
- Configuración de tailwind.config.js personalizado
- PostCSS y Metro configuration para soporte completo

PALETA DE COLORES PERSONALIZADA:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Colores principales del diseño
        primary: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          pink: '#EC4899',
          green: '#10B981',
        },
        // Categorías de gastos
        categories: {
          food: '#F59E0B',      // Amarillo
          shopping: '#EC4899',   // Rosa
          transport: '#8B5CF6',  // Morado
          health: '#6366F1',     // Púrpura
          education: '#3B82F6',  // Azul
          other: '#6B7280',      // Gris
        },
        // Gradientes como CSS custom properties
        gradients: {
          'primary-start': '#8B5CF6',
          'primary-end': '#3B82F6',
          'card-start': '#1F2937',
          'card-end': '#111827',
        }
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        'gradient-card': 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'button': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    }
  }
}
````

COMPONENTES BASE CON NATIVEWIND:

```tsx
// Botón con gradiente
const GradientButton = ({ children, onPress, className = '' }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`bg-gradient-to-r from-primary-purple to-primary-blue rounded-2xl px-6 py-4 shadow-button ${className}`}>
    <Text className='text-white font-sf-pro text-body-lg font-semibold text-center'>
      {children}
    </Text>
  </TouchableOpacity>
)

// Card con sombra
const ExpenseCard = ({ children, className = '' }) => (
  <View className={`bg-gray-800 rounded-2xl p-4 shadow-card ${className}`}>
    {children}
  </View>
)

// Input field moderno
const ModernInput = ({ placeholder, value, onChangeText, className = '' }) => (
  <TextInput
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    className={`bg-gray-700 rounded-xl px-4 py-3 text-white font-sf-pro text-body-lg placeholder:text-gray-400 ${className}`}
    placeholderTextColor='#9CA3AF'
  />
)
```

SISTEMA DE ICONOS Y CATEGORÍAS:

- Usar Lucide React Native para iconos consistentes
- Mapeo de categorías con colores de Tailwind
- Componentes de iconos con variantes de tamaño

MODO OSCURO NATIVO:

- Configurar dark mode con NativeWind
- Variables CSS para transiciones suaves
- Detección automática del tema del sistema

```

## 3. Modelado de Datos y Store

### Prompt para Zustand Store
```

Necesito configurar Zustand para mi expense tracker con los siguientes modelos de datos:

MODELOS:

```typescript
interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: Date
  paymentMethod?: 'card' | 'cash' | 'transfer'
  receipt?: string // URL de imagen
  location?: string
  tags?: string[]
}

interface ExpenseCategory {
  id: string
  name: string
  icon: string
  color: string
  budget?: number
}

interface MonthlyStats {
  totalExpenses: number
  categoryBreakdown: CategoryBreakdown[]
  comparedToLastMonth: number
  budgetStatus: BudgetStatus
}
```

STORES NECESARIOS:

```typescript
// useExpenseStore
interface ExpenseStore {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  getExpensesByCategory: (categoryId: string) => Expense[]
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[]
}

// useCategoryStore
interface CategoryStore {
  categories: ExpenseCategory[]
  addCategory: (category: Omit<ExpenseCategory, 'id'>) => void
  updateCategory: (id: string, category: Partial<ExpenseCategory>) => void
  deleteCategory: (id: string) => void
  getDefaultCategories: () => ExpenseCategory[]
}

// useStatsStore
interface StatsStore {
  monthlyStats: MonthlyStats
  calculateMonthlyStats: () => void
  getTotalExpenses: (period: 'week' | 'month' | 'year') => number
  getCategoryBreakdown: (period: string) => CategoryBreakdown[]
  getBudgetStatus: (categoryId: string) => BudgetStatus
}

// useSettingsStore
interface SettingsStore {
  currency: string
  theme: 'light' | 'dark'
  notifications: boolean
  budgetAlerts: boolean
  setCurrency: (currency: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleNotifications: () => void
}
```

PERSISTENCIA:

- Usar zustand/middleware/persist para persistencia automática
- Configurar AsyncStorage como storage engine
- Implementar migrations para cambios de schema
- Separate stores para mejor performance y organización

MIDDLEWARE PERSONALIZADO:

- Logger middleware para debugging
- Immer middleware para inmutabilidad
- DevTools integration para desarrollo

```

## 4. Componentes de UI Principal

### Prompt para Dashboard Principal
```

Crear el componente Dashboard principal siguiendo exactamente el diseño mostrado usando NativeWind:

ELEMENTOS DEL DASHBOARD:

1. Header con título "Expenses" y selector de mes
2. Gráfico circular (donut chart) mostrando:
   - Total de gastos en el centro ($671.89)
   - Segmentos por categoría con colores específicos
   - Leyenda con iconos y nombres de categorías
3. Sección "Recent Expenses" con lista de transacciones recientes
4. Bottom navigation con iconos

IMPLEMENTACIÓN CON NATIVEWIND:

```tsx
const Dashboard = () => (
  <SafeAreaView className='flex-1 bg-black'>
    {/* Header */}
    <View className='flex-row justify-between items-center px-6 py-4'>
      <Text className='text-white font-sf-pro text-display-md font-semibold'>
        Expenses
      </Text>
      <TouchableOpacity className='bg-white rounded-xl px-4 py-2'>
        <Text className='text-black font-sf-pro text-body-lg font-medium'>
          June
        </Text>
      </TouchableOpacity>
    </View>

    {/* Gráfico Circular */}
    <View className='items-center py-8'>
      <View className='relative'>
        {/* Victory Chart aquí */}
        <View className='absolute inset-0 justify-center items-center'>
          <Text className='text-white font-sf-pro text-caption opacity-60'>
            Total expenses
          </Text>
          <Text className='text-white font-sf-pro text-display-lg font-bold'>
            $ 671.89
          </Text>
        </View>
      </View>
    </View>

    {/* Leyenda de categorías */}
    <View className='flex-row flex-wrap justify-center px-6 mb-6'>
      <CategoryLegend icon='🍕' label='Food' color='bg-categories-food' />
      <CategoryLegend
        icon='💪'
        label='Health & Fitness'
        color='bg-categories-health'
      />
      {/* Más categorías... */}
    </View>

    {/* Lista de gastos recientes */}
    <View className='flex-1 px-6'>
      <View className='flex-row justify-between items-center mb-4'>
        <Text className='text-white font-sf-pro text-body-lg font-semibold'>
          Recent Expenses
        </Text>
        <TouchableOpacity>
          <Text className='text-primary-blue font-sf-pro text-body-lg'>
            View all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1'>
        <ExpenseItem
          category='Food'
          description='Cheese, wine and food for cat'
          amount='-$44.80'
          iconBg='bg-categories-food'
        />
        {/* Más items... */}
      </ScrollView>
    </View>
  </SafeAreaView>
)
```

CARACTERÍSTICAS TÉCNICAS:

- Usar Victory Charts para el gráfico circular
- Animaciones suaves con react-native-reanimated
- Responsive design con clases de Tailwind
- Colores exactos definidos en tailwind.config.js
- Componentes modulares y reutilizables

```

### Prompt para Pantalla de Onboarding
```

Crear la pantalla de onboarding/welcome basada en la primera pantalla del diseño usando NativeWind:

ELEMENTOS CON NATIVEWIND:

```tsx
const OnboardingScreen = () => (
  <SafeAreaView className='flex-1 bg-black justify-center items-center px-6'>
    {/* Logo con gradientes */}
    <View className='mb-12'>
      <View className='flex-row space-x-2'>
        <View className='w-16 h-16 bg-gradient-to-br from-primary-purple to-primary-pink rounded-2xl items-center justify-center'>
          <Text className='text-white font-sf-pro text-display-md font-bold'>
            N
          </Text>
        </View>
        <View className='w-16 h-16 bg-gradient-to-br from-primary-blue to-primary-green rounded-2xl items-center justify-center'>
          <Text className='text-white font-sf-pro text-display-md font-bold'>
            F
          </Text>
        </View>
        <View className='w-16 h-16 bg-gradient-to-br from-primary-pink to-primary-purple rounded-2xl items-center justify-center'>
          <Text className='text-white font-sf-pro text-display-md font-bold'>
            A
          </Text>
        </View>
      </View>
    </View>

    {/* Título principal */}
    <Text className='text-white font-sf-pro text-display-lg font-bold text-center mb-4 leading-tight'>
      Control over{'\n'}your finances{'\n'}is in your hands
    </Text>

    {/* Subtítulo */}
    <Text className='text-gray-400 font-sf-pro text-body-lg text-center mb-12 px-4'>
      Your path to conscious spending{'\n'}and control starts here
    </Text>

    {/* Botón Get Started */}
    <TouchableOpacity
      className='bg-white rounded-2xl px-8 py-4 flex-row items-center space-x-3 shadow-button'
      onPress={() => navigation.navigate('Dashboard')}>
      <Text className='text-black font-sf-pro text-body-lg font-semibold'>
        Get started
      </Text>
      <View className='w-6 h-6 bg-black rounded-full items-center justify-center'>
        <ChevronRightIcon size={16} color='white' />
      </View>
    </TouchableOpacity>

    {/* Efectos de fondo */}
    <View className='absolute -top-20 -right-20 w-40 h-40 bg-primary-purple/20 rounded-full blur-3xl' />
    <View className='absolute -bottom-20 -left-20 w-32 h-32 bg-primary-blue/20 rounded-full blur-2xl' />
  </SafeAreaView>
)
```

FUNCIONALIDADES:

- Animaciones de entrada para cada elemento usando react-native-reanimated
- Transición suave al dashboard
- Verificar si es primera vez del usuario
- Configuración inicial de categorías por defecto

ANIMACIONES CON NATIVEWIND + REANIMATED:

- Fade in secuencial para elementos
- Scale animation para el logo
- Slide up para el botón
- Gradient background animations

```

## 5. Funcionalidades Core

### Prompt para Formulario de Gastos
```

Crear el formulario para agregar nuevos gastos siguiendo el diseño de la tercera pantalla usando NativeWind:

IMPLEMENTACIÓN CON NATIVEWIND:

```tsx
const AddExpenseScreen = () => (
  <SafeAreaView className='flex-1 bg-black'>
    {/* Header */}
    <View className='flex-row justify-between items-center px-6 py-4'>
      <TouchableOpacity>
        <XIcon size={24} color='white' />
      </TouchableOpacity>
      <TouchableOpacity>
        <CheckIcon size={24} color='white' />
      </TouchableOpacity>
    </View>

    {/* Monto principal */}
    <View className='items-center py-12'>
      <TextInput
        className='text-white font-sf-pro text-6xl font-bold bg-transparent text-center'
        placeholder='$0.00'
        placeholderTextColor='#374151'
        keyboardType='numeric'
        value={amount}
        onChangeText={setAmount}
      />
    </View>

    {/* Selector de categoría */}
    <View className='px-6 mb-8'>
      <TouchableOpacity className='bg-primary-purple/20 border border-primary-purple rounded-2xl p-4 flex-row items-center'>
        <View className='w-10 h-10 bg-primary-purple rounded-xl items-center justify-center mr-3'>
          <StarIcon size={20} color='white' />
        </View>
        <Text className='text-white font-sf-pro text-body-lg font-medium flex-1'>
          Health & Fitness
        </Text>
        <ChevronRightIcon size={20} color='#8B5CF6' />
      </TouchableOpacity>
    </View>

    {/* Campo de fecha */}
    <View className='px-6 mb-8'>
      <TouchableOpacity className='bg-gray-800 rounded-2xl p-4 flex-row items-center justify-between'>
        <Text className='text-white font-sf-pro text-body-lg'>Today</Text>
        <CalendarIcon size={20} color='#6B7280' />
      </TouchableOpacity>
    </View>

    {/* Campo de descripción */}
    <View className='px-6 mb-8 flex-1'>
      <TextInput
        className='bg-gray-800 rounded-2xl p-4 text-white font-sf-pro text-body-lg h-32'
        placeholder='Write more, describe the details'
        placeholderTextColor='#6B7280'
        multiline
        textAlignVertical='top'
        value={description}
        onChangeText={setDescription}
      />
    </View>

    {/* Botones de acción */}
    <View className='flex-row px-6 pb-8 space-x-4'>
      <TouchableOpacity className='w-12 h-12 bg-gray-800 rounded-xl items-center justify-center'>
        <PaperclipIcon size={20} color='white' />
      </TouchableOpacity>

      <TouchableOpacity className='flex-1 bg-white rounded-2xl py-4 items-center'>
        <CheckIcon size={24} color='black' />
      </TouchableOpacity>

      <TouchableOpacity className='w-12 h-12 bg-gray-800 rounded-xl items-center justify-center'>
        <XIcon size={20} color='white' />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
)
```

CARACTERÍSTICAS:

- Validación en tiempo real con clases condicionales de Tailwind
- Sugerencias de categorías basadas en descripción
- Opción de agregar fotos de recibos
- Autocompletado de lugares frecuentes
- Cálculo automático de presupuesto restante con indicadores visuales

```

INTEGRACIÓN:
- Conectar con Zustand stores
- Persistencia local inmediata usando zustand/persist
- Feedback visual de confirmación
```

### Prompt para Sistema de Categorías

```
Implementar el sistema de categorías con las siguientes funcionalidades:

CATEGORÍAS PREDEFINIDAS:
- Food (amarillo, icono: utensilio)
- Shopping (rosa, icono: bolsa)
- Transport (verde, icono: coche)
- Health & Fitness (morado, icono: estrella)
- Education (azul, icono: libro)
- Other (gris, icono: tres puntos)

FUNCIONALIDADES:
- CRUD completo de categorías personalizadas
- Asignación de presupuestos por categoría
- Estadísticas por categoría
- Filtros avanzados
- Búsqueda inteligente por categoría
- Sugerencias automáticas basadas en texto

Incluir algoritmo de machine learning simple para categorización automática de gastos.
```

## 6. Gráficos y Estadísticas

### Prompt para Componentes de Gráficos

```
Crear componentes de visualización de datos usando Victory Charts:

GRÁFICOS NECESARIOS:
1. Donut Chart principal (como en el diseño)
   - Animaciones de entrada
   - Tooltips interactivos
   - Colores consistentes con categorías

2. Gráfico de líneas para tendencias mensuales
3. Gráfico de barras para comparación de categorías
4. Progress bars para presupuestos

CARACTERÍSTICAS:
- Responsive en diferentes tamaños de pantalla
- Tema oscuro/claro
- Animaciones fluidas
- Accesibilidad completa
- Exportación de datos

Crear un hook personalizado (useExpenseStats) para cálculos y formateo de datos que se integre con los stores de Zustand.
```

## 7. Integración Bancaria (Fase 2)

### Prompt para APIs Bancarias

````
Preparar la infraestructura para integración con APIs bancarias usando Zustand:

INTEGRACIONES OBJETIVO:
- Open Banking APIs (PSD2)
- Plaid para conexiones bancarias
- Webhooks para transacciones en tiempo real

ARQUITECTURA CON ZUSTAND:
```typescript
// useBankingStore
interface BankingStore {
  accounts: BankAccount[];
  transactions: BankTransaction[];
  isConnecting: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  connectAccount: (credentials: BankCredentials) => Promise<void>;
  syncTransactions: () => Promise<void>;
  reconcileTransaction: (bankTx: BankTransaction, expense: Expense) => void;
  disconnectAccount: (accountId: string) => void;
}

// useAuthStore para manejo de autenticación bancaria
interface AuthStore {
  bankTokens: Record<string, string>;
  biometricEnabled: boolean;
  setBankToken: (bankId: string, token: string) => void;
  clearBankTokens: () => void;
  enableBiometric: () => Promise<boolean>;
}
````

SINCRONIZACIÓN:

- Store separado para manejo de sync en background
- Queue system para transacciones offline
- Conflict resolution automático
- Detección de duplicados inteligente

SEGURIDAD:

- Encriptación de tokens en AsyncStorage
- Biometric authentication con react-native-biometrics
- Auto-logout por inactividad
- Secure storage para credenciales sensibles

Crear custom hooks para manejar la lógica de sincronización y auth de forma reactiva.

```

## 8. Features Avanzadas

### Prompt para Funcionalidades Premium
```

Implementar funcionalidades avanzadas:

CARACTERÍSTICAS:

- Presupuestos inteligentes con alertas
- Predicciones de gastos usando ML
- Reportes automáticos por email/PDF
- Sincronización multi-dispositivo
- Compartir gastos con familia/pareja
- Metas de ahorro con tracking visual

ANÁLISIS AVANZADO:

- Patrones de gasto por ubicación/hora
- Comparación con promedios demográficos
- Alertas de gastos inusuales
- Recomendaciones de optimización

EXPORTACIÓN:

- CSV/Excel export
- Integración con Google Sheets
- API pública para terceros

```

## 9. Testing y Deployment

### Prompt para Testing
```

Configurar suite completa de testing:

TESTING STACK:

- Jest para unit tests
- React Native Testing Library
- Detox para E2E testing
- Storybook para componentes UI

COBERTURA:

- Tests unitarios para Zustand stores y actions
- Tests de integración para componentes
- Tests E2E para flujos críticos
- Performance testing con Flashlight

CI/CD:

- GitHub Actions para automatización
- CodePush para actualizaciones OTA
- Crashlytics para monitoreo
- Analytics con Amplitude/Mixpanel

```

## 10. Optimización y Performance

### Prompt para Performance
```

Optimizar la aplicación para máximo performance:

OPTIMIZACIONES:

- Lazy loading de pantallas
- Memoización de componentes pesados
- Virtualización de listas largas
- Compresión de imágenes automática
- Bundle splitting para reducir tamaño inicial

MONITORING:

- Performance metrics con Flipper
- Memory leak detection
- Battery usage optimization
- Network request optimization

ACCESIBILIDAD:

- Screen reader support completo
- High contrast mode
- Voice navigation
- Keyboard navigation para usuarios con discapacidades

```

---

## Orden Recomendado de Implementación:

1. **Setup inicial** (Prompt 1)
2. **Design System** (Prompt 2)
3. **Store y modelos** (Prompt 3)
4. **Onboarding** (Prompt 4)
5. **Dashboard principal** (Prompt 4)
6. **Formulario de gastos** (Prompt 5)
7. **Sistema de categorías** (Prompt 5)
8. **Gráficos** (Prompt 6)
9. **Features avanzadas** (Prompt 8)
10. **Integración bancaria** (Prompt 7)
11. **Testing** (Prompt 9)
12. **Performance** (Prompt 10)

Cada prompt puede usarse independientemente con GitHub Copilot para generar código específico y obtener sugerencias contextuales.
```
