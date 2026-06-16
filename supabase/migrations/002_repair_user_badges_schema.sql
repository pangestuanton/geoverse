-- ============================================================
-- Repair legacy user_badges schema drift
-- ============================================================
-- Some deployed databases created user_badges without id/created_at
-- and stored badge slugs in badge_id before badges became DB rows.
-- This migration normalizes old rows and restores the intended FK shape.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.user_badges
  ADD COLUMN IF NOT EXISTS id UUID,
  ADD COLUMN IF NOT EXISTS awarded_by TEXT,
  ADD COLUMN IF NOT EXISTS awarded_note TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.user_badges
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE public.user_badges
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL;

-- Convert legacy badge slugs to their DB badge UUID text before changing type.
DO $$
DECLARE
  badge_id_type TEXT;
BEGIN
  SELECT data_type
  INTO badge_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'user_badges'
    AND column_name = 'badge_id';

  IF badge_id_type IS DISTINCT FROM 'uuid' THEN
    UPDATE public.user_badges AS ub
    SET badge_id = b.id::text
    FROM public.badges AS b
    WHERE ub.badge_id::text = b.slug;

    IF EXISTS (
      SELECT 1
      FROM public.user_badges
      WHERE badge_id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ) THEN
      RAISE EXCEPTION 'Cannot convert user_badges.badge_id to UUID: unresolved legacy badge_id values remain.';
    END IF;

    ALTER TABLE public.user_badges
      ALTER COLUMN badge_id TYPE UUID USING badge_id::uuid;
  END IF;
END $$;

-- Keep the newest unlock if duplicate rows exist after slug normalization.
WITH ranked AS (
  SELECT
    ctid,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, badge_id
      ORDER BY unlocked_at DESC NULLS LAST
    ) AS row_number
  FROM public.user_badges
)
DELETE FROM public.user_badges AS ub
USING ranked
WHERE ub.ctid = ranked.ctid
  AND ranked.row_number > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.user_badges'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.user_badges
      ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.user_badges'::regclass
      AND conname = 'user_badges_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_badges
      ADD CONSTRAINT user_badges_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.user_badges'::regclass
      AND conname = 'user_badges_badge_id_fkey'
  ) THEN
    ALTER TABLE public.user_badges
      ADD CONSTRAINT user_badges_badge_id_fkey
      FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS user_badges_unique_idx
  ON public.user_badges(user_id, badge_id);

COMMIT;
