-- =====================================================
-- SUPABASE SEED DATA - CORE DE FEMME
-- Migración 004: Datos Iniciales
-- =====================================================

-- =====================================================
-- CATEGORÍAS DE EJEMPLO
-- =====================================================
INSERT INTO categories (name, slug, description) VALUES
  ('Pilates', 'pilates', 'Articles sur la méthode Pilates et ses bienfaits'),
  ('Post-partum', 'post-partum', 'Conseils pour la récupération après l''accouchement'),
  ('Bien-être', 'bien-etre', 'Articles sur le bien-être général et la santé'),
  ('Conseils', 'conseils', 'Conseils pratiques pour votre quotidien');

-- =====================================================
-- ARTICLE DE BIENVENUE (Ejemplo)
-- =====================================================
INSERT INTO articles (
  title,
  slug,
  excerpt,
  content,
  category_id,
  status,
  is_featured,
  publish_date
) VALUES (
  'Bienvenue sur le blog Core de Femme',
  'bienvenue-core-de-femme',
  'Découvrez notre blog dédié au bien-être féminin, au Pilates et à la récupération post-partum.',
  '<h2>Bienvenue !</h2>
<p>Je suis ravie de vous accueillir sur le blog de Core de Femme. Ici, vous trouverez des conseils, des astuces et de l''inspiration pour prendre soin de vous.</p>

<h3>Ce que vous trouverez ici</h3>
<ul>
  <li><strong>Conseils Pilates</strong> - Des exercices et techniques pour renforcer votre corps en douceur</li>
  <li><strong>Récupération post-partum</strong> - Un accompagnement bienveillant pour les nouvelles mamans</li>
  <li><strong>Bien-être</strong> - Des articles pour nourrir votre corps et votre esprit</li>
</ul>

<p>N''hésitez pas à me contacter si vous avez des questions ou des sujets que vous aimeriez voir abordés.</p>

<p>À très bientôt,<br><em>Chloé</em></p>',
  (SELECT id FROM categories WHERE slug = 'bien-etre'),
  'published',
  true,
  NOW()
);
