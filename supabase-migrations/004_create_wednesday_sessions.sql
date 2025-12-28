-- =============================================
-- CREAR SESIONES DE MIÉRCOLES - CORE DE FEMME
-- =============================================
-- Ejecutar en Supabase SQL Editor
-- Crea sesiones todos los miércoles de 9:30 a 10:30 para Core de Maman
-- Desde enero hasta junio 2026

-- Obtener el ID del servicio Core de Maman
DO $$
DECLARE
  core_maman_id UUID;
  loop_date DATE := '2026-01-01';
  final_date DATE := '2026-06-30';
BEGIN
  -- Obtener ID de Core de Maman
  SELECT id INTO core_maman_id FROM services WHERE slug = 'core-de-maman';

  -- Iterar por cada día desde enero hasta junio
  WHILE loop_date <= final_date LOOP
    -- Si es miércoles (3 = miércoles en PostgreSQL, donde 0 = domingo)
    IF EXTRACT(DOW FROM loop_date) = 3 THEN
      -- Insertar sesión si no existe
      INSERT INTO sessions (service_id, session_date, start_time, end_time, max_participants, current_participants, status)
      VALUES (core_maman_id, loop_date, '09:30:00', '10:30:00', 8, 0, 'available')
      ON CONFLICT DO NOTHING;
    END IF;

    loop_date := loop_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- Verificar sesiones creadas
SELECT
  s.session_date,
  TO_CHAR(s.session_date, 'Day') as day_name,
  s.start_time,
  s.end_time,
  s.max_participants,
  s.status,
  sv.name as service_name
FROM sessions s
JOIN services sv ON s.service_id = sv.id
WHERE sv.slug = 'core-de-maman'
ORDER BY s.session_date;
