-- =====================================================
-- SUPABASE SCHEMA - CORE DE FEMME
-- Migración 001: Schema Principal
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================
CREATE TYPE article_status AS ENUM ('draft', 'published');

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ARTICLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  featured_image TEXT,
  status article_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

-- Index for faster queries
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_publish_date ON articles(publish_date DESC);
CREATE INDEX idx_articles_is_featured ON articles(is_featured);
CREATE INDEX idx_articles_slug ON articles(slug);

-- =====================================================
-- ARTICLE IMAGES TABLE (Gallery)
-- =====================================================
CREATE TABLE IF NOT EXISTS article_images (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_images_article ON article_images(article_id);

-- =====================================================
-- ARTICLE LINKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS article_links (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  link_url TEXT NOT NULL,
  link_title VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_links_article ON article_links(article_id);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to articles
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
