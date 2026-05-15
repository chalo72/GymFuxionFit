-- ═══════════════════════════════════════════════════════════
-- GymFuxionFit — Supabase Setup (una sola vez)
-- Pega esto en: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- 1. CREAR TABLAS (esquema JSONB universal)
CREATE TABLE IF NOT EXISTS members       (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS products      (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS transactions  (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS goals         (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS obligations   (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS staff         (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS assets        (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS catalogs      (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS configuracion (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());

-- 2. ACTIVAR RLS (Row Level Security)
ALTER TABLE members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff         ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO (acceso público con anon key)
CREATE POLICY "public_all_members"       ON members       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_products"      ON products      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_transactions"  ON transactions  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_goals"         ON goals         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_obligations"   ON obligations   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_staff"         ON staff         FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_assets"        ON assets        FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_catalogs"      ON catalogs      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_all_configuracion" ON configuracion FOR ALL TO anon USING (true) WITH CHECK (true);

-- 4. ACTIVAR REALTIME en todas las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
ALTER PUBLICATION supabase_realtime ADD TABLE obligations;
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE assets;
ALTER PUBLICATION supabase_realtime ADD TABLE catalogs;
ALTER PUBLICATION supabase_realtime ADD TABLE configuracion;

-- ✅ Listo. Para agregar un módulo nuevo en el futuro, solo ejecuta:
-- CREATE TABLE IF NOT EXISTS nueva_tabla (id TEXT PRIMARY KEY, payload JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());
-- ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public_all_nueva_tabla" ON nueva_tabla FOR ALL TO anon USING (true) WITH CHECK (true);
-- ALTER PUBLICATION supabase_realtime ADD TABLE nueva_tabla;
