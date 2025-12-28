-- =============================================
-- CORREGIR DURACIONES DE SERVICIOS
-- =============================================
-- Core de Maman y Sculpt Pilates: 60 minutos
-- Cours à domicile: 45 minutos

UPDATE services
SET duration_minutes = 60,
    updated_at = NOW()
WHERE slug IN ('core-de-maman', 'sculpt-pilates');

UPDATE services
SET duration_minutes = 45,
    updated_at = NOW()
WHERE slug = 'cours-domicile';

-- Actualizar también las sesiones existentes
UPDATE sessions s
SET end_time = (start_time + INTERVAL '60 minutes')::TIME
FROM services srv
WHERE s.service_id = srv.id
  AND srv.slug IN ('core-de-maman', 'sculpt-pilates');

UPDATE sessions s
SET end_time = (start_time + INTERVAL '45 minutes')::TIME
FROM services srv
WHERE s.service_id = srv.id
  AND srv.slug = 'cours-domicile';
