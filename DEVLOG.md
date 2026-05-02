# 🎮 BulletHead — Dev Log
> مستندات کامل ساخت بازی از صفر تا نسخه موبایل

---

## 📌 نسخه ۱ — ساخت بازی پایه
**هدف:** ساخت یه بازی arcade شوتر شبیه Bullethead از سایت Poki

### چی ساخته شد:
- **Canvas 600×480** با HTML5 و Vanilla JavaScript — بدون هیچ کتابخونه‌ای
- **Player** با حرکت چپ/راست، پریدن، شلیک
- **7 پلتفرم** با چیدمان سیمتریک
- **دشمن‌ها** در ۳ نوع: Drone، Bomber (3 HP)، Speeder
- **سیستم Wave** — هر موج دشمن بیشتر و سخت‌تر
- **Power-up** دو نوع: ⚡ Rapid Fire و ✦ Triple Shot
- **سیستم زندگی** — ۳ قلب، نمایش آیکون
- **امتیاز** — هر کشته = امتیاز
- **جلوه‌های بصری** — نئون glow، ستاره‌های پس‌زمینه، انفجار particle
- **صفحه Title و Game Over**

### کنترل‌ها:
| کلید | عملکرد |
|---|---|
| ← → | حرکت |
| Z | پریدن |
| X / ↑ | شلیک |

---

## 📌 نسخه ۲ — Roblox Edition + سیستم لول
**هدف:** سبک بصری Roblox + سیستم لول بر اساس تعداد کشته

### تغییرات:
- **شخصیت Roblox-style** — سر مربع، کلاه، دست، پا، اسلحه — با `drawRobloxChar()`
- **دشمن‌ها هم Roblox noob** — هر لول رنگ متفاوت
- **پلتفرم‌های Roblox** — studs، رنگ‌های آجری، glow
- **سیستم لول:** هر ۴ کشته = لول بالاتر (ثابت)
- **HUD جدید:**
  - badge لول گوشه بالا چپ
  - نوار پیشرفت kills
  - قلب‌های رنگی برای زندگی
  - نوار power-up
- **بنر LEVEL UP!** با انیمیشن fade

---

## 📌 نسخه ۳ — سیستم لول پویا + Power-up‌های جدید + جایزه ضمانتی + ۱۰ تم
**هدف:** بازی عمیق‌تر، dopamine loop قوی‌تر

### تغییر ۱ — Kill Scaling:
- لول ۱ → ۱ کشته لازم
- لول ۲ → ۲ کشته لازم
- لول N → N کشته لازم
- counter جداگانه `killsThisLevel` که هر لول reset می‌شه

### تغییر ۲ — Power-up با فیزیک واقعی:
- gravity کامل — روی پلتفرم فرود میاد
- **۱۰ ثانیه** روی زمین می‌مونه
- نوار دایره‌ای دور آیتم نشون می‌ده چقدر وقت مونده
- آخرین ۲ ثانیه fade می‌شه

### تغییر ۳ — جایزه ضمانتی هر ۱۰ ثانیه:
- حلقه شمارش معکوس گوشه پایین راست
- وقتی پر شد → یه جایزه random کنار player ظاهر می‌شه
- بنر `🎁 BONUS REWARD!`

### تغییر ۴ — Power-up‌های جدید:
| آیکون | نوع | اثر |
|---|---|---|
| ⚡ | Rapid Fire | تیراندازی سریع |
| ✦ | Triple Shot | ۳ تیر همزمان |
| 🛡 | Shield | یه ضربه رو بلاک می‌کنه |
| 💣 | Bomb | همه دشمنا منفجر می‌شن |
| ❤ | Life +1 | یه قلب اضافه |

### تغییر ۵ — ۱۰ تم بصری (هر ۳ لول عوض می‌شه):
| # | تم | ویژگی |
|---|---|---|
| 0 | 🌿 Grass | پیش‌فرض سبز |
| 1 | ❄️ Ice | آبی یخی |
| 2 | 🔥 Lava | قرمز آتشین |
| 3 | 🌌 Space | بنفش فضایی |
| 4 | 🏜️ Desert | زرد صحرایی |
| 5 | 🌊 Ocean | آبی اعماق |
| 6 | ⚡ Electric | بنفش برقی |
| 7 | 🏰 Castle | خاکستری قلعه |
| 8 | 🌲 Forest | سبز جنگل |
| 9 | 🍬 Candy | صورتی آبنباتی |

