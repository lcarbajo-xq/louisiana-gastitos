# Louisiana Gastitos - Guía de Desarrollo

## Descripción del Proyecto

Louisiana Gastitos es una aplicación móvil React Native desarrollada con Expo para el control y gestión de gastos personales. La aplicación está enfocada en brindar una experiencia intuitiva para el registro, categorización y análisis de gastos cotidianos.

## Arquitectura del Proyecto

### Stack Tecnológico

- **React Native + Expo**: Framework principal
- **TypeScript**: Tipado estático y mejor DX
- **Expo Router**: Navegación basada en archivos
- **React Native Reanimated**: Animaciones fluidas
- **Sistema de Temas**: Soporte claro/oscuro

### Estructura de Directorios

```
app/                    # Pantallas principales (Expo Router)
├── (tabs)/            # Navegación por pestañas
│   ├── index.tsx      # Dashboard/Resumen de gastos
│   └── explore.tsx    # Exploración/Análisis
├── _layout.tsx        # Layout raíz
└── +not-found.tsx     # Página 404

components/            # Componentes reutilizables
├── ui/               # Componentes base de UI
├── ThemedText.tsx    # Texto con temas
├── ThemedView.tsx    # Vista con temas
└── expense/          # Componentes específicos de gastos

constants/            # Configuraciones
├── Colors.ts         # Paleta de colores
├── Categories.ts     # Categorías de gastos
└── Settings.ts       # Configuraciones de la app

hooks/                # Custom hooks
├── useColorScheme.ts # Tema de la aplicación
├── useExpenses.ts    # Lógica de gastos
└── useStorage.ts     # Persistencia local

utils/                # Utilidades
├── formatters.ts     # Formateo de monedas/fechas
├── calculations.ts   # Cálculos de gastos
└── validators.ts     # Validaciones de datos
```

## Funcionalidades Principales

### 1. Gestión de Gastos

- ✅ Agregar nuevos gastos
- ✅ Categorizar gastos (comida, transporte, entretenimiento, etc.)
- ✅ Editar/eliminar gastos existentes
- ✅ Adjuntar notas y descripciones

### 2. Dashboard y Visualización

- ✅ Resumen de gastos del mes actual
- ✅ Gráficos de gastos por categoría
- ✅ Historial de gastos
- ✅ Filtros por fecha y categoría

### 3. Análisis y Reportes

- ✅ Estadísticas mensuales/semanales
- ✅ Comparación de períodos
- ✅ Metas de gasto
- ✅ Exportación de datos

### 4. Configuración

- ✅ Temas claro/oscuro
- ✅ Moneda preferida
- ✅ Categorías personalizadas
- ✅ Backup/restore de datos

## Patrones de Desarrollo

### Componentes Temáticos

```tsx
// Usar componentes con soporte de temas
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

const ExpenseItem = ({ expense }) => (
  <ThemedView style={styles.container}>
    <ThemedText type='subtitle'>{expense.description}</ThemedText>
    <ThemedText type='default'>${expense.amount}</ThemedText>
  </ThemedView>
)
```

### Gestión de Estado

```tsx
// Custom hooks para lógica de negocio
const useExpenses = () => {
  const [expenses, setExpenses] = useState([])

  const addExpense = (expense) => {
    // Lógica para agregar gasto
  }

  const deleteExpense = (id) => {
    // Lógica para eliminar gasto
  }

  return { expenses, addExpense, deleteExpense }
}
```

### Navegación

```tsx
// Navegación tipada con Expo Router
import { router } from 'expo-router'

const navigateToAddExpense = () => {
  router.push('/expenses/add')
}
```

## Guía de Estilos

### Paleta de Colores

```typescript
// constants/Colors.ts
export const Colors = {
  light: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F2F2F7',
    text: '#000000',
    expense: '#FF3B30',
    income: '#34C759'
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    expense: '#FF453A',
    income: '#30D158'
  }
}
```

### Categorías de Gastos

```typescript
// constants/Categories.ts
export const ExpenseCategories = [
  { id: 'food', name: 'Comida', icon: 'restaurant', color: '#FF9500' },
  { id: 'transport', name: 'Transporte', icon: 'car', color: '#007AFF' },
  {
    id: 'entertainment',
    name: 'Entretenimiento',
    icon: 'game-controller',
    color: '#AF52DE'
  },
  { id: 'health', name: 'Salud', icon: 'medical', color: '#FF3B30' },
  { id: 'shopping', name: 'Compras', icon: 'bag', color: '#FF2D92' },
  { id: 'utilities', name: 'Servicios', icon: 'home', color: '#5AC8FA' }
]
```

## Convenciones de Código

### Naming Conventions

- **Componentes**: PascalCase (`ExpenseCard`, `CategoryPicker`)
- **Hooks**: camelCase con prefijo `use` (`useExpenses`, `useCategories`)
- **Archivos**: kebab-case para archivos, PascalCase para componentes
- **Variables**: camelCase (`totalExpenses`, `selectedCategory`)

### Estructura de Componentes

```tsx
// components/expense/ExpenseCard.tsx
import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText'

interface ExpenseCardProps {
  expense: Expense
  onPress?: () => void
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress
}) => {
  return (
    <ThemedView style={styles.container}>
      {/* Contenido del componente */}
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 4
  }
})
```

## Configuración de Desarrollo

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Ejecutar en web
npm run web

# Linting
npm run lint

# Tests
npm run test
```

### Herramientas de Desarrollo

- **ESLint**: Configurado con reglas de Expo
- **TypeScript**: Tipado estático completo
- **Expo Dev Tools**: Debugging y hot reload
- **React Native Debugger**: Para debugging avanzado

## Próximos Pasos

1. **Configurar estructura base de datos local** (AsyncStorage/SQLite)
2. **Implementar sistema de autenticación** (opcional)
3. **Crear componentes de formularios** para agregar gastos
4. **Desarrollar dashboard** con gráficos y estadísticas
5. **Implementar sistema de notificaciones** para recordatorios
6. **Agregar funcionalidad de backup** en la nube

## Recursos Útiles

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

---

**Nota**: Este documento debe actualizarse conforme evolucione el proyecto. Mantener sincronizado con los cambios en la arquitectura y funcionalidades.
