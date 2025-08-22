# Project Structure Reorganization

## Overview
This reorganization consolidates all source code under the `src/` directory with a clear, hierarchical structure that improves maintainability and developer experience.

## New Structure

```
src/
├── components/           # UI Components (organized by purpose)
│   ├── ui/              # Base UI components
│   │   ├── base/        # Fundamental UI building blocks
│   │   └── index.ts     # UI exports
│   ├── forms/           # Form-related components
│   ├── cards/           # Card/display components
│   ├── features/        # Feature-specific components
│   └── index.ts         # Main component exports
├── screens/             # Screen components
├── services/            # Business logic services
│   ├── storage/         # Data persistence services
│   ├── analytics/       # Analytics and ML services
│   ├── data/           # Data processing services
│   └── index.ts        # Service exports
├── store/              # State management (Zustand stores)
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── navigation/         # Navigation configuration
```

## Component Organization

### UI Components (`src/components/ui/`)
- **base/**: Fundamental building blocks (Icon, Button, ProgressBar, etc.)
- Platform-specific components (IconSymbol, TabBarBackground)

### Form Components (`src/components/forms/`)
- Input components (ModernInput, DatePicker)
- Form validation and handling

### Card Components (`src/components/cards/`)
- Display components (ExpenseCard, CategoryStats)
- Data presentation

### Feature Components (`src/components/features/`)
- Complex, feature-specific components
- Business logic components

## Service Organization

### Storage Services (`src/services/storage/`)
- Data persistence (StorageService, SecureStorageService)
- Background synchronization

### Analytics Services (`src/services/analytics/`)
- User analytics and tracking
- Machine learning analysis

### Data Services (`src/services/data/`)
- Data export and reporting
- Data transformation

## Benefits

1. **Clear Separation of Concerns**: Components are organized by their purpose and complexity level
2. **Easier Imports**: Barrel exports (`index.ts`) make imports cleaner
3. **Better Discoverability**: Developers can quickly find components by category
4. **Scalability**: Structure supports growth and new feature additions
5. **Consistency**: Unified organization patterns across the codebase

## Migration Notes

- All imports are automatically updated via barrel exports
- Legacy components remain available for backward compatibility
- No breaking changes to existing functionality