---

## 📌 نسخه ۴ — ۱۰ چیدمان مختلف پلتفرم
**هدف:** هر ۳ لول نه فقط رنگ، بلکه **شکل** زمین هم عوض بشه

### تغییرات:
- آرایه `ALL_LAYOUTS` با ۱۰ چیدمان کاملاً متفاوت:

| # | اسم | توضیح |
|---|---|---|
| 0 | Classic | سیمتریک وسط |
| 1 | Staircase | پله‌ای چپ به راست |
| 2 | Tower | برج وسط |
| 3 | Wide Shelves | طبقات عریض |
| 4 | Scattered Islands | جزیره‌های پراکنده |
| 5 | Low + High Bridge | پل بلند بالا |
| 6 | V Shape | شکل V |
| 7 | Zigzag | زیگزاگ |
| 8 | Arena | حلقه دور تا دور |
| 9 | Floating Chaos | آشوب کامل |

- **انیمیشن transition:** پلتفرم‌های قدیمی slide پایین، جدید slide بالا (۶۰ فریم)
- هر لول که تم عوض می‌شه → layout هم عوض می‌شه

---

## 📌 نسخه ۵ — کنترل‌های WASD
**هدف:** کنترل استاندارد مثل بازی‌های مدرن

### تغییر کنترل‌ها:
| کلید قدیم | کلید جدید | عملکرد |
|---|---|---|
| ← | **A** یا ← | حرکت چپ |
| → | **D** یا → | حرکت راست |
| Z | **W** یا Space | پریدن |
| X | **S** یا **J** | شلیک |

---

## 📌 نسخه ۶ — سیستم Shop کامل
**هدف:** اقتصاد بازی، unlock، شخصی‌سازی — داده‌ها در localStorage

### سیستم Coin:
- هر کشته = سکه (بر اساس امتیاز)
- آخر بازی = bonus سکه از score
- نمایش 🪙 در HUD
- floating text `+N🪙` روی هر کشته

### ذخیره‌سازی (localStorage):
| کلید | محتوا |
|---|---|
| `bh_coins` | موجودی سکه |
| `bh_unlocks` | آرایه آیتم‌های unlock شده |
| `bh_char` | کاراکتر انتخاب‌شده |
| `bh_gun` | اسلحه انتخاب‌شده |
| `bh_shirt` | رنگ پیراهن |
| `bh_pants` | رنگ شلوار |
| `bh_best` | بهترین امتیاز |

### Shop — سه بخش:

#### 🧑 کاراکترها (۶ تا):
| نام | قیمت | ویژگی |
|---|---|---|
| Noob | رایگان | پیش‌فرض قرمز |
| Warrior | 500 🪙 | لباس سیاه جنگجو |
| Ninja | 800 🪙 | سراپا تاریک |
| Robot | 1200 🪙 | رنگ فلزی |
| Golden | 2000 🪙 | طلایی |
| Ghost | 3000 🪙 | آبی روح‌وار |

#### 🔫 اسلحه‌ها (۵ تا):
| نام | قیمت | ویژگی |
|---|---|---|
| Pistol | رایگان | استاندارد |
| SMG | 300 🪙 | آتش سریع (CD: 7) |
| Shotgun | 600 🪙 | ۴ تیر spread |
| Sniper | 1200 🪙 | سریع + pierce |
| Rocket | 2500 🪙 | انفجار AOE |

#### 👕 Outfit:
- ۱۲ رنگ برای پیراهن
- ۱۲ رنگ برای شلوار
- preview زنده کنار صفحه
- کاملاً رایگان

### ورود به Shop:
- از Title screen → دکمه 🏪 SHOP
- بعد از Game Over → خودکار

---

## 📌 نسخه ۷ — Mobile-Friendly کامل
**هدف:** بازی روی گوشی راحت و قابل بازی باشه

### Responsive Canvas:
- اندازه منطقی بازی ثابت: **620×480**
- CSS `scale` هوشمند — fit می‌شه هر صفحه‌ای
- بدون بریدگی یا کشیدگی

