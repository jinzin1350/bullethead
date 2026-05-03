# 📋 BulletHead — Changelog
**Date: 2026-05-05**

---

## ✅ Session Summary — All Changes Made Today

---

### 🐛 Fix — Gameover Buttons Always Visible
**Commit:** `458974f`

- Buttons `GO TO SHOP` and `PLAY AGAIN` were going off-screen (button Y was ~476px, outside the 480px canvas)
- Fixed `btnY` to a safe fixed position (`374`) so both buttons always stay visible and clickable

---

### 🌐 Refactor — Dashboard Full English + Mobile Friendly
**Commit:** `78b4fb9`

- Translated all Persian/Farsi text in `dashboard.html` to English
- Made layout fully responsive:
  - 2-column grid on desktop → single column on mobile
  - Header email truncates with `text-overflow: ellipsis` instead of overflowing
  - Tabs scroll horizontally on mobile (`overflow-x: auto`, scrollbar hidden)
  - `font-size: 16px` on inputs to prevent iOS zoom
  - Preview panel moves to top on mobile (`order: -1`)
  - `grid-2` collapses to single column on small screens (`max-width: 480px`)

---

### 🐛 Fix — GO TO SHOP Button Adding Coins Every Press
**Commit:** `435a2d7`

- `goToShop()` was giving bonus coins every time it was called
- Root cause: called once on death (correct), then called again when user clicked the button on the gameover screen
- Fix: added `bonusGiven` flag — bonus is only calculated once per run
- When `state === 'gameover'`, clicking GO TO SHOP goes directly to shop with no bonus recalculation
- `bonusGiven` resets to `false` at start of each new game

---

### 🐛 Fix — Leaderboard Showing Duplicate Player Entries
**Commit:** `544aa75`

- Supabase `scores` table uses plain `INSERT` so the same player accumulated multiple rows
- `loadLeaderboard()` fetched raw top-10 rows → same player could fill multiple leaderboard slots
- Fix: fetch top 100 rows, then **client-side deduplicate** — keep only each player's best score — then sort and slice to top 10
- Also translated "در حال بارگذاری leaderboard..." → "Loading leaderboard..."

---

### ✨ Feature — Player Name Shown in HUD During Gameplay
**Commits:** `9864b14`, `4fa6b29`

- Added player name display to top-right of HUD bar during gameplay
- Shows as `👤 Ali` in cyan (`#00e5ff`) with glow effect
- Hearts shift down slightly to sit below the name
- **Bug fix (second commit):** `ctx.textBaseline` was inheriting from previous frame (often `'middle'`), causing name to render off-screen at y=14 with wrong baseline — fixed by explicitly setting `textBaseline='alphabetic'` and using y=20

---

### ✨ Feature — 8 New Playable Characters
**Commit:** `a940a60`

Added 8 new characters to the shop (4-column grid, was 3):

| Character | Cost | Special Look |
|---|---|---|
| 🧟 Zombie | 600🪙 | Green skin, red eyes, dark teeth |
| 🟩 Creeper | 700🪙 | Minecraft Creeper face (pixel eyes + mouth) |
| ⬜ Steve | 700🪙 | Minecraft Steve brown face, blue shirt |
| 🔴 Impostor | 900🪙 | Among Us egg body, cyan visor |
| 💀 Skeleton | 1000🪙 | White head, hollow eyes, teeth |
| 👽 Alien | 1500🪙 | Large black oval eyes, thin mouth |
| ⚔️ Knight | 2000🪙 | Silver helmet with visor slit |
| 🏴‍☠️ Pirate | 2500🪙 | Eyepatch on right eye |

- Added `drawCharSpecial()` function — base `drawRobloxChar` + face overlays for each special type
- Shop char grid changed from **3 columns → 4 columns** (cards 140×152px)
- Reduced character prices across the board (Warrior 500→300, Ninja 800→500, etc.)

#### 🪙 Coin Boost (same commit)
- Coins per kill: `pts/8` → **`pts/4`** (2× more)
- End-of-run score bonus: `score/80` → **`score/40`** (2× more)

---

### ✨ Feature — Outfit Tab Full Redesign (Phase 1)
**Commit:** `bdd7a77`

- Expanded color palette from **12 → 24 colors** in 4 rows with costs:
  - Row 1: Free (6 colors)
  - Row 2: 🪙150 each
  - Row 3: 🪙300 each
  - Row 4: 🪙500 each (premium)
- Added `unlockedColors` array saved in localStorage
- Locked colors show price tag — tap to buy, immediately becomes selectable
- Added `mousemove` listener for hover tracking on canvas

---

### ✨ Feature — Outfit Tab Full Redesign (Phase 2 — Final)
**Commit:** `80daa0e`

Complete overhaul of the Outfit section in the shop:

**1. All characters fully customizable**
- Removed all `ch.special` fixed-color logic
- Every character (including Zombie, Creeper, Impostor, etc.) uses the player's chosen outfit colors
- Special characters keep their unique **face overlays** (zombie red eyes, alien big eyes, knight visor, pirate eyepatch) but body/hat/shoes use player selection

**2. 4 Outfit Slots (tabs)**

| Slot | Icon | Description |
|---|---|---|
| Shirt | 👕 | Torso + arms color |
| Pants | 👖 | Legs color |
| Hat | 🎩 | Hat block color |
| Shoes | 👟 | Shoe color |

- Each slot has its own tab in the outfit panel
- `selHat` and `selShoes` added to game state + `saveAll()` + `makePlayer()`
- `drawRobloxChar()` updated to accept `shoesC` parameter

**3. Live hover preview**
- Canvas `mousemove` tracks cursor position
- Hovering over any unlocked color swatch **instantly redraws** the character preview on the left with that color applied
- Helps user see the color before committing to it

**4. Buy + apply in one tap**
- Locked colors: tap → deduct coins → unlock → immediately apply to character
- Owned colors: tap → apply to current slot

**5. `↺ RESET ALL` button**
- Resets shirt/pants/hat/shoes to defaults

---

## 📁 Files Changed Today

| File | Changes |
|---|---|
| `index.html` | Gameover fix, HUD player name, 8 new chars, outfit redesign, coin boost, leaderboard dedup |
| `dashboard.html` | Full English translation, mobile responsive layout |

---

## 🌐 Deployment
- Hosted on **Azure Static Web Apps**
- URL: `https://nice-stone-015942310.7.azurestaticapps.net`
- Backend: **Supabase** (scores, game_configs tables)
- Auto-deploys from `main` branch via GitHub Actions

---

*Generated: 2026-05-05*
