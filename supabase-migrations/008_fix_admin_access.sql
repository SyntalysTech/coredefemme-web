-- =============================================
-- FIX: POLÍTICAS RLS PARA ACCESO ADMIN
-- =============================================
-- El admin (usuario sin customer_profile) necesita ver:
-- - customer_profiles (para ver clientes)
-- - customer_packs (para ver packs)
-- - reservations (ya corregido)

-- =============================================
-- 1. CUSTOMER_PROFILES - Admin puede ver todos los perfiles
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON customer_profiles;
DROP POLICY IF EXISTS "Allow insert for new users" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

-- Usuarios ven su propio perfil
CREATE POLICY "Users can view own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuarios actualizan su propio perfil
CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- INSERT para nuevos usuarios (trigger)
CREATE POLICY "Allow insert for new users" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin (usuario sin customer_profile) puede ver todos
CREATE POLICY "Admins can view all profiles" ON customer_profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM customer_profiles WHERE id = auth.uid()
    )
  );

-- Service role acceso total
CREATE POLICY "Service role full access profiles" ON customer_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 2. CUSTOMER_PACKS - Admin puede ver todos los packs
-- =============================================
DROP POLICY IF EXISTS "Users and admins can view packs" ON customer_packs;
DROP POLICY IF EXISTS "Users can view own packs" ON customer_packs;
DROP POLICY IF EXISTS "Admins can view all packs" ON customer_packs;
DROP POLICY IF EXISTS "Service role full access packs" ON customer_packs;

-- Usuarios ven sus propios packs
CREATE POLICY "Users can view own packs" ON customer_packs
  FOR SELECT USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admin (usuario sin customer_profile) puede ver todos
CREATE POLICY "Admins can view all packs" ON customer_packs
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM customer_profiles WHERE id = auth.uid()
    )
  );

-- Admin puede actualizar packs
CREATE POLICY "Admins can update packs" ON customer_packs
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM customer_profiles WHERE id = auth.uid()
    )
  );

-- Service role acceso total
CREATE POLICY "Service role full access packs" ON customer_packs
  FOR ALL USING (auth.role() = 'service_role');

-- Anon puede insertar (para compras de Stripe webhook)
CREATE POLICY "Service can insert packs" ON customer_packs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. CONTACTS - Admin puede ver todos los mensajes
-- =============================================
DROP POLICY IF EXISTS "Admins can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;

-- Cualquiera puede enviar mensaje de contacto
CREATE POLICY "Anyone can insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Admin puede ver todos los contactos
CREATE POLICY "Admins can view all contacts" ON contacts
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM customer_profiles WHERE id = auth.uid()
    )
  );

-- Admin puede actualizar contactos
CREATE POLICY "Admins can update contacts" ON contacts
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM customer_profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- 4. GRANTS NECESARIOS
-- =============================================
GRANT SELECT ON customer_profiles TO authenticated;
GRANT SELECT, UPDATE ON customer_packs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON contacts TO authenticated;
GRANT INSERT ON contacts TO anon;
