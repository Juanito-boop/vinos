-- Script para corregir el acceso a los vinos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Eliminar políticas problemáticas si existen
DROP POLICY IF EXISTS "Allow admin full access to wines" ON wines;
DROP POLICY IF EXISTS "Allow admin full access to wine_details" ON wine_details;

-- 2. Crear políticas correctas para acceso público a vinos
-- Permitir lectura pública de vinos (para la tienda)
CREATE POLICY "Allow public read access to wines" ON wines
FOR SELECT USING (true);

-- Permitir lectura pública de wine_details
CREATE POLICY "Allow public read access to wine_details" ON wine_details
FOR SELECT USING (true);

-- 3. Crear políticas para operaciones de administración
-- Solo admins pueden insertar, actualizar y eliminar vinos
CREATE POLICY "Allow admin write access to wines" ON wines
FOR ALL USING (
  auth.role() = 'authenticated' AND (
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'user_metadata' ->> 'isAdmin' = 'true' OR
    auth.jwt() ->> 'email' = 'acevedojuanesteban.colombia@gmail.com'
  )
);

-- Solo admins pueden insertar, actualizar y eliminar wine_details
CREATE POLICY "Allow admin write access to wine_details" ON wine_details
FOR ALL USING (
  auth.role() = 'authenticated' AND (
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin' OR
    auth.jwt() ->> 'user_metadata' ->> 'isAdmin' = 'true' OR
    auth.jwt() ->> 'email' = 'acevedojuanesteban.colombia@gmail.com'
  )
);

-- 4. Verificar que RLS esté habilitado
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_details ENABLE ROW LEVEL SECURITY;

-- 5. Verificar configuración
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('wines', 'wine_details')
ORDER BY tablename, policyname;

-- 6. Probar acceso público
-- Esto debería funcionar sin autenticación
SELECT COUNT(*) as total_wines FROM wines;

-- 7. Verificar que las funciones de admin existen
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'update_user_role', 'list_users_for_admin')
AND routine_schema = 'public'; 