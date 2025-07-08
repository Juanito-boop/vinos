# Sistema de Persistencia de Datos en URL

## Descripción

Este sistema permite guardar de forma encriptada los filtros y el carrito de compras en la URL del navegador, permitiendo que los datos persistan entre recargas de página y puedan ser compartidos mediante enlaces.

## Características

### 🔐 Encriptación
- Los datos se encriptan usando una clave secreta antes de ser guardados en la URL
- Utiliza una combinación de base64 y XOR para mayor seguridad
- Los datos no son legibles directamente en la URL

### 💾 Datos Persistidos
- **Carrito de compras**: Productos agregados y cantidades
- **Filtros aplicados**: Variedades, bodegas, países y colores seleccionados

### 🔄 Funcionalidades
- **Recuperación automática**: Los datos se cargan automáticamente al abrir la página
- **Actualización en tiempo real**: Los cambios se guardan inmediatamente en la URL
- **Limpieza selectiva**: Botones para limpiar carrito, filtros o todos los datos
- **Notificaciones**: Informa al usuario cuando se recuperan datos de la URL

## Archivos Principales

### Hooks
- `src/hooks/use-cart.ts` - Hook del carrito con persistencia
- `src/hooks/use-filters.ts` - Hook de filtros con persistencia
- `src/hooks/use-url-persistence.ts` - Hook para limpiar datos de la URL
- `src/hooks/use-url-data-detector.ts` - Hook para detectar datos en la URL

### Utilidades
- `src/lib/utils.ts` - Funciones de encriptación/desencriptación y manejo de URL

### Componentes
- `src/components/url-persistence-info.tsx` - Componente informativo
- `src/components/wine-store.tsx` - Componente principal con botones de control

## Uso

### Para el Usuario
1. **Agregar productos al carrito**: Se guardan automáticamente en la URL
2. **Aplicar filtros**: Se guardan automáticamente en la URL
3. **Compartir enlace**: La URL contiene todos los datos encriptados
4. **Recargar página**: Los datos se recuperan automáticamente
5. **Limpiar datos**: Usar los botones de limpieza según necesidad

### Para el Desarrollador

#### Agregar persistencia a un nuevo hook:
```typescript
import { updateURLWithData, getDataFromURL } from "@/lib/utils"

// En el hook
useEffect(() => {
  const savedData = getDataFromURL('paramName')
  if (savedData) {
    setState(savedData)
  }
}, [])

const updateState = (newData) => {
  setState(newData)
  updateURLWithData(newData, 'paramName')
}
```

#### Limpiar datos de la URL:
```typescript
import { useURLPersistence } from "@/hooks/use-url-persistence"

const { clearAllData, clearCartData, clearFiltersData } = useURLPersistence()
```

## Seguridad

- Los datos se encriptan antes de ser guardados en la URL
- La clave de encriptación está definida en el código (puede ser movida a variables de entorno)
- Los datos encriptados no son legibles para usuarios comunes
- Se incluye manejo de errores para datos corruptos

## Limitaciones

- La URL tiene un límite de longitud (aproximadamente 2000 caracteres)
- Los datos muy grandes pueden causar problemas
- La encriptación es básica y no es criptográficamente segura para datos sensibles

## Mejoras Futuras

- [ ] Mover la clave de encriptación a variables de entorno
- [ ] Implementar compresión de datos para URLs más largas
- [ ] Agregar validación de datos antes de la recuperación
- [ ] Implementar versionado de datos para compatibilidad
- [ ] Agregar opción para deshabilitar la persistencia 