### دکمه‌های لمسی:
```
[◀] [▶]        [⬆]        [🔫]
چپ   راست       پرش        شلیک
```
- فقط روی touch device نمایش داده می‌شه
- بزرگ و راحت برای انگشت (حداقل 64px)
- visual feedback با رنگ و scale

### Portrait Warning:
- اگه گوشی عمودی بگیری → پیام `📱 Please rotate`

### دکمه‌های UI بزرگ:
- Title: `▶ PLAY` و `🏪 SHOP` — ۲۲۰×۵۲px
- Game Over: `🏪 GO TO SHOP` و `▶ PLAY AGAIN`
- همه با touchend event

### Touch shop:
- همه کارت‌ها، تب‌ها، swatches رنگ → touch-aware

---

## 🏗️ ساختار فایل

```
bullethead/
└── index.html          ← کل بازی در یه فایل HTML
```

### بخش‌های اصلی کد (درون `<script>`):

```
CANVAS SETUP          ← اندازه + resize responsive
LOCALSTORAGE          ← lsGet / lsSet
PERSISTENT DATA       ← coins, unlocks, selections
CHARACTERS            ← CHARS object (6 chars)
GUNS                  ← GUNS object (5 guns)
OUTFIT PALETTE        ← 12 preset colors
MAP THEMES            ← THEMES array (10 themes)
PLATFORM LAYOUTS      ← ALL_LAYOUTS array (10 layouts)
GAME STATE            ← let state, score, level, kills...
PLAYER                ← makePlayer(), getShirtColor()
BULLETS               ← shootPlayer(), bullet objects
ENEMIES               ← spawnEnemy(), ENEMY_PALETTES
POWER-UPS             ← dropPowerup(), collectPower()
INPUT                 ← keyboard + touch controls
PHYSICS               ← overlap(), applyPlatformLanding()
PARTICLES             ← burst(), floatText()
SPAWNER               ← spawnInterval(), maxOnScreen()
GAME FLOW             ← startGame(), goToShop(), onKill()
UPDATE FUNCTIONS      ← updatePlayer/Enemies/Bullets/...
DRAW HELPERS          ← roundRect(), drawRobloxChar()
DRAW SCENE            ← drawBackground/Platforms/Player/...
HUD                   ← drawHUD() — coins, lives, bars
TITLE SCREEN          ← drawTitle(), handleTitleClick()
GAME OVER             ← drawGameOver(), handleGameOverClick()
SHOP SCREEN           ← drawShop(), 3 tabs, click zones
MAIN LOOP             ← requestAnimationFrame loop
```

---

## 🧠 تکنیک‌های کلیدی استفاده‌شده

| تکنیک | توضیح |
|---|---|
| **Fixed logical resolution** | بازی همیشه 620×480 — CSS scale برای responsive |
| **requestAnimationFrame** | loop بازی ~60fps |
| **AABB Collision** | `overlap()` ساده برای همه برخوردها |
| **Platform gravity** | `prevBottom <= pl.y+8` برای فرود دقیق |
| **Particle system** | آرایه ساده با life counter |
| **Floating text** | امتیاز و پیام‌ها با fade و float |
| **Canvas transform** | `scale(facing, 1)` برای mirror شخصیت |
| **localStorage** | داده‌های پایدار بین session‌ها |
| **Touch zones** | آرایه `shopZones` برای click/touch detection |
| **Sine wave float** | دشمن‌ها با `Math.sin(phase)` شناور می‌شن |
| **Slide transition** | پلتفرم‌ها با offset Y انیمیشن دارن |
| **Theme system** | `getTheme()` رنگ‌ها رو از آرایه THEMES می‌خونه |

---

## 📊 آمار پروژه

| آیتم | تعداد |
|---|---|
| خطوط کد | ~1300 خط |
| تم‌های بصری | 10 |
| چیدمان پلتفرم | 10 |
| نوع کاراکتر | 6 |
| نوع اسلحه | 5 |
| نوع power-up | 5 |
| رنگ outfit | 24 (12 shirt + 12 pants) |
| فایل‌ها | 1 (فقط index.html) |
| dependency | ۰ — خالص HTML/JS/CSS |

---

*ساخته شده با Claude Code — بدون هیچ framework یا کتابخونه خارجی*
