# Configuración de Supabase

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Solución de Problemas de Conexión

### Error: "Wine realtime channel error - attempting retry"

Este error puede ocurrir por varias razones:

1. **Variables de entorno no configuradas**
   - Verifica que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén definidas
   - Reinicia el servidor de desarrollo después de agregar las variables

2. **Problemas de red**
   - Verifica tu conexión a internet
   - Asegúrate de que no haya un firewall bloqueando las conexiones WebSocket

3. **Configuración de Supabase**
   - Verifica que el proyecto de Supabase esté activo
   - Asegúrate de que Realtime esté habilitado en tu proyecto

4. **RLS (Row Level Security)**
   - Verifica que las políticas RLS permitan acceso a la tabla `wines`
   - Asegúrate de que el usuario anónimo tenga permisos de lectura

### Verificación de Configuración

1. **Verificar variables de entorno:**
   ```javascript
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
   console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌')
   ```

2. **Probar conexión básica:**
   ```javascript
   const { data, error } = await supabase
     .from('wines')
     .select('*')
     .limit(1)
   
   if (error) {
     console.error('Error de conexión:', error)
   } else {
     console.log('Conexión exitosa')
   }
   ```

### Configuración de Realtime en Supabase

1. Ve al dashboard de Supabase
2. Navega a Database > Replication
3. Asegúrate de que "Realtime" esté habilitado
4. Verifica que la tabla `wines` esté incluida en la replicación

### Políticas RLS Recomendadas

```sql
-- Permitir lectura anónima de vinos
CREATE POLICY "Allow anonymous read access to wines" ON wines
FOR SELECT USING (true);

-- Permitir inserción/actualización/eliminación solo a usuarios autenticados
CREATE POLICY "Allow authenticated users to manage wines" ON wines
FOR ALL USING (auth.role() = 'authenticated');
```

### Modo Fallback

La aplicación incluye un modo fallback que se activa automáticamente cuando hay problemas de conexión:

- Los datos se cargan desde la caché local
- Se muestra un indicador de estado en la interfaz
- Las funciones básicas siguen funcionando

### Debug

Para monitorear el estado de la conexión, puedes usar el componente `DebugRealtimeStatus` en desarrollo:

```jsx
import { DebugRealtimeStatus } from '@/components/debug-realtime-status'

// En tu componente
{process.env.NODE_ENV === 'development' && <DebugRealtimeStatus />}
``` 