-- =============================================
-- ACTUALIZACIÓN DE PRECIOS - CORE DE FEMME
-- =============================================
-- Ejecutar este script en Supabase SQL Editor
--
-- Nuevos precios:
-- - Sesión de prueba: GRATIS (0 CHF)
-- - Pack 6 sesiones (grupo): 99 CHF (oferta lanzamiento), después 120 CHF
-- - Pack 6 sesiones (domicilio): 199 CHF (oferta), después 240 CHF

-- Actualizar precios de servicios
UPDATE services
SET
  price = 0,
  price_pack = 99,
  updated_at = NOW()
WHERE slug IN ('core-de-maman', 'sculpt-pilates');

UPDATE services
SET
  price = 0,
  price_pack = 199,
  updated_at = NOW()
WHERE slug = 'cours-domicile';

-- Verificar cambios
SELECT slug, name, price, price_pack FROM services;
