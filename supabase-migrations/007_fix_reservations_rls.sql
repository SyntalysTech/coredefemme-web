-- =============================================
-- FIX: POLÍTICAS RLS PARA RESERVACIONES
-- =============================================
-- El problema es que:
-- 1. El panel admin no puede ver reservaciones porque usa anon key y no service_role
-- 2. El panel cliente no puede ver sus reservaciones si el user_id no está establecido
-- 3. El admin necesita ver TODAS las reservaciones

-- =============================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES DE RESERVACIONES
-- =============================================
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
DROP POLICY IF EXISTS "Service role full access reservations" ON reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
DROP POLICY IF EXISTS "Public can insert reservations" ON reservations;

-- =============================================
-- 2. CREAR TABLA DE ADMINS SI NO EXISTE
-- =============================================
-- Necesitamos una manera de identificar admins
-- El admin tiene sesión en auth.users pero NO tiene customer_profile

-- =============================================
-- 3. NUEVAS POLÍTICAS MÁS PERMISIVAS
-- =============================================

-- Política para INSERT: Cualquiera puede crear reservaciones (formulario público)
CREATE POLICY "Public can insert reservations" ON reservations
  FOR INSERT WITH CHECK (true);

-- Política para SELECT:
-- - Usuarios autenticados pueden ver sus propias reservaciones (por user_id o email)
-- - Usuarios sin customer_profile (admins) pueden ver TODAS las reservaciones
CREATE POLICY "Users and admins can view reservations" ON reservations
  FOR SELECT USING (
    -- Es admin (tiene sesión pero NO tiene customer_profile)
    (
      auth.uid() IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM customer_profiles WHERE id = auth.uid()
      )
    )
    -- O es el dueño de la reservación (por user_id)
    OR auth.uid() = user_id
    -- O es el dueño de la reservación (por email)
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- O tiene service_role
    OR auth.role() = 'service_role'
  );

-- Política para UPDATE:
-- - Admins (sin customer_profile) pueden actualizar cualquier reservación
-- - Usuarios pueden actualizar solo sus propias reservaciones
CREATE POLICY "Users and admins can update reservations" ON reservations
  FOR UPDATE USING (
    -- Es admin (tiene sesión pero NO tiene customer_profile)
    (
      auth.uid() IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM customer_profiles WHERE id = auth.uid()
      )
    )
    -- O es el dueño de la reservación
    OR auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- O tiene service_role
    OR auth.role() = 'service_role'
  );

-- Política para DELETE:
-- - Solo admins y service_role pueden eliminar
CREATE POLICY "Only admins can delete reservations" ON reservations
  FOR DELETE USING (
    (
      auth.uid() IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM customer_profiles WHERE id = auth.uid()
      )
    )
    OR auth.role() = 'service_role'
  );

-- =============================================
-- 4. POLÍTICAS PARA SESSIONS (para que se vean en los JOINs)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view sessions" ON sessions;
DROP POLICY IF EXISTS "Public can view sessions" ON sessions;

CREATE POLICY "Public can view sessions" ON sessions
  FOR SELECT USING (true);

-- =============================================
-- 5. POLÍTICAS PARA SERVICES (para que se vean en los JOINs)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view services" ON services;
DROP POLICY IF EXISTS "Public can view services" ON services;

CREATE POLICY "Public can view services" ON services
  FOR SELECT USING (true);

-- =============================================
-- 6. POLÍTICAS PARA CUSTOMER_PACKS
-- =============================================
DROP POLICY IF EXISTS "Users can view own packs" ON customer_packs;
DROP POLICY IF EXISTS "Admins can view all packs" ON customer_packs;

CREATE POLICY "Users and admins can view packs" ON customer_packs
  FOR SELECT USING (
    -- Es admin
    (
      auth.uid() IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM customer_profiles WHERE id = auth.uid()
      )
    )
    -- O es el dueño del pack
    OR auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- O tiene service_role
    OR auth.role() = 'service_role'
  );

-- =============================================
-- 7. GRANT PERMISOS NECESARIOS
-- =============================================
GRANT SELECT ON reservations TO anon;
GRANT INSERT ON reservations TO anon;
GRANT SELECT, INSERT, UPDATE ON reservations TO authenticated;

GRANT SELECT ON sessions TO anon;
GRANT SELECT ON sessions TO authenticated;

GRANT SELECT ON services TO anon;
GRANT SELECT ON services TO authenticated;

GRANT SELECT ON customer_packs TO authenticated;
