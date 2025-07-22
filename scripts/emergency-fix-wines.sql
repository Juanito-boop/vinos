-- SOLUCIÓN DE EMERGENCIA para problemas con vinos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. DESHABILITAR RLS temporalmente para diagnosticar
ALTER TABLE wines DISABLE ROW LEVEL SECURITY;
ALTER TABLE wine_details DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Allow admin full access to wines" ON wines;
DROP POLICY IF EXISTS "Allow admin full access to wine_details" ON wine_details;
DROP POLICY IF EXISTS "Allow public read access to wines" ON wines;
DROP POLICY IF EXISTS "Allow public read access to wine_details" ON wine_details;
DROP POLICY IF EXISTS "Allow admin write access to wines" ON wines;
DROP POLICY IF EXISTS "Allow admin write access to wine_details" ON wine_details;
DROP POLICY IF EXISTS "Allow anonymous read access to wines" ON wines;
DROP POLICY IF EXISTS "Allow authenticated users to manage wines" ON wines;

-- 3. Verificar que las tablas tienen datos
SELECT 'Wines count:' as info, COUNT(*) as count FROM wines
UNION ALL
SELECT 'Wine details count:', COUNT(*) FROM wine_details;

-- 4. Probar acceso directo
SELECT id_vino, nombre, precio FROM wines LIMIT 3;

-- 5. Si todo funciona, habilitar RLS con políticas simples
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_details ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas básicas que permitan acceso público
CREATE POLICY "Enable read access for all users" ON wines
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON wine_details
FOR SELECT USING (true);

-- 7. Verificar que las políticas se crearon
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('wines', 'wine_details')
ORDER BY tablename, policyname;

-- 8. Probar acceso con RLS habilitado
SELECT COUNT(*) as wines_accessible FROM wines; 