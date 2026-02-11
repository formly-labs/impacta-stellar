# Dashboard Components

Esta carpeta contiene todos los componentes refactorizados del Dashboard en una estructura modular y reutilizable.

## 📁 Estructura

```
components/
├── hooks/              # Custom hooks para lógica reutilizable
│   ├── useForms.ts     # Manejo de formularios (fetch, archive)
│   ├── useWorkspace.ts # Manejo del workspace (rename, delete, etc)
│   └── index.ts        # Exportaciones
│
├── sidebar/            # Componentes del sidebar
│   ├── DashboardSidebar.tsx  # Sidebar principal
│   ├── WorkspaceNav.tsx      # Navegación de workspaces
│   └── index.ts              # Exportaciones
│
├── header/             # Componentes del header
│   ├── DashboardHeader.tsx   # Header principal (desktop)
│   ├── MobileControls.tsx    # Controles móviles
│   ├── ViewControls.tsx      # Controles de vista (list/grid)
│   └── index.ts              # Exportaciones
│
├── forms/              # Componentes relacionados con formularios
│   ├── FormList.tsx          # Lista de formularios
│   ├── FormCard.tsx          # Card de formulario (vista grid)
│   ├── FormListItem.tsx      # Item de formulario (vista list)
│   ├── EmptyState.tsx        # Estado vacío
│   └── index.ts              # Exportaciones
│
└── modals/             # Componentes de modales
    ├── InviteModal.tsx       # Modal de invitación
    ├── RenameModal.tsx       # Modal de renombrar workspace
    ├── LeaveModal.tsx        # Modal de salir del workspace
    ├── DeleteModal.tsx       # Modal de eliminar workspace
    └── index.ts              # Exportaciones
```

## 🎯 Ventajas de esta estructura

### 1. **Separación de responsabilidades**
Cada componente tiene una única responsabilidad bien definida:
- Los hooks manejan la lógica de negocio
- Los componentes se encargan de la presentación
- Los modales están aislados para ser fácilmente reutilizables

### 2. **Reutilización**
Los componentes están diseñados para ser reutilizados:
- `FormCard` y `FormListItem` pueden usarse en otras vistas
- Los hooks pueden compartirse entre diferentes páginas
- Los modales son componentes independientes

### 3. **Mantenibilidad**
- Archivos pequeños (~50-200 líneas) fáciles de leer
- Lógica agrupada por funcionalidad
- Imports organizados con archivos index.ts

### 4. **Testabilidad**
Cada componente puede ser probado de forma independiente:
- Los hooks pueden testearse con `@testing-library/react-hooks`
- Los componentes pueden testearse con `@testing-library/react`

## 📝 Uso

### Importar componentes

```typescript
// Importar desde index
import { FormList, FormCard } from './components/forms';
import { useForms, useWorkspace } from './components/hooks';
import { InviteModal, RenameModal } from './components/modals';

// O importar directamente
import { FormList } from './components/forms/FormList';
```

### Ejemplo de uso de hooks

```typescript
function MyComponent() {
  const { 
    forms, 
    loading, 
    handleArchive 
  } = useForms(userAddress);

  const {
    workspaceName,
    handleRename
  } = useWorkspace();

  // Tu lógica aquí
}
```

## 🔧 Extensión

Para agregar nuevos componentes:

1. Crea el archivo en la carpeta correspondiente
2. Exporta el componente en el archivo `index.ts`
3. Usa TypeScript para definir las props claramente
4. Mantén el componente enfocado en una sola responsabilidad

## 📊 Mejoras futuras

- [ ] Agregar tests unitarios para cada componente
- [ ] Implementar Storybook para documentación visual
- [ ] Agregar animaciones con Framer Motion
- [ ] Implementar skeleton loaders
- [ ] Agregar búsqueda en tiempo real
