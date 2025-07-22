# Configuración de Roles de Administrador en Supabase

## 🎯 Resumen

Este documento explica cómo configurar y gestionar roles de administrador en tu aplicación de Wine Store usando Supabase.

## 📋 Opciones Disponibles

### Opción 1: User Metadata (Recomendada) ✅

Esta es la forma más simple y directa de manejar roles:

#### Ventajas:
- ✅ Fácil de implementar
- ✅ No requiere tablas adicionales
- ✅ Funciona con magic links
- ✅ Seguro y escalable

#### Cómo funciona:
1. Los roles se almacenan en `user_metadata` de Supabase Auth
2. Se verifica automáticamente en cada sesión
3. Los administradores pueden gestionar roles de otros usuarios

## 🔧 Configuración Paso a Paso

### 1. Ejecutar Script SQL

Ve al **SQL Editor** de tu proyecto de Supabase y ejecuta el script `scripts/setup-admin-roles.sql`.

### 2. Configurar el Primer Administrador

En el **SQL Editor**, ejecuta:

```sql
-- Reemplaza con tu email
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'tu-email@ejemplo.com';

UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{isAdmin}',
  'true'
)
WHERE email = 'tu-email@ejemplo.com';
```

### 3. Verificar Configuración

```sql
-- Verificar que el usuario es admin
SELECT 
  email,
  user_metadata->>'role' as role,
  user_metadata->>'isAdmin' as is_admin
FROM auth.users 
WHERE email = 'tu-email@ejemplo.com';
```

## 🚀 Uso en la Aplicación

### Verificar si un usuario es admin:

```typescript
const { user } = useAuth()

if (user?.isAdmin) {
  // Mostrar funcionalidades de administrador
}
```

### Gestionar roles (solo para admins):

```typescript
const { updateUserRole } = useAuth()

// Promover a administrador
await updateUserRole(userId, true)

// Degradar a usuario normal
await updateUserRole(userId, false)
```

## 🛡️ Seguridad

### Políticas RLS (Row Level Security)

El script crea políticas que:
- ✅ Permiten acceso completo a admins
- ✅ Restringen acceso a usuarios normales
- ✅ Protegen datos sensibles

### Verificación de Roles

```sql
-- Función que verifica si un usuario es admin
SELECT is_admin(auth.uid());
```

## 📱 Componentes Disponibles

### AdminUserManager

Componente para gestionar usuarios (solo visible para admins):

```tsx
import { AdminUserManager } from "@/components/admin-user-manager"

// En tu panel de administración
<AdminUserManager />
```

### UserMenu

El menú de usuario muestra diferentes opciones según el rol:

```tsx
// Automáticamente muestra opciones de admin si user.isAdmin es true
<UserMenu />
```

## 🔍 Debugging

### Verificar Estado del Usuario

```typescript
const { user } = useAuth()

console.log('User:', {
  id: user?.id,
  email: user?.email,
  isAdmin: user?.isAdmin,
  metadata: user?.user_metadata
})
```

### Verificar en Supabase Dashboard

1. Ve a **Authentication > Users**
2. Busca tu usuario
3. Verifica que `user_metadata` contenga:
   ```json
   {
     "role": "admin",
     "isAdmin": true
   }
   ```

## 🚨 Solución de Problemas

### Problema: Usuario no aparece como admin

**Solución:**
1. Verifica que el UPDATE SQL se ejecutó correctamente
2. Cierra sesión y vuelve a iniciar
3. Verifica `user_metadata` en el dashboard

### Problema: Error al actualizar roles

**Solución:**
1. Verifica que tienes permisos de admin
2. Asegúrate de que el `service_role_key` esté configurado
3. Revisa los logs de Supabase

### Problema: Políticas RLS bloquean acceso

**Solución:**
1. Ejecuta el script SQL completo
2. Verifica que la función `is_admin()` existe
3. Confirma que las políticas están activas

## 📊 Estructura de Datos

### User Metadata

```json
{
  "role": "admin" | "user",
  "isAdmin": true | false,
  "name": "Nombre del Usuario",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Funciones SQL

- `is_admin(user_id)`: Verifica si un usuario es admin
- `update_user_role(user_id, role)`: Actualiza el rol de un usuario
- `list_users_for_admin()`: Lista usuarios para admins

## 🔄 Flujo de Trabajo

1. **Configuración inicial**: Ejecutar script SQL
2. **Primer admin**: Configurar manualmente en SQL
3. **Gestión continua**: Usar AdminUserManager
4. **Verificación**: Usar funciones de debug

## 📝 Notas Importantes

- Los roles se verifican en cada sesión
- Solo los admins pueden gestionar roles
- El email `acevedojuanesteban.colombia@gmail.com` está hardcodeado como admin
- Los cambios de rol requieren reinicio de sesión
- Las políticas RLS protegen los datos automáticamente

## 🎉 ¡Listo!

Una vez configurado, tendrás un sistema completo de roles de administrador que:
- ✅ Es seguro y escalable
- ✅ Funciona con magic links
- ✅ Permite gestión visual de usuarios
- ✅ Protege datos sensibles
- ✅ Es fácil de mantener 