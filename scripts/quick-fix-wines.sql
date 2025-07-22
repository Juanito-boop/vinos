-- Solución rápida para el acceso a vinos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Allow admin full access to wines" ON wines;
DROP POLICY IF EXISTS "Allow admin full access to wine_details" ON wine_details;

-- 2. Crear política simple para acceso público a vinos
CREATE POLICY "Allow public read access to wines" ON wines
FOR SELECT USING (true);

-- 3. Crear política simple para acceso público a wine_details
CREATE POLICY "Allow public read access to wine_details" ON wine_details
FOR SELECT USING (true);

-- 4. Verificar que funciona
SELECT COUNT(*) as total_wines FROM wines; 