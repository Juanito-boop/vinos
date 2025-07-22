-- Políticas RLS para la tabla wines
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Eliminar políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Enable read access for all users" ON consumibles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON consumibles;
DROP POLICY IF EXISTS "Allow public read access to wines" ON consumibles;
DROP POLICY IF EXISTS "Allow admin write access to wines" ON consumibles;

-- 2. Política para LECTURA PÚBLICA (todos pueden ver vinos)
CREATE POLICY "Enable read access for all users" ON consumibles
FOR SELECT USING (true);

-- 3. Política para INSERCIÓN solo usuarios autenticados
CREATE POLICY "Enable insert for authenticated users only" ON consumibles
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 4. Política para ACTUALIZACIÓN solo usuarios autenticados
CREATE POLICY "Enable update for authenticated users only" ON consumibles
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. Política para ELIMINACIÓN solo usuarios autenticados
CREATE POLICY "Enable delete for authenticated users only" ON consumibles
FOR DELETE 
TO authenticated 
USING (true);

-- 6. Políticas para wine_details (misma lógica)
DROP POLICY IF EXISTS "Enable read access for all users" ON wine_details;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON wine_details;

CREATE POLICY "Enable read access for all users" ON wine_details
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON wine_details
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON wine_details
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON wine_details
FOR DELETE 
TO authenticated 
USING (true);

-- 7. Verificar que RLS esté habilitado
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumibles ENABLE ROW LEVEL SECURITY;

-- 8. Verificar las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('wines', 'wine_details', 'consumibles')
ORDER BY tablename, policyname;

-- 9. Probar acceso público (debería funcionar)
SELECT COUNT(*) as total_wines_public FROM wines;

-- 10. Verificar que el usuario anónimo tiene permisos de lectura
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('wines', 'wine_details', 'consumibles')
AND grantee = 'anon'; 