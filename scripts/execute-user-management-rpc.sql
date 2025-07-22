-- Script para ejecutar las funciones RPC de gestión de usuarios
-- Ejecuta este script en el SQL Editor de Supabase DESPUÉS de ejecutar create-user-management-rpc.sql

-- 1. Verificar que las funciones existen
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_users_for_admin', 'update_user_role_safe', 'get_user_stats')
AND routine_schema = 'public'
ORDER BY routine_name;

-- 2. Probar la función de estadísticas (solo si eres admin)
-- SELECT * FROM get_user_stats();

-- 3. Probar la función de listar usuarios (solo si eres admin)
-- SELECT * FROM get_users_for_admin();

-- 4. Verificar que el usuario actual tiene permisos de admin
SELECT 
  id,
  email,
  user_metadata->>'role' as role,
  user_metadata->>'isAdmin' as is_admin,
  CASE 
    WHEN user_metadata->>'role' = 'admin' OR 
         user_metadata->>'isAdmin' = 'true' OR
         email = 'acevedojuanesteban.colombia@gmail.com'
    THEN 'SÍ ES ADMIN'
    ELSE 'NO ES ADMIN'
  END as admin_status
FROM auth.users 
WHERE id = auth.uid();

-- 5. Si no eres admin, configurar el primer admin (reemplaza con tu email)
/*
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
*/

-- 6. Verificar configuración final
SELECT 
  'Configuración de gestión de usuarios completada' as status,
  'Las funciones RPC están listas para usar desde la aplicación' as next_step; 