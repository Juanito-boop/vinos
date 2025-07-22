-- Script para corregir el error del rol "Admin"
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Eliminar las políticas problemáticas que causan el error
DROP POLICY IF EXISTS "Allow admin full access to wines" ON wines;
DROP POLICY IF EXISTS "Allow admin full access to wine_details" ON wine_details;

-- 2. Verificar que no hay políticas problemáticas
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

-- 3. Crear políticas simples que funcionen
-- Política para lectura pública de vinos
CREATE POLICY "Enable read access for all users" ON wines
FOR SELECT USING (true);

-- Política para escritura solo usuarios autenticados
CREATE POLICY "Enable insert for authenticated users only" ON wines
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON wines
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON wines
FOR DELETE TO authenticated USING (true);

-- 4. Políticas para wine_details
CREATE POLICY "Enable read access for all users" ON wine_details
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON wine_details
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON wine_details
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON wine_details
FOR DELETE TO authenticated USING (true);

-- 5. Verificar que RLS esté habilitado
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_details ENABLE ROW LEVEL SECURITY;

-- 6. Probar acceso público
SELECT COUNT(*) as total_wines_accessible FROM wines;

-- 7. Verificar las políticas finales
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('wines', 'wine_details')
ORDER BY tablename, policyname; 