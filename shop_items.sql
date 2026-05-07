-- ═══════════════════════════════════════════════
--  PlayZone Shop Items
--  Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Global items (available in all games)
INSERT INTO shop_items (game, item_key, name, description, cost, item_type, data) VALUES
  ('global', 'title_warrior',  'Warrior Title',   'Show off your warrior status', 200,  'title',  '{"icon":"⚔️","value":"Warrior"}'),
  ('global', 'title_legend',   'Legend Title',    'The ultimate title',           2000, 'title',  '{"icon":"👑","value":"Legend"}'),
  ('global', 'title_rookie',   'Rookie Title',    'Back to basics',               0,    'title',  '{"icon":"🎮","value":"Rookie"}'),
  ('global', 'badge_fire',     'Fire Badge',      'A fiery badge on your profile',300,  'badge',  '{"icon":"🔥"}'),
  ('global', 'badge_diamond',  'Diamond Badge',   'Rare diamond badge',           1000, 'badge',  '{"icon":"💎"}'),
  ('global', 'badge_star',     'Star Badge',      'You are a star!',              500,  'badge',  '{"icon":"⭐"}')
ON CONFLICT (game, item_key) DO NOTHING;

-- BulletHead items
INSERT INTO shop_items (game, item_key, name, description, cost, item_type, data) VALUES
  ('bullethead', 'skin_golden',   'Golden Skin',     'Shine bright like gold',       1200, 'skin',   '{"char":"golden"}'),
  ('bullethead', 'skin_ghost',    'Ghost Skin',      'Untouchable spectre',          1800, 'skin',   '{"char":"ghost"}'),
  ('bullethead', 'skin_knight',   'Knight Skin',     'Steel and honour',             2000, 'skin',   '{"char":"knight"}'),
  ('bullethead', 'skin_alien',    'Alien Skin',      'Not from around here',         1500, 'skin',   '{"char":"alien"}'),
  ('bullethead', 'gun_sniper',    'Sniper Unlock',   'One shot, pierces enemies',    1200, 'gun',    '{"gun":"sniper"}'),
  ('bullethead', 'gun_rocket',    'Rocket Unlock',   'AOE explosion on impact!',     2500, 'gun',    '{"gun":"rocket"}'),
  ('bullethead', 'trail_cyan',    'Cyan Trail',      'Cyan bullet trail effect',     400,  'trail',  '{"color":"#00ffff"}'),
  ('bullethead', 'trail_gold',    'Gold Trail',      'Golden bullet trail effect',   600,  'trail',  '{"color":"#ffcc00"}')
ON CONFLICT (game, item_key) DO NOTHING;

-- Contra items
INSERT INTO shop_items (game, item_key, name, description, cost, item_type, data) VALUES
  ('contra', 'skin_red',      'Red Soldier',     'Classic red uniform',          300,  'skin',   '{"color":"#cc2200"}'),
  ('contra', 'skin_blue',     'Blue Ops',        'Blue special ops uniform',     500,  'skin',   '{"color":"#0044cc"}'),
  ('contra', 'skin_gold',     'Gold Commando',   'Elite gold uniform',           1000, 'skin',   '{"color":"#cc8800"}'),
  ('contra', 'skin_black',    'Shadow Ops',      'Stealthy black uniform',       800,  'skin',   '{"color":"#222222"}'),
  ('contra', 'trail_bullet',  'Bullet Trail',    'Glowing bullet trail',         400,  'trail',  '{"color":"#ff8800"}'),
  ('contra', 'dash_effect',   'Dash Effect',     'Purple dash smoke effect',     600,  'effect', '{"color":"#cc44ff"}')
ON CONFLICT (game, item_key) DO NOTHING;
