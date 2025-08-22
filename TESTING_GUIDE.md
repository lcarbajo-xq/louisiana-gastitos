# Testing Guide - Louisiana Gastitos

Una guía completa de testing para la aplicación de seguimiento de gastos.

## 🧪 Stack de Testing

### Herramientas Principales

- **Jest** - Framework de testing unitario
- **React Native Testing Library** - Testing de componentes
- **Detox** - Testing E2E (End-to-End)
- **Storybook** - Documentación y testing de componentes UI
- **Flashlight** - Performance testing

### Dependencias Instaladas

```bash
# Testing core
jest
@types/jest
@testing-library/react-native
@testing-library/jest-native
react-test-renderer

# E2E Testing
detox
detox-cli

# UI Documentation
@storybook/react-native
@storybook/addon-ondevice-controls
@storybook/addon-ondevice-actions
@storybook/addon-ondevice-notes

# Performance Testing
flashlight
```

## 🏗️ Estructura de Testing

```
src/
├── __tests__/
│   ├── components/         # Tests de componentes React
│   ├── hooks/             # Tests de custom hooks
│   ├── services/          # Tests de servicios (ML, export, etc.)
│   ├── store/             # Tests de Zustand stores
│   └── utils/             # Tests de utilidades
├── components/
│   └── *.stories.tsx      # Stories de Storybook
e2e/
├── *.test.js              # Tests E2E con Detox
├── init.js                # Setup de Detox
└── jest.config.js         # Configuración Jest para E2E
performance-tests/
├── *.js                   # Scripts de performance con Flashlight
└── dashboard-performance.js
.github/workflows/
└── ci-cd.yml              # Pipeline de CI/CD con tests
```

## 🔧 Configuración

### Jest (jest.config.js)

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
    // ... más mappings
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Detox (.detoxrc.json)

```json
{
  "testRunner": {
    "args": {
      "$0": "jest",
      "config": "e2e/jest.config.js"
    }
  },
  "configurations": {
    "ios.sim.debug": {
      "device": "simulator",
      "app": "ios.debug"
    }
  }
}
```

## 🧪 Tipos de Tests

### 1. Tests Unitarios (Jest + RTL)

#### Testing de Stores Zustand

```typescript
// src/__tests__/store/expenseStore.test.ts
import { renderHook, act } from '@testing-library/react-native'
import { useExpenseStore } from '../../store/expenseStore'

describe('useExpenseStore', () => {
  it('should add expense successfully', async () => {
    const { result } = renderHook(() => useExpenseStore())

    await act(async () => {
      result.current.addExpense(mockExpense)
    })

    expect(result.current.expenses).toHaveLength(1)
  })
})
```

#### Testing de Servicios ML

```typescript
// src/__tests__/services/MLAnalysisService.test.ts
import { MLAnalysisService } from '../../services/MLAnalysisService'

describe('MLAnalysisService', () => {
  it('should predict weekly spending', async () => {
    const prediction = await MLAnalysisService.predictSpending(
      mockExpenses,
      'food',
      'week'
    )

    expect(prediction.predictedAmount).toBeGreaterThan(0)
    expect(prediction.confidence).toBeBetween(0, 1)
  })
})
```

#### Testing de Componentes React

```typescript
// src/__tests__/components/SmartDashboard.test.tsx
import { render, fireEvent } from '@testing-library/react-native'
import { SmartDashboard } from '../../components/SmartDashboard'

describe('SmartDashboard', () => {
  it('should render financial health score', () => {
    const { getByText } = render(<SmartDashboard />)
    expect(getByText('Financial Health Score')).toBeTruthy()
  })
})
```

### 2. Tests E2E (Detox)

```javascript
// e2e/expense-tracker.test.js
describe('Expense Tracker E2E', () => {
  it('should complete add expense flow', async () => {
    await device.launchApp()

    // Navigate to add expense
    await element(by.id('add-expense-tab')).tap()

    // Fill form
    await element(by.placeholder('$0.00')).typeText('25.50')
    await element(by.placeholder('Description')).typeText('Lunch')

    // Save expense
    await element(by.id('save-button')).tap()

    // Verify success
    await expect(element(by.text('Lunch'))).toBeVisible()
  })
})
```

### 3. Performance Tests (Flashlight)

```javascript
// performance-tests/dashboard-performance.js
module.exports = {
  async test({ device, logger }) {
    const startTime = Date.now()
    await device.launchApp()
    await device.waitForElement('Expenses', 5000)
    const loadTime = Date.now() - startTime

    logger.info(`Dashboard loaded in ${loadTime}ms`)
    return { dashboardLoadTime: loadTime }
  }
}
```

### 4. Visual Testing (Storybook)

```typescript
// src/components/ExpenseCard.stories.tsx
export default {
  title: 'Components/ExpenseCard',
  component: ExpenseCard
} as Meta

export const Default = Template.bind({})
Default.args = {
  expense: mockExpense
}
```

