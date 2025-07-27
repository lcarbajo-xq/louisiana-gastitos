# Design System - Louisiana Gastitos

## 🎨 Paleta de Colores

### Colores Principales
```typescript
// Primarios
primary: {
  50: '#EFF6FF',
  100: '#DBEAFE',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  900: '#1E3A8A',
}

// Grises
gray: {
  50: '#F9FAFB',
  100: '#F3F4F6',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
}
```

### Estados
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)
- **Info**: `#3B82F6` (Blue)

## 📚 Componentes

### 1. GradientButton
Botón con gradiente y múltiples variantes.

```tsx
<GradientButton
  title="Agregar Gasto"
  onPress={() => {}}
  variant="primary" // primary | secondary | outline
  size="lg" // sm | md | lg
  disabled={false}
  loading={false}
  icon="plus"
/>
```

**Variantes:**
- `primary`: Gradiente azul principal
- `secondary`: Estilo sólido gris
- `outline`: Solo borde sin fondo

**Tamaños:**
- `sm`: Pequeño (32px alto)
- `md`: Mediano (40px alto)
- `lg`: Grande (48px alto)

### 2. ExpenseCard
Tarjeta para mostrar gastos individuales.

```tsx
<ExpenseCard
  title="Almuerzo"
  amount={25.50}
  category="Comida"
  date={new Date()}
  variant="default" // default | elevated | outlined | gradient
  onPress={() => {}}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

**Variantes:**
- `default`: Estilo base
- `elevated`: Con sombra elevada
- `outlined`: Solo con borde
- `gradient`: Con fondo degradado

### 3. ModernInput
Campo de entrada moderno con múltiples estados.

```tsx
<ModernInput
  label="Descripción"
  placeholder="Ej: Almuerzo en restaurante"
  value={value}
  onChangeText={setValue}
  variant="default" // default | outlined | filled
  error="Campo requerido"
  leftIcon="search"
  rightIcon="x"
/>
```

**Variantes:**
- `default`: Estilo base con línea inferior
- `outlined`: Con borde completo
- `filled`: Con fondo sólido

### 4. CategoryLegend
Leyenda de categorías con iconos.

```tsx
<CategoryLegend
  categories={categories}
  variant="default" // default | compact | detailed
  showIcons={true}
  onCategoryPress={(category) => {}}
/>
```

**Variantes:**
- `default`: Lista horizontal compacta
- `compact`: Versión mini
- `detailed`: Lista vertical con más información

### 5. Icon
Sistema de iconos con Lucide React Native.

```tsx
<Icon
  name="utensils" // IconName
  size={24}
  color="#FFFFFF"
  className="mr-2"
/>
```

**Iconos Disponibles:**
- `utensils`, `shopping-bag`, `car`, `star`
- `book-open`, `more-horizontal`, `chevron-right`
- `check`, `x`, `calendar`, `paperclip`

### 6. IconButton
Botón con solo icono.

```tsx
<IconButton
  icon="plus"
  onPress={() => {}}
  variant="primary" // primary | secondary | ghost | danger
  size="md" // sm | md | lg | xl
  label="Agregar" // Opcional
/>
```

### 7. StatusBadge
Badge de estado con colores semánticos.

```tsx
<StatusBadge
  status="success" // success | warning | error | info | neutral
  text="Pagado"
  icon="check"
  variant="filled" // filled | outlined | subtle
  size="md" // sm | md | lg
/>
```

### 8. ProgressBar
Barra de progreso animada.

```tsx
<ProgressBar
  progress={75}
  variant="success" // default | success | warning | danger
  size="md" // sm | md | lg
  showLabel={true}
  label="Presupuesto Usado"
/>

<CircularProgress
  progress={60}
  size={80}
  variant="warning"
  showLabel={true}
/>
```

## 🛠 Uso con NativeWind

Todos los componentes están construidos con clases de Tailwind CSS a través de NativeWind:

```tsx
// Espaciado
className="p-4 m-2 gap-3"

// Colores
className="bg-gray-800 text-white border-gray-600"

// Layout
className="flex-row items-center justify-between"

// Tipografía
className="text-sm font-medium text-gray-300"

// Borders
className="rounded-lg border border-gray-700"
```

## 📱 Responsive Design

Los componentes se adaptan automáticamente usando clases responsivas:

```tsx
// Tamaños adaptativos
className="w-full md:w-1/2 lg:w-1/3"

// Padding responsive
className="p-2 md:p-4 lg:p-6"

// Texto responsive
className="text-sm md:text-base lg:text-lg"
```

## 🎯 Guías de Uso

### 1. Consistencia
- Usar siempre los componentes del design system
- Mantener espaciado consistente (múltiplos de 4px)
- Usar la paleta de colores definida

### 2. Accesibilidad
- Contraste mínimo de 4.5:1 para texto
- Botones con área mínima de 44px
- Labels descriptivos para iconos

### 3. Performance
- Componentes optimizados para React Native
- Uso eficiente de estados y props
- Animaciones suaves (max 300ms)

## 📖 Ejemplos de Uso

### Pantalla de Dashboard
```tsx
import {
  GradientButton,
  ExpenseCard,
  StatusBadge,
  ProgressBar,
  CategoryLegend
} from '../components';

// Uso en pantalla
<View className="flex-1 bg-gray-900 p-4">
  <StatusBadge 
    status="success" 
    text="Presupuesto OK" 
    className="mb-4" 
  />
  
  <ProgressBar 
    progress={67} 
    label="Gasto Mensual"
    className="mb-6"
  />
  
  <CategoryLegend 
    categories={categories}
    variant="compact"
    className="mb-4"
  />
  
  <ExpenseCard
    title="Almuerzo"
    amount={25.50}
    category="Comida"
    date={new Date()}
    variant="elevated"
  />
  
  <GradientButton
    title="Agregar Gasto"
    onPress={addExpense}
    variant="primary"
    size="lg"
    icon="plus"
    className="mt-4"
  />
</View>
```
