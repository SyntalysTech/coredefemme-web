-- =============================================
-- SISTEMA DE RESERVACIONES - CORE DE FEMME
-- =============================================

-- Tabla de servicios/cursos disponibles
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 45,
  price DECIMAL(10,2) NOT NULL,
  price_pack DECIMAL(10,2), -- precio de pack (ej: 6 sesiones)
  pack_sessions INTEGER, -- número de sesiones en pack
  max_participants INTEGER DEFAULT 8,
  service_type TEXT CHECK (service_type IN ('group', 'private', 'home')) DEFAULT 'group',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de horarios disponibles
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes...
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones específicas (instancias de horarios)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('available', 'full', 'cancelled', 'completed')) DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla principal de reservaciones
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number TEXT UNIQUE NOT NULL, -- CDM-2024-001
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Datos del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_message TEXT,

  -- Estado de la reserva
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',

  -- Cola de espera
  queue_position INTEGER, -- NULL si está confirmado, número si está en cola

  -- Pagos (preparado para Stripe)
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')) DEFAULT 'pending',
  payment_intent_id TEXT, -- Stripe payment intent
  amount_paid DECIMAL(10,2),

  -- Tipo de reserva
  reservation_type TEXT CHECK (reservation_type IN ('single', 'pack')) DEFAULT 'single',
  pack_id UUID, -- referencia a un pack comprado

  -- Metadatos
  source TEXT DEFAULT 'website', -- website, admin, phone
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Tabla de packs comprados
CREATE TABLE IF NOT EXISTS customer_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER DEFAULT 0,
  remaining_sessions INTEGER GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
  amount_paid DECIMAL(10,2),
  payment_intent_id TEXT,
  status TEXT CHECK (status IN ('active', 'exhausted', 'expired', 'refunded')) DEFAULT 'active',
  expires_at TIMESTAMPTZ, -- fecha de expiración del pack
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de contactos (formulario de contacto)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
  replied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de notificaciones/emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL, -- confirmation, reminder, cancellation, contact_reply, etc.
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced')) DEFAULT 'sent',
  resend_id TEXT, -- ID de Resend
  related_id UUID, -- ID de reservación, contacto, etc.
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_reservations_session ON reservations(session_id);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_service ON sessions(service_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_customer_packs_email ON customer_packs(customer_email);

-- Función para generar número de reservación
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reservation_number FROM 'CDM-' || year_part || '-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM reservations
  WHERE reservation_number LIKE 'CDM-' || year_part || '-%';

  NEW.reservation_number := 'CDM-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar número de reservación
DROP TRIGGER IF EXISTS trigger_generate_reservation_number ON reservations;
CREATE TRIGGER trigger_generate_reservation_number
  BEFORE INSERT ON reservations
  FOR EACH ROW
  WHEN (NEW.reservation_number IS NULL)
  EXECUTE FUNCTION generate_reservation_number();

-- Función para actualizar contador de participantes en sesión
CREATE OR REPLACE FUNCTION update_session_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('pending', 'confirmed') THEN
    UPDATE sessions
    SET current_participants = current_participants + 1,
        status = CASE
          WHEN current_participants + 1 >= max_participants THEN 'full'
          ELSE status
        END
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si cambia de confirmado a cancelado
    IF OLD.status IN ('pending', 'confirmed') AND NEW.status IN ('cancelled', 'no_show') THEN
      UPDATE sessions
      SET current_participants = GREATEST(current_participants - 1, 0),
          status = CASE
            WHEN status = 'full' AND current_participants - 1 < max_participants THEN 'available'
            ELSE status
          END
      WHERE id = NEW.session_id;
    -- Si cambia de cancelado a confirmado
    ELSIF OLD.status IN ('cancelled', 'no_show') AND NEW.status IN ('pending', 'confirmed') THEN
      UPDATE sessions
      SET current_participants = current_participants + 1,
          status = CASE
            WHEN current_participants + 1 >= max_participants THEN 'full'
            ELSE status
          END
      WHERE id = NEW.session_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('pending', 'confirmed') THEN
    UPDATE sessions
    SET current_participants = GREATEST(current_participants - 1, 0),
        status = CASE
          WHEN status = 'full' AND current_participants - 1 < max_participants THEN 'available'
          ELSE status
        END
    WHERE id = OLD.session_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar participantes
DROP TRIGGER IF EXISTS trigger_update_session_participants ON reservations;
CREATE TRIGGER trigger_update_session_participants
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participants();

-- Función para manejar cola de espera
CREATE OR REPLACE FUNCTION manage_waiting_queue()
RETURNS TRIGGER AS $$
DECLARE
  next_in_queue RECORD;
BEGIN
  -- Cuando una reservación se cancela, promover al siguiente en cola
  IF NEW.status IN ('cancelled', 'no_show') AND OLD.status IN ('pending', 'confirmed') THEN
    SELECT * INTO next_in_queue
    FROM reservations
    WHERE session_id = NEW.session_id
      AND queue_position IS NOT NULL
      AND status = 'pending'
    ORDER BY queue_position ASC
    LIMIT 1;

    IF FOUND THEN
      UPDATE reservations
      SET queue_position = NULL,
          status = 'pending'
      WHERE id = next_in_queue.id;

      -- Reordenar la cola
      UPDATE reservations
      SET queue_position = queue_position - 1
      WHERE session_id = NEW.session_id
        AND queue_position IS NOT NULL
        AND queue_position > next_in_queue.queue_position;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para cola de espera
DROP TRIGGER IF EXISTS trigger_manage_waiting_queue ON reservations;
CREATE TRIGGER trigger_manage_waiting_queue
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION manage_waiting_queue();

-- Habilitar Realtime para reservaciones (para el sistema de cola en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Insertar servicios iniciales
-- PRECIOS:
-- Core de Maman / Sculpt: Sesión prueba GRATIS (0 CHF), Pack 6 = 99 CHF (oferta) / 120 CHF (normal)
-- Domicile: Sesión = 40 CHF, Pack 6 = 180 CHF (oferta) / 220 CHF (normal)
INSERT INTO services (slug, name, description, duration_minutes, price, price_pack, pack_sessions, max_participants, service_type) VALUES
('core-de-maman', 'Core de Maman', 'Cours post-partum en petit groupe pour renforcer le périnée et retrouver un centre fort.', 45, 0, 99, 6, 8, 'group'),
('sculpt-pilates', 'Sculpt Pilates', 'Cours de renforcement Pilates dynamique pour sculpter et tonifier le corps.', 45, 0, 99, 6, 8, 'group'),
('cours-domicile', 'Cours à domicile', 'Séances privées de Pilates à votre domicile, adaptées à vos besoins.', 45, 40, 180, 6, 2, 'home')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  price_pack = EXCLUDED.price_pack,
  updated_at = NOW();

-- Insertar horarios de ejemplo (Martes y Jueves para Core de Maman, según la web)
INSERT INTO schedules (service_id, day_of_week, start_time, end_time) VALUES
((SELECT id FROM services WHERE slug = 'core-de-maman'), 2, '09:15', '10:00'), -- Martes
((SELECT id FROM services WHERE slug = 'core-de-maman'), 4, '09:15', '10:00'), -- Jueves
((SELECT id FROM services WHERE slug = 'sculpt-pilates'), 2, '19:30', '20:15'), -- Martes
((SELECT id FROM services WHERE slug = 'sculpt-pilates'), 4, '19:30', '20:15')  -- Jueves
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura para servicios y sesiones disponibles
CREATE POLICY "Public can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active schedules" ON schedules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view available sessions" ON sessions
  FOR SELECT USING (status IN ('available', 'full'));

-- Políticas para insertar reservaciones y contactos (cualquiera puede crear)
CREATE POLICY "Anyone can create reservations" ON reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Los usuarios pueden ver sus propias reservaciones por email
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (true); -- Simplificado, en producción filtrar por email/auth

-- Service role tiene acceso total (para API routes)
CREATE POLICY "Service role full access services" ON services
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access schedules" ON schedules
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access sessions" ON sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access reservations" ON reservations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access packs" ON customer_packs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access contacts" ON contacts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access email_logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');
