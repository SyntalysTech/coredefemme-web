-- =============================================
-- FIX: TRIGGER PARA CREAR PERFIL DE CLIENTE
-- =============================================
-- El trigger handle_new_user() fallaba porque no tenía permiso INSERT
-- en customer_profiles debido a RLS

-- Opción 1: Agregar política de INSERT para el trigger
-- El trigger usa SECURITY DEFINER pero RLS puede bloquearlo

-- Primero, eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Service role full access profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON customer_profiles;

-- Recrear política de service role con todos los permisos
CREATE POLICY "Service role full access profiles" ON customer_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Política para permitir INSERT durante registro (el trigger se ejecuta como el usuario)
CREATE POLICY "Allow insert for new users" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Opción 2: Recrear la función con SET search_path y verificación de errores
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO customer_profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail user creation
  RAISE WARNING 'Error creating customer profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurarse de que el trigger está correctamente configurado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Verificar que la función tiene los permisos correctos
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;

-- Asegurarse de que service_role puede insertar en customer_profiles
GRANT INSERT, SELECT, UPDATE ON customer_profiles TO service_role;
GRANT INSERT ON customer_profiles TO authenticated;
