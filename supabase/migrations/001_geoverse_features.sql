-- ============================================================
-- GeoVerse SQL Migration
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. ALTER TABLE users: tambah role, display_name, profile_setup_done
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin')),
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_setup_done BOOLEAN NOT NULL DEFAULT false;

-- Set admin berdasarkan email
UPDATE public.users
SET role = 'admin'
WHERE email = ANY(
  string_to_array(
    coalesce(current_setting('app.admin_emails', true), 'pangestuanton44@gmail.com'),
    ','
  )
);

-- 2. ALTER TABLE green_logs: tambah rejection_reason, reviewed_by, reviewed_at
-- ============================================================
ALTER TABLE public.green_logs
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3. CREATE TABLE modules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  category_label TEXT NOT NULL DEFAULT '',
  reading_time TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Pemula'
    CHECK (difficulty IN ('Pemula', 'Menengah', 'Lanjutan')),
  content JSONB NOT NULL DEFAULT '[]',
  key_points JSONB NOT NULL DEFAULT '[]',
  reflection TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CREATE TABLE quiz_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATE TABLE badges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🏅',
  category TEXT NOT NULL DEFAULT 'umum',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ALTER TABLE user_badges: tambah awarded_by, awarded_note
-- ============================================================
ALTER TABLE public.user_badges
  ADD COLUMN IF NOT EXISTS awarded_by TEXT,
  ADD COLUMN IF NOT EXISTS awarded_note TEXT;

-- Cegah badge duplikat pada user yang sama
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_unique_idx
  ON public.user_badges(user_id, badge_id);

-- 7. CREATE TABLE dashboard_config
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert config default
INSERT INTO public.dashboard_config (key, value, is_active)
VALUES
  ('announcement', '{"title": "", "body": "", "type": "info"}', false),
  ('featured_module_slug', '{"slug": ""}', false),
  ('show_challenges', '{"enabled": true}', true),
  ('show_leaderboard', '{"enabled": true}', true)
ON CONFLICT (key) DO NOTHING;

-- 8. Seed badge default dari data static
-- (Jalankan ini hanya sekali, setelah modul pertama kali migrasi)
-- ============================================================
INSERT INTO public.badges (slug, name, description, icon, category, is_active)
VALUES
  ('pemula-hijau', 'Pemula Hijau', 'Langkah pertamamu dalam aksi lingkungan.', '🌱', 'green-log', true),
  ('sahabat-geothermal', 'Sahabat Geothermal', 'Kamu sudah memahami dasar-dasar energi panas bumi.', '🌋', 'modul', true),
  ('pejuang-pilah-sampah', 'Pejuang Pilah Sampah', 'Lima kali mencatat aksi pilah sampah.', '♻️', 'green-log', true),
  ('konsisten-7-hari', 'Konsisten 7 Hari', 'Tujuh hari berturut-turut mencatat aksi hijau.', '🔥', 'konsistensi', true),
  ('penggerak-komunitas', 'Penggerak Komunitas', 'Kamu sudah menyelesaikan tantangan komunitas.', '🤝', 'tantangan', true)
ON CONFLICT (slug) DO NOTHING;

-- 9. RLS Policies
-- ============================================================

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (uid::text = auth.uid()::text);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (uid::text = auth.uid()::text);
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (uid::text = auth.uid()::text);

-- green_logs: user hanya bisa baca miliknya sendiri
ALTER TABLE public.green_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "greenlogs_user_select" ON public.green_logs;
DROP POLICY IF EXISTS "greenlogs_user_insert" ON public.green_logs;
CREATE POLICY "greenlogs_user_select" ON public.green_logs
  FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "greenlogs_user_insert" ON public.green_logs
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- modules: semua user bisa baca yang published
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "modules_select_published" ON public.modules;
CREATE POLICY "modules_select_published" ON public.modules
  FOR SELECT USING (status = 'published');

-- quiz_questions: semua user bisa baca yang aktif
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_select_active" ON public.quiz_questions;
CREATE POLICY "quiz_select_active" ON public.quiz_questions
  FOR SELECT USING (is_deleted = false);

-- badges: semua user bisa baca yang aktif
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_select_active" ON public.badges;
CREATE POLICY "badges_select_active" ON public.badges
  FOR SELECT USING (is_active = true);

-- user_badges: user hanya bisa baca miliknya
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_badges_select" ON public.user_badges;
CREATE POLICY "user_badges_select" ON public.user_badges
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- dashboard_config: semua user bisa baca yang aktif
ALTER TABLE public.dashboard_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dashboard_config_select" ON public.dashboard_config;
CREATE POLICY "dashboard_config_select" ON public.dashboard_config
  FOR SELECT USING (is_active = true);

-- ============================================================
-- CATATAN:
-- Operasi admin (INSERT/UPDATE/DELETE di tabel yang di-RLS)
-- harus menggunakan SUPABASE_SERVICE_ROLE_KEY (bypass RLS)
-- ============================================================