## 🚀 Scripts de Testing

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "jest --detectOpenHandles --verbose",
    "test:e2e": "detox test",
    "test:e2e:build": "detox build",
    "test:e2e:ios": "detox test --configuration ios.sim.debug",
    "test:performance": "flashlight test",
    "storybook": "sb-rn-get-stories --watch"
  }
}
```

### Comandos de Ejecución

```bash
# Tests unitarios
bun test                    # Ejecutar todos los tests
bun test:watch             # Modo watch
bun test:coverage          # Con cobertura
bun test ExpenseStore      # Test específico

# Tests E2E
bun test:e2e:build         # Build para E2E
bun test:e2e              # Ejecutar E2E
bun test:e2e:ios          # Solo iOS

# Performance
bun test:performance       # Tests de performance

# Storybook
bun storybook             # Ejecutar Storybook
```

## 📊 Cobertura de Testing

### Objetivos de Cobertura

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Áreas Críticas (100% cobertura requerida)

- Stores de Zustand (gestión de estado)
- Servicios ML (algoritmos de predicción)
- Servicios de exportación/importación
- Hooks de funcionalidades avanzadas
- Utilidades de cálculo financiero

### Reportes de Cobertura

```bash
# Generar reporte HTML
bun test:coverage

# Ver reporte
open coverage/lcov-report/index.html
```

## 🔄 CI/CD Integration

### GitHub Actions Pipeline

```yaml
# .github/workflows/ci-cd.yml
jobs:
  lint-and-test:
    steps:
      - name: Run unit tests
        run: bun run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    steps:
      - name: Run E2E tests
        run: bun run test:e2e:ios

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-artifacts
          path: e2e/artifacts/
```

## 🐛 Debugging Tests

### Common Issues

#### 1. AsyncStorage Mock Issues

```javascript
// jest.setup.js
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)
```

#### 2. React Native Modules

```javascript
// Mock react-native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})
```

#### 3. Victory Charts

```javascript
// Mock Victory Charts
jest.mock('victory-native', () => ({
  VictoryPie: 'VictoryPie',
  VictoryChart: 'VictoryChart'
}))
```

### Debug Commands

```bash
# Debug específico test
bun test --testNamePattern="should add expense" --verbose

# Debug con logs
bun test --silent=false

# Debug E2E
DEBUG=detox* bun test:e2e
```

## 📈 Performance Testing

### Métricas Monitoreadas

- **Load Time**: Tiempo de carga inicial
- **Navigation Time**: Tiempo de navegación entre pantallas
- **Memory Usage**: Uso de memoria
- **CPU Usage**: Uso de CPU
- **FPS**: Frames por segundo
- **Battery Usage**: Consumo de batería

### Thresholds

```json
{
  "thresholds": {
    "cpu": 80, // % máximo CPU
    "memory": 200, // MB máximo memoria
    "fps": 55, // FPS mínimo
    "loadTime": 3000 // ms máximo carga
  }
}
```

## 🎯 Best Practices

### 1. Testing Structure

- **Arrange**: Setup de datos de prueba
- **Act**: Ejecutar la acción a probar
- **Assert**: Verificar el resultado

### 2. Mock Strategy

- Mock dependencias externas
- Use real implementations para lógica de negocio
- Mock APIs y servicios de terceros

### 3. Test Data

```typescript
// Usar factory functions para datos consistentes
const createMockExpense = (overrides = {}) => ({
  id: 'test-id',
  amount: 50,
  category: mockCategory,
  description: 'Test expense',
  date: new Date(),
  ...overrides
})
```

### 4. Async Testing

```typescript
// Siempre usar await con async operations
await act(async () => {
  result.current.addExpense(mockExpense)
})

// Use waitFor para elementos que aparecen asincrónicamente
await waitFor(() => {
  expect(getByText('Success')).toBeVisible()
})
```

### 5. E2E Test Stability

- Use unique testIDs
- Implement proper waits
- Clean up between tests
- Handle flaky network conditions

## 📋 Checklist de Testing

### Pre-commit

- [ ] Tests unitarios pasan
- [ ] Cobertura > 80%
- [ ] No tests skipped sin razón
- [ ] Mocks correctamente configurados

### Pre-merge

- [ ] Tests E2E pasan
- [ ] Performance tests dentro de thresholds
- [ ] Storybook stories actualizadas
- [ ] Documentación de tests actualizada

### Pre-deploy

- [ ] Full test suite ejecutada
- [ ] Performance regression tests
- [ ] Cross-platform testing (iOS/Android)
- [ ] Edge cases cubiertos

---

## 🔗 Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Storybook React Native](https://storybook.js.org/docs/react-native/get-started/introduction)
- [Flashlight Performance Testing](https://docs.flashlight.dev/)

**¡Testing completo implementado! 🧪✅**
