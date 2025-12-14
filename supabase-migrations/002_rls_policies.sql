-- =====================================================
-- SUPABASE RLS POLICIES - CORE DE FEMME
-- Migración 002: Row Level Security
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================

-- Public can view all categories
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage categories
CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- ARTICLES POLICIES
-- =====================================================

-- Public can view published articles
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  TO anon
  USING (status = 'published' AND (publish_date IS NULL OR publish_date <= NOW()));

-- Authenticated can view all articles
CREATE POLICY "Authenticated can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage articles
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- ARTICLE IMAGES POLICIES
-- =====================================================

-- Public can view article images
CREATE POLICY "Public can view article images"
  ON article_images FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage article images
CREATE POLICY "Authenticated users can insert article images"
  ON article_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update article images"
  ON article_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete article images"
  ON article_images FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- ARTICLE LINKS POLICIES
-- =====================================================

-- Public can view article links
CREATE POLICY "Public can view article links"
  ON article_links FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage article links
CREATE POLICY "Authenticated users can insert article links"
  ON article_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update article links"
  ON article_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete article links"
  ON article_links FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- CONTACT MESSAGES POLICIES
-- =====================================================

-- Public can insert contact messages
CREATE POLICY "Public can insert contact messages"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can view all contact messages
CREATE POLICY "Authenticated users can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update contact messages (mark as read)
CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete contact messages
CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (true);
