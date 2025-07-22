-- Función RPC para gestión de usuarios (solo para administradores)
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear función para listar usuarios (solo para admins)
CREATE OR REPLACE FUNCTION get_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  user_metadata JSONB,
  is_admin BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      user_metadata->>'role' = 'admin' 
      OR user_metadata->>'isAdmin' = 'true'
      OR email = 'acevedojuanesteban.colombia@gmail.com'
    )
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden acceder a esta función';
  END IF;
  
  -- Retornar usuarios con información de admin
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.user_metadata,
    CASE 
      WHEN u.user_metadata->>'role' = 'admin' OR 
           u.user_metadata->>'isAdmin' = 'true' OR
           u.email = 'acevedojuanesteban.colombia@gmail.com'
      THEN true
      ELSE false
    END as is_admin
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

-- 2. Crear función para actualizar rol de usuario (solo para admins)
CREATE OR REPLACE FUNCTION update_user_role_safe(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      user_metadata->>'role' = 'admin' 
      OR user_metadata->>'isAdmin' = 'true'
      OR email = 'acevedojuanesteban.colombia@gmail.com'
    )
  ) THEN
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
  
  RETURN FOUND;
END;
$$;

-- 3. Crear función para obtener estadísticas de usuarios (solo para admins)
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users BIGINT,
  admin_users BIGINT,
  regular_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual es admin
  IF NOT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      user_metadata->>'role' = 'admin' 
      OR user_metadata->>'isAdmin' = 'true'
      OR email = 'acevedojuanesteban.colombia@gmail.com'
    )
  ) THEN
    RAISE EXCEPTION 'Solo los administradores pueden acceder a esta función';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE 
      user_metadata->>'role' = 'admin' OR 
      user_metadata->>'isAdmin' = 'true' OR
      email = 'acevedojuanesteban.colombia@gmail.com'
    ) as admin_users,
    COUNT(*) FILTER (WHERE 
      (user_metadata->>'role' IS NULL OR user_metadata->>'role' != 'admin') AND
      (user_metadata->>'isAdmin' IS NULL OR user_metadata->>'isAdmin' != 'true') AND
      email != 'acevedojuanesteban.colombia@gmail.com'
    ) as regular_users
  FROM auth.users;
END;
$$;

-- 4. Verificar que las funciones se crearon correctamente
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_users_for_admin', 'update_user_role_safe', 'get_user_stats')
AND routine_schema = 'public'
ORDER BY routine_name;

-- 5. Probar la función (solo si eres admin)
-- SELECT * FROM get_users_for_admin();
-- SELECT * FROM get_user_stats(); 