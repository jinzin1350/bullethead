-- ═══════════════════════════════════════════════
--  BulletHead — Supabase Schema
--  اجرا کن توی: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════

-- ── ۱. جدول نسخه‌های بازی ──
CREATE TABLE IF NOT EXISTS game_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,
  game_title    TEXT NOT NULL DEFAULT 'BulletHead',
  hero_name     TEXT NOT NULL DEFAULT 'Hero',
  hero_color    TEXT NOT NULL DEFAULT '#e82020',
  enemy_names   JSONB NOT NULL DEFAULT '{"drone":"Drone","bomber":"Bomber","speeder":"Speeder"}',
  gun_names     JSONB NOT NULL DEFAULT '{"pistol":"Pistol","smg":"SMG","shotgun":"Shotgun","sniper":"Sniper","rocket":"Rocket"}',
  msg_start     TEXT NOT NULL DEFAULT 'Good luck!',
  msg_gameover  TEXT NOT NULL DEFAULT 'Game Over!',
  color_theme   TEXT NOT NULL DEFAULT 'default',
  play_count    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ۲. جدول امتیازات ──
CREATE TABLE IF NOT EXISTS scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_slug     TEXT NOT NULL REFERENCES game_configs(slug) ON DELETE CASCADE,
  player_name   TEXT NOT NULL,
  score         INT NOT NULL DEFAULT 0,
  wave          INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ۳. ایندکس‌ها برای سرعت ──
CREATE INDEX IF NOT EXISTS idx_game_configs_slug    ON game_configs(slug);
CREATE INDEX IF NOT EXISTS idx_game_configs_user_id ON game_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_game_slug     ON scores(game_slug);
CREATE INDEX IF NOT EXISTS idx_scores_score         ON scores(score DESC);

-- ── ۴. RLS (Row Level Security) ──
ALTER TABLE game_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores       ENABLE ROW LEVEL SECURITY;

-- game_configs: فقط owner می‌تونه بسازه/ویرایش کنه، همه می‌تونن بخونن
CREATE POLICY "anyone can read game_configs"
  ON game_configs FOR SELECT
  USING (true);

CREATE POLICY "owner can insert game_configs"
  ON game_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner can update game_configs"
  ON game_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "owner can delete game_configs"
  ON game_configs FOR DELETE
  USING (auth.uid() = user_id);

-- scores: همه می‌تونن بخونن و insert کنن (بازیکنای anonymous)
CREATE POLICY "anyone can read scores"
  ON scores FOR SELECT
  USING (true);

CREATE POLICY "anyone can insert scores"
  ON scores FOR INSERT
  WITH CHECK (true);

-- ── ۵. تابع افزایش play_count ──
CREATE OR REPLACE FUNCTION increment_play_count(p_slug TEXT)
RETURNS VOID AS $$
  UPDATE game_configs SET play_count = play_count + 1 WHERE slug = p_slug;
$$ LANGUAGE SQL SECURITY DEFINER;
