-- =============================================
-- SISTEMA DE AUTENTICACIÓN DE CLIENTES - CORE DE FEMME
-- =============================================
-- Ejecutar en Supabase SQL Editor
-- Sistema de registro/login para clientes con perfil, reservas y pagos

-- =============================================
-- 1. TABLA DE PERFILES DE CLIENTES
-- =============================================
-- Enlazada con auth.users de Supabase Auth
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,

  -- Preferencias
  preferred_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT false,

  -- Estadísticas
  total_sessions_attended INTEGER DEFAULT 0,
  total_amount_spent DECIMAL(10,2) DEFAULT 0,

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- =============================================
-- 2. MODIFICAR RESERVACIONES PARA ENLAZAR CON USUARIOS
-- =============================================
-- Añadir columna user_id a reservations si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reservations ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Índice para buscar reservaciones por usuario
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);

-- =============================================
-- 3. MODIFICAR CUSTOMER_PACKS PARA ENLAZAR CON USUARIOS
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customer_packs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE customer_packs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_customer_packs_user ON customer_packs(user_id);

-- =============================================
-- 4. TABLA DE HISTORIAL DE PAGOS
-- =============================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,

  -- Stripe info
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,

  -- Detalles del pago
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'chf',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',

  -- Producto
  product_type TEXT CHECK (product_type IN ('single', 'pack')) NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT,

  -- Referencias
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  pack_id UUID REFERENCES customer_packs(id) ON DELETE SET NULL,

  -- Metadatos
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_email ON payment_history(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe ON payment_history(stripe_payment_intent_id);

-- =============================================
-- 5. TABLA DE NOTIFICACIONES DEL USUARIO
-- =============================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'reservation', 'payment', 'queue')) DEFAULT 'info',

  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Referencias opcionales
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- =============================================
-- 6. CONSTRAINT ÚNICO PARA SESIONES (evitar duplicados)
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_session_per_service_date_time'
  ) THEN
    ALTER TABLE sessions
    ADD CONSTRAINT unique_session_per_service_date_time
    UNIQUE (service_id, session_date, start_time);
  END IF;
EXCEPTION WHEN duplicate_table THEN
  -- El constraint ya existe
  NULL;
END $$;

-- =============================================
-- 7. FUNCIONES PARA GESTIÓN DE COLA Y CANCELACIONES
-- =============================================

-- Función para cancelar reservación (con lógica de reembolso y cola)
CREATE OR REPLACE FUNCTION cancel_reservation(
  p_reservation_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_reservation RECORD;
  v_session RECORD;
  v_hours_until_session INTEGER;
  v_can_cancel BOOLEAN;
  v_refund_eligible BOOLEAN;
  v_next_in_queue RECORD;
BEGIN
  -- Obtener la reservación
  SELECT r.*, s.session_date, s.start_time
  INTO v_reservation
  FROM reservations r
  JOIN sessions s ON r.session_id = s.id
  WHERE r.id = p_reservation_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  -- Verificar que pertenece al usuario (si se proporciona user_id)
  IF p_user_id IS NOT NULL AND v_reservation.user_id != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Verificar que no está ya cancelada
  IF v_reservation.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already cancelled');
  END IF;

  -- Calcular horas hasta la sesión
  v_hours_until_session := EXTRACT(EPOCH FROM (
    (v_reservation.session_date + v_reservation.start_time) - NOW()
  )) / 3600;

  -- Puede cancelar si faltan más de 24 horas
  v_can_cancel := v_hours_until_session > 24;
  v_refund_eligible := v_can_cancel AND v_reservation.payment_status = 'paid';

  -- Actualizar reservación
  UPDATE reservations
  SET status = 'cancelled',
      cancelled_at = NOW(),
      notes = COALESCE(notes || ' | ', '') || 'Cancelled by user: ' || COALESCE(p_reason, 'No reason provided'),
      updated_at = NOW()
  WHERE id = p_reservation_id;

  -- Si estaba en cola, reordenar
  IF v_reservation.queue_position IS NOT NULL THEN
    UPDATE reservations
    SET queue_position = queue_position - 1
    WHERE session_id = v_reservation.session_id
      AND queue_position > v_reservation.queue_position;
  END IF;

  -- Notificar al usuario
  INSERT INTO user_notifications (user_id, title, message, type, reservation_id)
  VALUES (
    v_reservation.user_id,
    'Réservation annulée',
    CASE
      WHEN v_refund_eligible THEN 'Votre réservation a été annulée. Un remboursement sera traité.'
      WHEN NOT v_can_cancel THEN 'Votre réservation a été annulée. Aucun remboursement (moins de 24h avant).'
      ELSE 'Votre réservation a été annulée.'
    END,
    'reservation',
    p_reservation_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'refund_eligible', v_refund_eligible,
    'hours_until_session', v_hours_until_session,
    'message', CASE
      WHEN v_refund_eligible THEN 'Cancellation successful. Refund will be processed.'
      WHEN NOT v_can_cancel THEN 'Cancellation successful. No refund (less than 24h notice).'
      ELSE 'Cancellation successful.'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener posición en cola
CREATE OR REPLACE FUNCTION get_queue_position(p_reservation_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_position INTEGER;
BEGIN
  SELECT queue_position INTO v_position
  FROM reservations
  WHERE id = p_reservation_id;

  RETURN v_position;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Función para actualizar last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. RLS POLICIES PARA NUEVAS TABLAS
-- =============================================

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Customer Profiles: usuarios pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Payment History: usuarios pueden ver su propio historial
CREATE POLICY "Users can view own payments" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications: usuarios pueden ver/actualizar sus propias notificaciones
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Reservations: usuarios pueden ver sus propias reservaciones
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- Customer Packs: usuarios pueden ver sus propios packs
CREATE POLICY "Users can view own packs" ON customer_packs
  FOR SELECT USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Service role tiene acceso total
CREATE POLICY "Service role full access profiles" ON customer_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payments" ON payment_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access notifications" ON user_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 9. HABILITAR REALTIME PARA NOTIFICACIONES
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- =============================================
-- 10. VISTA PARA DASHBOARD DEL CLIENTE
-- =============================================
CREATE OR REPLACE VIEW customer_dashboard AS
SELECT
  cp.id as user_id,
  cp.email,
  cp.full_name,
  cp.phone,
  cp.total_sessions_attended,
  cp.total_amount_spent,
  (SELECT COUNT(*) FROM reservations r WHERE r.user_id = cp.id AND r.status IN ('pending', 'confirmed')) as upcoming_reservations,
  (SELECT COUNT(*) FROM customer_packs pk WHERE pk.user_id = cp.id AND pk.status = 'active') as active_packs,
  (SELECT SUM(remaining_sessions) FROM customer_packs pk WHERE pk.user_id = cp.id AND pk.status = 'active') as remaining_pack_sessions,
  (SELECT COUNT(*) FROM user_notifications n WHERE n.user_id = cp.id AND n.is_read = false) as unread_notifications
FROM customer_profiles cp;
