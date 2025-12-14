# Supabase Migrations - Core de Femme

## Orden de ejecución

Ejecuta estos archivos SQL en Supabase SQL Editor en el siguiente orden:

1. **001_schema.sql** - Crea las tablas y estructura base
2. **002_rls_policies.sql** - Configura Row Level Security
3. **003_storage.sql** - Políticas para Storage (ver nota abajo)
4. **004_seed_data.sql** - Datos iniciales (categorías y artículo de ejemplo)

## Antes de ejecutar 003_storage.sql

Debes crear el bucket manualmente:

1. Ve a **Storage** en Supabase Dashboard
2. Click en **New bucket**
3. Nombre: `articles`
4. Marca **Public bucket**
5. Click **Create bucket**
6. Luego ejecuta `003_storage.sql`

## Crear usuario admin

Después de ejecutar las migraciones, crea un usuario en Authentication:

1. Ve a **Authentication** > **Users**
2. Click en **Add user**
3. Ingresa email y contraseña
4. Este usuario podrá acceder al panel de administración
