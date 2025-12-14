-- =====================================================
-- SUPABASE STORAGE - CORE DE FEMME
-- Migración 003: Storage Bucket y Policies
-- =====================================================

-- NOTA: Primero debes crear el bucket manualmente en Supabase Dashboard:
-- 1. Ve a Storage > New bucket
-- 2. Nombre: "articles"
-- 3. Marca "Public bucket"
-- 4. Click "Create bucket"

-- Luego ejecuta estas políticas:

-- =====================================================
-- STORAGE POLICIES PARA BUCKET "articles"
-- =====================================================

-- Política: Cualquiera puede ver las imágenes (público)
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'articles');

-- Política: Solo usuarios autenticados pueden subir imágenes
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'articles');

-- Política: Solo usuarios autenticados pueden actualizar imágenes
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'articles');

-- Política: Solo usuarios autenticados pueden eliminar imágenes
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'articles');
