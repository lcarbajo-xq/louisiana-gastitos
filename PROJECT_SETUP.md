# Louisiana Gastitos - Expense Tracker App

Una aplicación de seguimiento de gastos moderna desarrollada en React Native con TypeScript.

## 🚀 Tecnologías Utilizadas

- **React Native** - Framework principal
- **TypeScript** - Tipado estático
- **Expo** - Plataforma de desarrollo
- **Zustand** - Manejo de estado
- **NativeWind** - Estilos (Tailwind CSS para React Native)
- **Victory Charts** - Gráficos y visualizaciones
- **AsyncStorage** - Persistencia local
- **React Navigation 6** - Navegación

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── GradientButton.tsx
│   ├── ExpenseCard.tsx
│   ├── ModernInput.tsx
│   └── CategoryLegend.tsx
├── screens/             # Pantallas de la aplicación
│   ├── OnboardingScreen.tsx
│   └── DashboardScreen.tsx
├── navigation/          # Configuración de navegación
│   └── types.ts
├── store/              # Stores de Zustand
│   ├── expenseStore.ts
│   ├── categoryStore.ts
│   ├── statsStore.ts
│   └── settingsStore.ts
├── services/           # Servicios (APIs, storage)
│   └── StorageService.ts
├── utils/              # Utilidades y helpers
│   └── helpers.ts
├── types/              # Definiciones de TypeScript
│   └── expense.ts
└── assets/             # Recursos estáticos
```

## 🎨 Funcionalidades Principales

- ✅ Seguimiento manual de gastos por categorías
- ✅ Dashboard con estadísticas visuales
- ✅ Sistema de categorización personalizable
- ✅ Vista de gastos recientes
- ✅ Persistencia local de datos
- 🚧 Gráficos circulares interactivos (Victory Charts)
- 🚧 Integración con APIs bancarias
- 🚧 Notificaciones de presupuesto

## 🎨 Design System

El proyecto utiliza un design system basado en NativeWind con:

- **Colores principales**: Purple (#8B5CF6), Blue (#3B82F6), Pink (#EC4899), Green (#10B981)
- **Categorías**: Food, Shopping, Transport, Health & Fitness, Education, Other
- **Tipografía**: SF Pro Display
- **Tema**: Modo oscuro por defecto

## 🛠️ Instalación

1. **Instalar dependencias:**

   ```bash
   bun install
   ```

2. **Iniciar el servidor de desarrollo:**

   ```bash
   bun start
   ```

3. **Ejecutar en dispositivo/emulador:**

   ```bash
   # iOS
   bun ios

   # Android
   bun android
   ```

## 📱 Pantallas Implementadas

### Onboarding

- Pantalla de bienvenida con design moderno
- Botón de navegación al dashboard
- Efectos visuales con gradientes

### Dashboard

- Vista general de gastos del mes
- Gráfico circular (placeholder)
- Lista de gastos recientes
- Categorías con iconos y colores

## 🔄 Estado de la Aplicación (Zustand)

### ExpenseStore

- Gestión de gastos individuales
- CRUD completo de expenses
- Filtros por categoría y fecha

### CategoryStore

- Categorías predefinidas y personalizadas
- Gestión de colores e iconos
- Funciones de reseteo

### StatsStore

- Cálculos de estadísticas
- Métricas por período
- Status de presupuestos

### SettingsStore

- Configuración de la app
- Tema y moneda
- Notificaciones

## 🚀 Próximos Pasos

1. **Implementar Victory Charts** para gráficos interactivos
2. **Crear formulario de nuevo gasto** con validaciones
3. **Agregar React Navigation** completa
4. **Integrar cámara** para recibos
5. **Configurar notificaciones** push
6. **Preparar integración bancaria** con APIs

## 🎯 Arquitectura

La aplicación sigue principios de:

- **Separación de responsabilidades**
- **Estado centralizado** con Zustand
- **Componentes reutilizables**
- **Tipado fuerte** con TypeScript
- **Persistencia automática** con AsyncStorage

## 📝 Notas de Desarrollo

- Los errores de ESLint sobre módulos faltantes se resolverán al instalar las dependencias
- El proyecto está configurado para usar NativeWind v4
- Se incluye configuración completa de Metro y Babel
- Las rutas de TypeScript están configuradas para importaciones absolutas

## 📄 Licencia

Este proyecto es privado y está en desarrollo.
