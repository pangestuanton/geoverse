-- ============================================================
-- GeoVerse SQL Migration (Self-contained and complete)
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. CREATE TABLE users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  total_points INTEGER NOT NULL DEFAULT 0,
  profile_setup_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ALTER TABLE users: pastikan kolom-kolom baru ada untuk database yang sudah ada
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


-- 2. CREATE TABLE green_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.green_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action_date TEXT NOT NULL,
  action_type TEXT NOT NULL,
  waste_category TEXT NOT NULL,
  estimated_kg NUMERIC NOT NULL,
  location TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ALTER TABLE green_logs: pastikan kolom review ada
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


-- 6. CREATE TABLE user_badges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked BOOLEAN NOT NULL DEFAULT true,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by TEXT,
  awarded_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ALTER TABLE user_badges: pastikan kolom baru ada
ALTER TABLE public.user_badges
  ADD COLUMN IF NOT EXISTS awarded_by TEXT,
  ADD COLUMN IF NOT EXISTS awarded_note TEXT;

-- Cegah badge duplikat pada user yang sama
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_unique_idx
  ON public.user_badges(user_id, badge_id);


-- 7. CREATE TABLE user_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_progress_unique_idx UNIQUE (user_id, module_id)
);


-- 8. CREATE TABLE dashboard_config
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


-- 9. Seed badge default dari data static
-- ============================================================
INSERT INTO public.badges (slug, name, description, icon, category, is_active)
VALUES
  ('pemula-hijau', 'Pemula Hijau', 'Langkah pertamamu dalam aksi lingkungan.', '🌱', 'green-log', true),
  ('sahabat-geothermal', 'Sahabat Geothermal', 'Kamu sudah memahami dasar-dasar energi panas bumi.', '🌋', 'modul', true),
  ('pejuang-pilah-sampah', 'Pejuang Pilah Sampah', 'Lima kali mencatat aksi pilah sampah.', '♻️', 'green-log', true),
  ('konsisten-7-hari', 'Konsisten 7 Hari', 'Tujuh hari berturut-turut mencatat aksi hijau.', '🔥', 'konsistensi', true),
  ('penggerak-komunitas', 'Penggerak Komunitas', 'Kamu sudah menyelesaikan tantangan komunitas.', '🤝', 'tantangan', true)
ON CONFLICT (slug) DO NOTHING;

UPDATE public.badges
SET icon = CASE slug
  WHEN 'pemula-hijau' THEN U&'\+01F331'
  WHEN 'sahabat-geothermal' THEN U&'\+01F30B'
  WHEN 'pejuang-pilah-sampah' THEN U&'\267B\FE0F'
  WHEN 'konsisten-7-hari' THEN U&'\+01F525'
  WHEN 'penggerak-komunitas' THEN U&'\+01F91D'
  ELSE icon
END
WHERE slug IN (
  'pemula-hijau',
  'sahabat-geothermal',
  'pejuang-pilah-sampah',
  'konsisten-7-hari',
  'penggerak-komunitas'
);


-- 10. Row Level Security (RLS) Policies
-- ============================================================

-- users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (uid::text = auth.uid()::text);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (uid::text = auth.uid()::text);
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (uid::text = auth.uid()::text);

-- users admin policies
CREATE POLICY "users_admin_select" ON public.users
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );
CREATE POLICY "users_admin_update" ON public.users
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- green_logs: user hanya bisa baca miliknya sendiri, admin bisa semua
ALTER TABLE public.green_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "greenlogs_user_select" ON public.green_logs;
DROP POLICY IF EXISTS "greenlogs_user_insert" ON public.green_logs;
DROP POLICY IF EXISTS "greenlogs_admin_select" ON public.green_logs;
DROP POLICY IF EXISTS "greenlogs_admin_update" ON public.green_logs;

CREATE POLICY "greenlogs_user_select" ON public.green_logs
  FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "greenlogs_user_insert" ON public.green_logs
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- green_logs admin policies
CREATE POLICY "greenlogs_admin_select" ON public.green_logs
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );
CREATE POLICY "greenlogs_admin_update" ON public.green_logs
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- modules: semua user bisa baca yang published, admin bisa semua
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "modules_select_published" ON public.modules;
DROP POLICY IF EXISTS "modules_admin_all" ON public.modules;

CREATE POLICY "modules_select_published" ON public.modules
  FOR SELECT USING (status = 'published');
CREATE POLICY "modules_admin_all" ON public.modules
  FOR ALL USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- quiz_questions: semua user bisa baca yang aktif, admin bisa semua
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "quiz_select_active" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_admin_all" ON public.quiz_questions;

CREATE POLICY "quiz_select_active" ON public.quiz_questions
  FOR SELECT USING (is_deleted = false);
CREATE POLICY "quiz_admin_all" ON public.quiz_questions
  FOR ALL USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- badges: semua user bisa baca yang aktif, admin bisa semua
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_select_active" ON public.badges;
DROP POLICY IF EXISTS "badges_admin_all" ON public.badges;

CREATE POLICY "badges_select_active" ON public.badges
  FOR SELECT USING (is_active = true);
CREATE POLICY "badges_admin_all" ON public.badges
  FOR ALL USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- user_badges: user hanya bisa baca miliknya, admin bisa semua
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_badges_select" ON public.user_badges;
DROP POLICY IF EXISTS "user_badges_admin_select" ON public.user_badges;

CREATE POLICY "user_badges_select" ON public.user_badges
  FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "user_badges_admin_select" ON public.user_badges
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- user_progress: user hanya bisa akses miliknya sendiri, admin bisa select semua
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_admin_select" ON public.user_progress;

CREATE POLICY "user_progress_select_own" ON public.user_progress
  FOR SELECT USING (user_id::text = auth.uid()::text);
CREATE POLICY "user_progress_insert_own" ON public.user_progress
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "user_progress_update_own" ON public.user_progress
  FOR UPDATE USING (user_id::text = auth.uid()::text);
CREATE POLICY "user_progress_admin_select" ON public.user_progress
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );


-- dashboard_config: semua user bisa baca yang aktif, admin bisa semua
ALTER TABLE public.dashboard_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dashboard_config_select" ON public.dashboard_config;
DROP POLICY IF EXISTS "dashboard_config_admin_all" ON public.dashboard_config;

CREATE POLICY "dashboard_config_select" ON public.dashboard_config
  FOR SELECT USING (is_active = true);
CREATE POLICY "dashboard_config_admin_all" ON public.dashboard_config
  FOR ALL USING (
    (SELECT role FROM public.users WHERE uid::text = auth.uid()::text) = 'admin'
  );
