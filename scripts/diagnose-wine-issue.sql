-- Script de diagnóstico para problemas con vinos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar que las tablas existen
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name IN ('wines', 'wine_details')
AND table_schema = 'public';

-- 2. Verificar estructura de las tablas
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'wines'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'wine_details'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar si hay datos en las tablas
SELECT COUNT(*) as total_wines FROM wines;
SELECT COUNT(*) as total_wine_details FROM wine_details;

-- 4. Verificar políticas RLS
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

-- 5. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('wines', 'wine_details')
AND schemaname = 'public';

-- 6. Probar consulta simple
SELECT id_vino, nombre FROM wines LIMIT 5;

-- 7. Probar consulta con join
SELECT 
  w.id_vino,
  w.nombre,
  wd.bodega
FROM wines w
LEFT JOIN wine_details wd ON w.id_vino = wd.id_vino
LIMIT 5;

-- 8. Verificar permisos del usuario anónimo
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('wines', 'wine_details')
AND grantee = 'anon';

-- 9. Verificar permisos del usuario autenticado
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('wines', 'wine_details')
AND grantee = 'authenticated'; 