-- Script para configurar roles de administrador en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND (
      user_metadata->>'role' = 'admin' 
      OR user_metadata->>'isAdmin' = 'true'
      OR email = 'acevedojuanesteban.colombia@gmail.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear políticas RLS que usen la función is_admin
-- Para la tabla wines (si no existe ya)
CREATE POLICY "Allow admin full access to wines" ON wines
FOR ALL USING (is_admin(auth.uid()));

-- Para la tabla wine_details (si no existe ya)
CREATE POLICY "Allow admin full access to wine_details" ON wine_details
FOR ALL USING (is_admin(auth.uid()));

-- 3. Crear función para actualizar roles (solo para admins)
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo los administradores pueden actualizar roles';
  END IF;
  
  -- Actualizar el rol del usuario objetivo
  UPDATE auth.users 
  SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'::jsonb),
    '{role}',
    to_jsonb(new_role)
  )
  WHERE id = target_user_id;
  
  -- También actualizar isAdmin
  UPDATE auth.users 
  SET user_metadata = jsonb_set(
    COALESCE(user_metadata, '{}'::jsonb),
    '{isAdmin}',
    to_jsonb(new_role = 'admin')
  )
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear función para listar usuarios (solo para admins)
CREATE OR REPLACE FUNCTION list_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  user_metadata JSONB
) AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Solo los administradores pueden listar usuarios';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.user_metadata
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Configurar el primer administrador (reemplaza con tu email)
-- Ejecuta esto manualmente en el SQL Editor:
/*
UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'acevedojuanesteban.colombia@gmail.com';

UPDATE auth.users 
SET user_metadata = jsonb_set(
  COALESCE(user_metadata, '{}'::jsonb),
  '{isAdmin}',
  'true'
)
WHERE email = 'acevedojuanesteban.colombia@gmail.com';
*/

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_metadata_role ON auth.users USING GIN ((user_metadata->>'role'));

-- 7. Comentarios sobre uso
COMMENT ON FUNCTION is_admin(UUID) IS 'Verifica si un usuario es administrador';
COMMENT ON FUNCTION update_user_role(UUID, TEXT) IS 'Actualiza el rol de un usuario (solo admins)';
COMMENT ON FUNCTION list_users_for_admin() IS 'Lista usuarios para administradores';

-- 8. Verificar configuración
SELECT 
  'Configuración de roles completada' as status,
  'Ejecuta el UPDATE manual para configurar el primer admin' as next_step; 