# Stores de Gestión de Estado

Este directorio contiene todos los stores de Zustand para la aplicación de seguimiento de gastos.

## Stores Disponibles

### 📁 `categoryStore.ts`

Gestiona las categorías de gastos con funcionalidades CRUD y presupuestos.

**Funciones principales:**

- `addCategory(category)` - Agregar nueva categoría
- `updateCategory(id, updates)` - Actualizar categoría existente
- `deleteCategory(id)` - Eliminar categoría
- `updateBudget(id, budget)` - Actualizar presupuesto de categoría

**Categorías por defecto:**

- 🍔 Comida (€500)
- 🛍️ Compras (€300)
- 🚗 Transporte (€200)
- 🏥 Salud y Fitness (€150)
- 📚 Educación (€100)
- 📦 Otros (€200)

### 💰 `expenseStore.ts`

Gestiona los gastos individuales con funcionalidades de filtrado y cálculos.

**Funciones principales:**

- `addExpense(expense)` - Agregar nuevo gasto
- `updateExpense(id, updates)` - Actualizar gasto existente
- `deleteExpense(id)` - Eliminar gasto
- `getExpensesByCategory(categoryId)` - Filtrar por categoría
- `getExpensesByDateRange(start, end)` - Filtrar por rango de fechas
- `getTotalExpenses()` - Calcular total de gastos

### 📊 `statsStore.ts`

Genera estadísticas y análisis de gastos en tiempo real.

**Funciones principales:**

- `calculateMonthlyStats()` - Calcular estadísticas mensuales
- `getTotalExpenses(period)` - Total por período (semana/mes/año)
- `getCategoryBreakdown(period)` - Desglose por categorías
- `getBudgetStatus(categoryId)` - Estado del presupuesto por categoría
- `getAllBudgetStatuses()` - Estado de todos los presupuestos

### ⚙️ `settingsStore.ts`

Configuraciones de la aplicación del usuario.

**Configuraciones disponibles:**

- `currency` - Moneda (EUR por defecto)
- `theme` - Tema (system/light/dark)
- `notificationsEnabled` - Notificaciones activadas
- `budgetAlertsEnabled` - Alertas de presupuesto
- `budgetAlertThreshold` - Umbral de alerta (80% por defecto)
- `language` - Idioma (es por defecto)

## Persistencia

Todos los stores utilizan AsyncStorage para persistir datos localmente:

- **categories-storage** - Categorías y presupuestos
- **expenses-storage** - Gastos del usuario
- **stats-storage** - Estadísticas calculadas
- **settings-storage** - Configuraciones de usuario

## Uso

```typescript
import {
  useCategoryStore,
  useExpenseStore,
  useStatsStore,
  useSettingsStore
} from './src/store'

// En un componente
const { addExpense } = useExpenseStore()
const { currency, formatCurrency } = useSettingsStore()
const { monthlyStats } = useStatsStore()
```

## Hooks Auxiliares

### `useSyncStores()`

Sincroniza automáticamente las estadísticas cuando cambian los gastos.

### `useRealtimeStats()`

Proporciona estadísticas actualizadas en tiempo real.

### `useCurrency()`

Formatea cantidades de dinero según la configuración del usuario.

```typescript
import { useCurrency, useSyncStores } from './src/hooks'

const { formatCurrency, getCurrencySymbol } = useCurrency()
// Usar en el componente principal para sincronización automática
useSyncStores()
```
