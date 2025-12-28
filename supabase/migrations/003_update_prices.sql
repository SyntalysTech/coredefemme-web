-- =============================================
-- ACTUALIZACIÓN DE PRECIOS - CORE DE FEMME
-- =============================================
-- Ejecutar este script en Supabase SQL Editor
--
-- Precios actualizados según productos de Stripe:
-- Core de Maman / Sculpt Pilates:
--   - Sesión de prueba: GRATIS (0 CHF)
--   - Pack 6 sesiones: 99 CHF (oferta), 120 CHF (después)
--
-- Cours à domicile:
--   - Sesión individual: 40 CHF
--   - Pack 6 sesiones: 180 CHF (oferta), 220 CHF (después)

-- Actualizar precios de servicios de grupo
UPDATE services
SET
  price = 0,
  price_pack = 99,
  updated_at = NOW()
WHERE slug IN ('core-de-maman', 'sculpt-pilates');

-- Actualizar precios de servicio a domicilio
UPDATE services
SET
  price = 40,
  price_pack = 180,
  updated_at = NOW()
WHERE slug = 'cours-domicile';

-- Verificar cambios
SELECT slug, name, price, price_pack FROM services;
