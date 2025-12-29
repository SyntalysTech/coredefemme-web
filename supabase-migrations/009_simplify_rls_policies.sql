-- =============================================
-- SIMPLIFICAR POLÍTICAS RLS
-- =============================================
-- Las políticas anteriores tenían subconsultas circulares que causaban
-- problemas. Esta migración simplifica todas las políticas.

-- =============================================
-- 1. CUSTOMER_PROFILES - Simplificar
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

-- Política simple: usuarios autenticados pueden ver todos los perfiles
-- (el admin y los clientes están autenticados)
CREATE POLICY "Authenticated can view all profiles" ON customer_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Usuarios solo actualizan su propio perfil
CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- INSERT para nuevos usuarios
CREATE POLICY "Allow insert for new users" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. CUSTOMER_PACKS - Simplificar
-- =============================================
DROP POLICY IF EXISTS "Users can view own packs" ON customer_packs;
DROP POLICY IF EXISTS "Admins can view all packs" ON customer_packs;
DROP POLICY IF EXISTS "Admins can update packs" ON customer_packs;
DROP POLICY IF EXISTS "Service role full access packs" ON customer_packs;
DROP POLICY IF EXISTS "Service can insert packs" ON customer_packs;

-- Política simple: usuarios autenticados pueden ver todos los packs
CREATE POLICY "Authenticated can view all packs" ON customer_packs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Usuarios autenticados pueden actualizar packs (admin necesita esto)
CREATE POLICY "Authenticated can update packs" ON customer_packs
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Cualquiera puede insertar packs (para Stripe webhooks)
CREATE POLICY "Anyone can insert packs" ON customer_packs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. CONTACTS - Simplificar
-- =============================================
DROP POLICY IF EXISTS "Admins can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON contacts;

-- Cualquiera puede enviar mensaje de contacto
CREATE POLICY "Anyone can insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Usuarios autenticados pueden ver contactos (admin)
CREATE POLICY "Authenticated can view contacts" ON contacts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Usuarios autenticados pueden actualizar contactos
CREATE POLICY "Authenticated can update contacts" ON contacts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =============================================
-- 4. RESERVATIONS - Asegurar que admin puede ver todo
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;

-- Política simple: usuarios autenticados pueden ver todas las reservas
CREATE POLICY "Authenticated can view all reservations" ON reservations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =============================================
-- 5. GRANTS
-- =============================================
GRANT SELECT ON customer_profiles TO authenticated;
GRANT SELECT, UPDATE ON customer_packs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contacts TO authenticated;
GRANT INSERT ON contacts TO anon;
GRANT SELECT ON reservations TO authenticated;
