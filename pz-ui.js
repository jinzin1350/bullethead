// ═══════════════════════════════════════════════════════════════
//  PlayZone UI — Shared overlay for ALL games
//  Injects: Auth modal, Profile panel, Shop, Leaderboard, HUD
// ═══════════════════════════════════════════════════════════════

window.PZUI = {

  gameName:   'BulletHead',
  gameSlug:   'bullethead',
  onResume:   null,  // callback وقتی overlay بسته میشه
  onPause:    null,  // callback وقتی overlay باز میشه

  // ── INJECT CSS + HTML ──
  inject(config = {}) {
    this.gameName = config.gameName || 'Game';
    this.gameSlug = config.gameSlug || 'game';
    this.onResume = config.onResume || null;
    this.onPause  = config.onPause  || null;

    this._injectCSS();
    this._injectHTML();
    this._bindEvents();

    // Listen to PZ events
    PZ.on('login',   () => this._onLogin());
    PZ.on('logout',  () => this._onLogout());
    PZ.on('coins',   () => this._updateHUD());
    PZ.on('toast',   (t) => this.toast(typeof t === 'string' ? t : t.msg, t.color));
    PZ.on('ready',   () => {
      if (PZ.isLoggedIn()) this._onLogin();
      else this._showAuth();
    });
    PZ.on('room_msg', (msg) => this._handleRoomMsg(msg));
  },

  // ── CSS ──
  _injectCSS() {
    const el = document.createElement('style');
    el.textContent = `
      /* ── PZ OVERLAY BASE ── */
      #pz-overlay {
        position: fixed; inset: 0; z-index: 9000;
        display: none;
        align-items: center; justify-content: center;
        background: rgba(0,0,0,0.88);
        backdrop-filter: blur(8px);
        padding: 16px;
        font-family: Arial, sans-serif;
      }
      #pz-overlay.show { display: flex; }

      .pz-panel {
        background: #12122a;
        border: 1.5px solid #2a2a50;
        border-radius: 18px;
        width: 100%; max-width: 480px;
        max-height: 90vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #2a2a50 transparent;
      }
      .pz-panel::-webkit-scrollbar { width: 4px; }
      .pz-panel::-webkit-scrollbar-thumb { background: #2a2a50; border-radius: 2px; }

      .pz-header {
        padding: 18px 20px 14px;
        border-bottom: 1px solid #2a2a50;
        display: flex; align-items: center; justify-content: space-between;
      }
      .pz-title {
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 16px; font-weight: 900;
        background: linear-gradient(90deg, #00b4d8, #00ff88);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .pz-close {
        width: 32px; height: 32px; border-radius: 50%;
        background: transparent; border: 1.5px solid #2a2a50;
        color: #666; font-size: 16px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: border-color .15s, color .15s;
      }
      .pz-close:hover { border-color: #ff4444; color: #ff4444; }

      /* ── TABS ── */
      .pz-tabs {
        display: flex; border-bottom: 1px solid #2a2a50;
        overflow-x: auto; scrollbar-width: none;
      }
      .pz-tabs::-webkit-scrollbar { display: none; }
      .pz-tab {
        flex: 1; min-width: 60px; padding: 11px 6px;
        text-align: center; font-size: 11px; font-weight: 700;
        color: #666688; cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: color .15s, border-color .15s;
        white-space: nowrap;
      }
      .pz-tab:hover { color: #e0e0ff; }
      .pz-tab.active { color: #00b4d8; border-bottom-color: #00b4d8; }

      .pz-tab-content { display: none; padding: 18px; }
      .pz-tab-content.active { display: block; }

      /* ── FORM ── */
      .pz-field { margin-bottom: 14px; }
      .pz-field label {
        display: block; font-size: 11px; font-weight: 700;
        color: #666688; margin-bottom: 6px;
        text-transform: uppercase; letter-spacing: 1px;
      }
      .pz-input {
        width: 100%; padding: 12px 14px;
        background: #1a1a35; border: 1.5px solid #2a2a50;
        border-radius: 10px; color: #e0e0ff;
        font-size: 16px; outline: none;
        transition: border-color .2s; font-family: inherit;
        -webkit-appearance: none;
        touch-action: auto !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        pointer-events: auto !important;
      }
      .pz-input:focus { border-color: #00b4d8; }
      /* همه المان های overlay touch رو allow کنن */
      #pz-overlay, #pz-overlay * {
        touch-action: auto !important;
        user-select: text !important;
        -webkit-user-select: text !important;
      }
      #pz-death-banner, #pz-death-banner * {
        touch-action: auto !important;
      }
      .pz-btn {
        width: 100%; padding: 13px;
        background: linear-gradient(135deg, #00b4d8, #00ff88);
        color: #000; font-size: 15px; font-weight: 900;
        font-family: 'Arial Black', Arial, sans-serif;
        border: none; border-radius: 10px; cursor: pointer;
        transition: opacity .15s, transform .1s;
        margin-bottom: 8px;
      }
      .pz-btn:hover { opacity: .88; }
      .pz-btn:active { transform: scale(.97); }
      .pz-btn:disabled { opacity: .4; cursor: not-allowed; }
      .pz-btn-outline {
        width: 100%; padding: 12px;
        background: transparent; color: #00ff88;
        font-size: 14px; font-weight: 700;
        border: 1.5px solid #00ff88; border-radius: 10px;
        cursor: pointer; transition: background .15s;
      }
      .pz-btn-outline:hover { background: #00ff8811; }
      .pz-err { color: #ff4444; font-size: 12px; margin-top: 8px; text-align: center; min-height: 18px; }

      /* ── HUD BAR ── */
      #pz-hud {
        position: fixed; top: 0; left: 0; right: 0;
        height: 42px; z-index: 8000;
        display: none;
        align-items: center; justify-content: space-between;
        padding: 0 12px;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(8px);
        border-bottom: 1px solid #2a2a5044;
        gap: 8px;
      }
      #pz-hud.show { display: flex; }
      .pz-hud-left { display: flex; align-items: center; gap: 8px; }
      .pz-hud-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        background: linear-gradient(135deg, #cc44ff, #ff44aa);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 900; color: #fff;
        cursor: pointer; flex-shrink: 0;
        border: 1.5px solid #cc44ff55;
      }
      .pz-hud-name {
        font-size: 12px; font-weight: 700;
        color: #e0e0ff; max-width: 80px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .pz-hud-rank {
        font-size: 10px; color: #666688;
      }
      .pz-hud-coins {
        font-size: 13px; font-weight: 900;
        color: #ffcc00; display: flex; align-items: center; gap: 4px;
      }
      .pz-hud-right { display: flex; align-items: center; gap: 6px; }
      .pz-hud-btn {
        padding: 5px 10px; border-radius: 16px;
        font-size: 10px; font-weight: 700;
        border: 1.5px solid #2a2a50; background: transparent;
        color: #666688; cursor: pointer;
        transition: border-color .15s, color .15s;
        white-space: nowrap;
      }
      .pz-hud-btn:hover { border-color: #00b4d8; color: #00b4d8; }
      .pz-hud-btn.active { border-color: #cc44ff; color: #cc44ff; }

      /* ── PROFILE ── */
      .pz-profile-card {
        background: linear-gradient(135deg, #0d1530, #0a1a10);
        border: 1px solid #2a2a50; border-radius: 14px;
        padding: 20px; margin-bottom: 16px; text-align: center;
      }
      .pz-avatar-big {
        width: 64px; height: 64px; border-radius: 50%;
        background: linear-gradient(135deg, #cc44ff, #ff44aa);
        display: flex; align-items: center; justify-content: center;
        font-size: 28px; margin: 0 auto 10px;
        border: 2px solid #cc44ff55;
      }
      .pz-username-big {
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 18px; font-weight: 900; color: #fff;
        margin-bottom: 4px;
      }
      .pz-rank-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 12px; border-radius: 20px;
        font-size: 12px; font-weight: 700;
        background: #1a1a35; border: 1px solid #2a2a50;
        margin-bottom: 14px;
      }
      .pz-stats-row {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 10px; margin-top: 12px;
      }
      .pz-stat-box {
        background: #1a1a35; border: 1px solid #2a2a50;
        border-radius: 10px; padding: 12px 8px; text-align: center;
      }
      .pz-stat-val { font-size: 20px; font-weight: 900; color: #fff; }
      .pz-stat-lbl { font-size: 10px; color: #666688; margin-top: 2px;
        text-transform: uppercase; letter-spacing: 1px; }

      /* ── SHOP ── */
      .pz-shop-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr));
        gap: 10px;
      }
      .pz-shop-card {
        background: #1a1a35; border: 1.5px solid #2a2a50;
        border-radius: 12px; padding: 14px 10px; text-align: center;
        transition: border-color .15s, transform .12s;
        cursor: pointer;
      }
      .pz-shop-card:hover { border-color: #00b4d8; transform: translateY(-2px); }
      .pz-shop-card.owned { border-color: #00ff8866; background: #071a10; }
      .pz-shop-card.equipped { border-color: #ffcc00; background: #1a1400; }
      .pz-shop-icon { font-size: 32px; margin-bottom: 8px; display: block; }
      .pz-shop-name { font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 4px; }
      .pz-shop-cost { font-size: 12px; color: #ffcc00; font-weight: 700; }
      .pz-shop-cost.owned { color: #00ff88; }
      .pz-shop-cost.equipped { color: #ffcc00; }

      /* ── LEADERBOARD ── */
      .pz-lb-row {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 12px; border-bottom: 1px solid #1a1a35;
        font-size: 13px;
      }
      .pz-lb-row:last-child { border-bottom: none; }
      .pz-lb-rank { font-size: 16px; min-width: 28px; text-align: center; }
      .pz-lb-name { flex: 1; font-weight: 700; color: #e0e0ff;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pz-lb-name.me { color: #ffcc00; }
      .pz-lb-score { font-weight: 900; color: #00ff88; }

      /* ── DAILY CHALLENGE ── */
      .pz-challenge-card {
        background: linear-gradient(135deg, #0d0020, #001a10);
        border: 1.5px solid #cc44ff44;
        border-radius: 14px; padding: 18px;
      }
      .pz-challenge-title {
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 15px; font-weight: 900; color: #cc44ff;
        margin-bottom: 6px;
      }
      .pz-challenge-desc { font-size: 13px; color: #888; line-height: 1.5; }
      .pz-challenge-reward {
        margin-top: 12px; font-size: 12px; color: #ffcc00; font-weight: 700;
      }

      /* ── 2-PLAYER ── */
      .pz-room-code {
        font-size: 40px; font-weight: 900; letter-spacing: 10px;
        font-family: 'Arial Black', monospace;
        color: #00ff88; text-align: center;
        background: #1a1a35; padding: 16px; border-radius: 12px;
        margin: 16px 0;
        text-shadow: 0 0 20px #00ff8855;
      }
      .pz-waiting { text-align: center; color: #666688; font-size: 13px; }
      .pz-waiting .dot { animation: blink 1s infinite; }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

      /* ── TOAST ── */
      #pz-toast {
        position: fixed; bottom: 80px; left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #00ff88; color: #000;
        padding: 10px 22px; border-radius: 30px;
        font-size: 13px; font-weight: 700;
        transition: transform .3s, opacity .3s;
        opacity: 0; z-index: 9999;
        pointer-events: none; white-space: nowrap;
      }
      #pz-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

      /* ── SCREENSHOT BANNER ── */
      #pz-death-banner {
        position: fixed; inset: 0; z-index: 8500;
        display: none; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.9);
        flex-direction: column; gap: 16px; padding: 24px;
      }
      #pz-death-banner.show { display: flex; }
      #pz-death-img {
        max-width: 320px; border-radius: 12px;
        border: 2px solid #ff4444;
        box-shadow: 0 0 30px #ff444455;
      }
      .pz-death-score {
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 22px; color: #ff4444; text-align: center;
      }
      .pz-death-btns { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
      .pz-death-btn {
        padding: 12px 24px; border-radius: 30px;
        font-size: 14px; font-weight: 700; cursor: pointer;
        border: none; transition: opacity .15s;
      }
      .pz-death-btn:hover { opacity: .85; }
      .pz-death-btn.share { background: linear-gradient(135deg, #cc44ff, #ff44aa); color: #fff; }
      .pz-death-btn.retry { background: linear-gradient(135deg, #00ff88, #00b4d8); color: #000; }
      .pz-death-btn.close { background: #1a1a35; color: #888; border: 1px solid #2a2a50; }
    `;
    document.head.appendChild(el);
  },

  // ── HTML ──
  _injectHTML() {
    const div = document.createElement('div');
    div.innerHTML = `
      <!-- HUD -->
      <div id="pz-hud">
        <div class="pz-hud-left">
          <div class="pz-hud-avatar" id="pz-hud-avatar" onclick="PZUI.openPanel('profile')">?</div>
          <div>
            <div class="pz-hud-name" id="pz-hud-name">Guest</div>
            <div class="pz-hud-rank" id="pz-hud-rank">🎮 Rookie</div>
          </div>
        </div>
        <div class="pz-hud-coins">🪙 <span id="pz-hud-coins">0</span></div>
        <div class="pz-hud-right">
          <button class="pz-hud-btn" onclick="PZUI.openPanel('shop')">🛒 Shop</button>
          <button class="pz-hud-btn" onclick="PZUI.openPanel('lb')">🏆</button>
          <button class="pz-hud-btn active" onclick="PZUI.openPanel('mp')">👥 2P</button>
        </div>
      </div>

      <!-- Main Overlay -->
      <div id="pz-overlay">
        <div class="pz-panel" id="pz-panel-content"></div>
      </div>

      <!-- Death Banner -->
      <div id="pz-death-banner">
        <div class="pz-death-score" id="pz-death-score">Score: 0</div>
        <img id="pz-death-img" src="" alt=""/>
        <div class="pz-death-btns">
          <button class="pz-death-btn share" onclick="PZUI._shareScore()">📤 Share!</button>
          <button class="pz-death-btn retry" onclick="PZUI.hideDeath()">▶ Retry</button>
          <button class="pz-death-btn close" onclick="PZUI.hideDeath()">✕</button>
        </div>
      </div>

      <!-- Toast -->
      <div id="pz-toast"></div>
    `;
    document.body.appendChild(div);
  },

  // ── EVENTS ──
  _bindEvents() {
    document.getElementById('pz-overlay').addEventListener('click', e => {
      if (e.target.id === 'pz-overlay') this.closePanel();
    });
  },

  // ── LOGIN / LOGOUT ──
  _onLogin() {
    document.getElementById('pz-hud').classList.add('show');
    this._updateHUD();
    this.closePanel();
    this.toast('👋 Welcome back, ' + PZ.getUsername() + '!');
  },
  _onLogout() {
    document.getElementById('pz-hud').classList.remove('show');
    this._showAuth();
  },
  _updateHUD() {
    const rank = PZ.getRank();
    document.getElementById('pz-hud-name').textContent    = PZ.getUsername();
    document.getElementById('pz-hud-rank').textContent    = rank.icon + ' ' + rank.name;
    document.getElementById('pz-hud-coins').textContent   = PZ.getCoins().toLocaleString();
    document.getElementById('pz-hud-avatar').textContent  = PZ.getUsername()[0]?.toUpperCase() || '?';
  },

  // ── PANELS ──
  openPanel(tab = 'profile') {
    if (this.onPause) this.onPause();
    const overlay = document.getElementById('pz-overlay');
    overlay.classList.add('show');
    this._renderPanel(tab);
  },
  closePanel() {
    document.getElementById('pz-overlay').classList.remove('show');
    if (this.onResume) this.onResume();
  },

  _renderPanel(tab) {
    const el = document.getElementById('pz-panel-content');
    const tabs = [
      { id:'profile', icon:'👤', label:'Profile' },
      { id:'shop',    icon:'🛒', label:'Shop'    },
      { id:'lb',      icon:'🏆', label:'Rank'    },
      { id:'daily',   icon:'🎯', label:'Daily'   },
      { id:'mp',      icon:'👥', label:'2-Player'},
    ];
    el.innerHTML = `
      <div class="pz-header">
        <div class="pz-title">🎮 PlayZone</div>
        <button class="pz-close" onclick="PZUI.closePanel()">✕</button>
      </div>
      <div class="pz-tabs">
        ${tabs.map(t => `
          <div class="pz-tab ${tab===t.id?'active':''}"
               onclick="PZUI._renderPanel('${t.id}')">
            ${t.icon} ${t.label}
          </div>`).join('')}
      </div>
      <div id="pz-tab-body" style="padding:18px;"></div>
    `;
    this._renderTab(tab);
  },

  async _renderTab(tab) {
    const body = document.getElementById('pz-tab-body');
    if (!body) return;
    body.innerHTML = '<div style="text-align:center;padding:30px;color:#666">Loading...</div>';
    if (tab === 'profile')  await this._tabProfile(body);
    if (tab === 'shop')     await this._tabShop(body);
    if (tab === 'lb')       await this._tabLeaderboard(body);
    if (tab === 'daily')    this._tabDaily(body);
    if (tab === 'mp')       this._tabMultiplayer(body);
  },

  // ── TAB: PROFILE ──
  async _tabProfile(body) {
    const rank = PZ.getRank();
    body.innerHTML = `
      <div class="pz-profile-card">
        <div class="pz-avatar-big">${PZ.getUsername()[0]?.toUpperCase()||'?'}</div>
        <div class="pz-username-big">${PZ.getUsername()}</div>
        <div class="pz-rank-badge" style="color:${rank.color};border-color:${rank.color}44">
          ${rank.icon} ${rank.name}
        </div>
        <div class="pz-stats-row">
          <div class="pz-stat-box">
            <div class="pz-stat-val" style="color:#ffcc00">🪙 ${PZ.getCoins().toLocaleString()}</div>
            <div class="pz-stat-lbl">Coins</div>
          </div>
          <div class="pz-stat-box">
            <div class="pz-stat-val" style="color:#00ff88">🏅 ${PZ.getTotalCoins().toLocaleString()}</div>
            <div class="pz-stat-lbl">Total Earned</div>
          </div>
        </div>
      </div>

      <div class="pz-field">
        <label>Change Username</label>
        <input class="pz-input" id="pz-new-username" placeholder="New username..." maxlength="20" value="${PZ.getUsername()}"/>
      </div>
      <button class="pz-btn" onclick="PZUI._saveUsername()">💾 Save</button>
      <button class="pz-btn-outline" onclick="PZ.logout()">🚪 Logout</button>
      <div class="pz-err" id="pz-profile-err"></div>
    `;
  },

  async _saveUsername() {
    const val = document.getElementById('pz-new-username')?.value?.trim();
    const err = document.getElementById('pz-profile-err');
    if (!val || val.length < 2) { if(err) err.textContent='Min 2 characters'; return; }
    const ok = await PZ.setUsername(val);
    if (ok) { this.toast('✅ Username updated!'); this._updateHUD(); }
    else { if(err) err.textContent='Username taken or error'; }
  },

  // ── TAB: SHOP ──
  async _tabShop(body) {
    const [items, owned] = await Promise.all([
      PZ.getShopItems(this.gameSlug),
      PZ.getPlayerItems(),
    ]);
    const equippedItems = await PZ.getEquipped();
    const ownedKeys   = new Set(owned.map(i => i.item_key));
    const equippedKeys = new Set(Object.values(equippedItems).map(i => i?.key).filter(Boolean));

    if (!items.length) {
      body.innerHTML = '<div style="text-align:center;padding:30px;color:#666">Shop coming soon! 🛒</div>';
      return;
    }

    // group by game
    const global = items.filter(i => i.game === 'global');
    const gameItems = items.filter(i => i.game !== 'global');

    const renderGrid = (list) => list.map(item => {
      const isOwned    = ownedKeys.has(item.item_key);
      const isEquipped = equippedKeys.has(item.item_key);
      const cls = isEquipped ? 'equipped' : isOwned ? 'owned' : '';
      const costLabel = isEquipped ? '✓ Equipped' : isOwned ? '✓ Owned' : `🪙 ${item.cost}`;
      return `
        <div class="pz-shop-card ${cls}"
             onclick="PZUI._shopAction('${item.item_key}','${item.game}',${isOwned},${isEquipped})">
          <span class="pz-shop-icon">${item.data?.icon || '🎁'}</span>
          <div class="pz-shop-name">${item.name}</div>
          <div class="pz-shop-cost ${cls}">${costLabel}</div>
        </div>`;
    }).join('');

    body.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:#666688;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">🌐 Global Items</div>
      <div class="pz-shop-grid">${renderGrid(global)}</div>
      ${gameItems.length ? `
        <div style="font-size:11px;font-weight:700;color:#666688;text-transform:uppercase;letter-spacing:1px;margin:16px 0 10px">${this.gameName} Items</div>
        <div class="pz-shop-grid">${renderGrid(gameItems)}</div>
      ` : ''}
      <div class="pz-err" id="pz-shop-err"></div>
    `;
  },

  async _shopAction(key, game, isOwned, isEquipped) {
    if (isEquipped) { this.toast('Already equipped!'); return; }
    if (isOwned) {
      await PZ.equipItem(key);
      this.toast('✅ Equipped!');
      await this._tabShop(document.getElementById('pz-tab-body'));
      return;
    }
    const result = await PZ.buyItem(key, game);
    if (result.ok) {
      this.toast('🎉 Purchased: ' + result.item.name + '!');
      this._updateHUD();
      await this._tabShop(document.getElementById('pz-tab-body'));
    } else {
      this.toast('❌ ' + result.msg, '#ff4444');
    }
  },

  // ── TAB: LEADERBOARD ──
  async _tabLeaderboard(body) {
    const [gameLB, globalLB] = await Promise.all([
      PZ.getLeaderboard(this.gameSlug),
      PZ.getGlobalLeaderboard(),
    ]);
    const medals = ['🥇','🥈','🥉'];
    const renderLB = (rows, scoreKey, labelKey) => rows.map((r, i) => {
      const isMe = (r.player_name || r.username) === PZ.getUsername();
      return `<div class="pz-lb-row">
        <div class="pz-lb-rank">${medals[i] || (i+1)+'.'}</div>
        <div class="pz-lb-name ${isMe?'me':''}">${r.player_name || r.username}${isMe?' 👈':''}</div>
        <div class="pz-lb-score">${(r[scoreKey]||0).toLocaleString()} ${labelKey}</div>
      </div>`;
    }).join('') || '<div style="text-align:center;padding:20px;color:#666">No scores yet!</div>';

    body.innerHTML = `
      <div style="font-size:12px;font-weight:700;color:#00b4d8;margin-bottom:8px">🎮 ${this.gameName} Top 10</div>
      ${renderLB(gameLB, 'score', 'pts')}
      <div style="font-size:12px;font-weight:700;color:#ffcc00;margin:16px 0 8px">🌐 Global Coin Leaders</div>
      ${renderLB(globalLB, 'total_coins', '🪙')}
    `;
  },

  // ── TAB: DAILY CHALLENGE ──
  _tabDaily(body) {
    const ch = PZ.getDailyChallenge(this.gameSlug);
    const reward = 500;
    body.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:#666688;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
        📅 Today's Challenge
      </div>
      <div class="pz-challenge-card">
        <div class="pz-challenge-title">🎯 ${ch.title}</div>
        <div class="pz-challenge-desc">${ch.desc}</div>
        <div class="pz-challenge-reward">🏆 Reward: 🪙 ${reward} coins</div>
      </div>
      <div style="margin-top:14px;font-size:12px;color:#444;text-align:center">
        Challenge resets at midnight. Come back tomorrow for a new one!
      </div>
    `;
  },

  // ── TAB: 2-PLAYER ──
  _tabMultiplayer(body) {
    body.innerHTML = `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:13px;color:#888;margin-bottom:16px">
          Play with a friend online — share a room code!
        </div>
        <button class="pz-btn" onclick="PZUI._createRoom()" style="margin-bottom:12px">
          🚀 Create Room
        </button>
        <div style="font-size:12px;color:#666688;margin-bottom:10px">— or join a room —</div>
        <input class="pz-input" id="pz-room-input" placeholder="Enter room code..."
               maxlength="6" style="text-align:center;font-size:24px;letter-spacing:8px;text-transform:uppercase"/>
        <button class="pz-btn" style="margin-top:10px" onclick="PZUI._joinRoom()">
          🎮 Join Room
        </button>
      </div>
      <div id="pz-mp-status"></div>
      <div class="pz-err" id="pz-mp-err"></div>
    `;
  },

  async _createRoom() {
    const status = document.getElementById('pz-mp-status');
    const code = await PZ.createRoom(this.gameSlug);
    if (!code) { this.toast('❌ Error creating room', '#ff4444'); return; }
    status.innerHTML = `
      <div style="text-align:center">
        <div style="font-size:12px;color:#888;margin-bottom:8px">Share this code with your friend:</div>
        <div class="pz-room-code">${code}</div>
        <div class="pz-waiting">Waiting for player 2 <span class="dot">...</span></div>
        <button class="pz-btn-outline" style="margin-top:12px" onclick="navigator.clipboard?.writeText('${code}');PZUI.toast('📋 Code copied!')">
          📋 Copy Code
        </button>
      </div>
    `;
    // listen for player 2 joining via realtime
    PZ.on('room_msg', (msg) => {
      if (msg.type === 'joined') {
        status.innerHTML = `<div style="text-align:center;color:#00ff88;font-size:14px;font-weight:700">
          ✅ ${msg.name} joined! Starting...
        </div>`;
        setTimeout(() => { this.closePanel(); if(this.onResume) this.onResume(); }, 1500);
      }
    });
  },

  async _joinRoom() {
    const code = document.getElementById('pz-room-input')?.value?.trim().toUpperCase();
    const err  = document.getElementById('pz-mp-err');
    if (!code || code.length < 6) { if(err) err.textContent='Enter a 6-char code'; return; }
    const room = await PZ.joinRoom(code);
    if (!room) { if(err) err.textContent='Room not found or already started'; return; }
    await PZ.sendRoomMsg({ type:'joined', name: PZ.getUsername() });
    this.toast('✅ Joined room! Starting...');
    setTimeout(() => { this.closePanel(); if(this.onResume) this.onResume(); }, 1200);
  },

  _handleRoomMsg(msg) {
    // بازی‌های individual این رو handle می‌کنن
    if (window.PZ_GAME_HANDLER) window.PZ_GAME_HANDLER(msg);
  },

  // ── AUTH SCREEN ──
  _showAuth() {
    const el = document.getElementById('pz-panel-content');
    document.getElementById('pz-overlay').classList.add('show');
    el.innerHTML = `
      <div class="pz-header">
        <div class="pz-title">🎮 PlayZone</div>
      </div>
      <div style="padding:24px">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:32px;margin-bottom:8px">🎮</div>
          <div style="font-family:'Arial Black',sans-serif;font-size:18px;color:#fff;margin-bottom:4px">Welcome to PlayZone!</div>
          <div style="font-size:13px;color:#666688">Login to save your progress & coins</div>
        </div>
        <div id="pz-auth-tabs" style="display:flex;gap:8px;margin-bottom:20px">
          <button class="pz-btn" id="pz-tab-login"
            style="background:linear-gradient(135deg,#00b4d8,#00ff88)"
            onclick="PZUI._showAuthTab('login')">Login</button>
          <button class="pz-btn" id="pz-tab-signup"
            style="background:#1a1a35;color:#fff;border:1.5px solid #2a2a50"
            onclick="PZUI._showAuthTab('signup')">Sign Up</button>
        </div>
        <div id="pz-auth-form"></div>
      </div>
    `;
    this._showAuthTab('login');
  },

  _showAuthTab(tab) {
    const form = document.getElementById('pz-auth-form');
    if (!form) return;
    if (tab === 'login') {
      form.innerHTML = `
        <div class="pz-field"><label>Email</label>
          <input class="pz-input" id="pz-email" type="email" placeholder="you@example.com" inputmode="email"/></div>
        <div class="pz-field"><label>Password</label>
          <input class="pz-input" id="pz-pass" type="password" placeholder="••••••••"/></div>
        <button class="pz-btn" id="pz-auth-btn" onclick="PZUI._doLogin()">🔑 Login</button>
        <div class="pz-err" id="pz-auth-err"></div>
      `;
    } else {
      form.innerHTML = `
        <div class="pz-field"><label>Username</label>
          <input class="pz-input" id="pz-username" placeholder="Cool username..." maxlength="20"/></div>
        <div class="pz-field"><label>Email</label>
          <input class="pz-input" id="pz-email" type="email" placeholder="you@example.com" inputmode="email"/></div>
        <div class="pz-field"><label>Password</label>
          <input class="pz-input" id="pz-pass" type="password" placeholder="Min 6 characters"/></div>
        <button class="pz-btn" id="pz-auth-btn" onclick="PZUI._doSignup()">✨ Create Account</button>
        <div class="pz-err" id="pz-auth-err"></div>
      `;
    }
  },

  async _doLogin() {
    const email = document.getElementById('pz-email')?.value?.trim();
    const pass  = document.getElementById('pz-pass')?.value;
    const err   = document.getElementById('pz-auth-err');
    const btn   = document.getElementById('pz-auth-btn');
    if (!email || !pass) { if(err) err.textContent='Fill in all fields'; return; }
    if (btn) { btn.disabled=true; btn.textContent='Logging in...'; }
    try {
      await PZ.login(email, pass);
    } catch(e) {
      if (err) err.textContent = e.message || 'Login failed';
      if (btn) { btn.disabled=false; btn.textContent='🔑 Login'; }
    }
  },

  async _doSignup() {
    const username = document.getElementById('pz-username')?.value?.trim();
    const email    = document.getElementById('pz-email')?.value?.trim();
    const pass     = document.getElementById('pz-pass')?.value;
    const err      = document.getElementById('pz-auth-err');
    const btn      = document.getElementById('pz-auth-btn');
    if (!username || !email || !pass) { if(err) err.textContent='Fill in all fields'; return; }
    if (pass.length < 6) { if(err) err.textContent='Password min 6 chars'; return; }
    if (btn) { btn.disabled=true; btn.textContent='Creating...'; }
    try {
      await PZ.signup(email, pass, username);
    } catch(e) {
      if (err) err.textContent = e.message || 'Signup failed';
      if (btn) { btn.disabled=false; btn.textContent='✨ Create Account'; }
    }
  },

  // ── DEATH SCREENSHOT ──
  showDeath(canvas, score, onRetry) {
    const img    = PZ.captureScreenshot(canvas);
    const banner = document.getElementById('pz-death-banner');
    const imgEl  = document.getElementById('pz-death-img');
    const scoreEl= document.getElementById('pz-death-score');
    if (!banner) return;
    this._lastScore  = score;
    this._lastCanvas = canvas;
    this._onRetry    = onRetry;
    if (img) { imgEl.src=img; imgEl.style.display='block'; }
    else imgEl.style.display='none';
    scoreEl.textContent = `💀 Game Over — Score: ${score.toLocaleString()}`;
    banner.classList.add('show');
    if (this.onPause) this.onPause();
  },

  hideDeath() {
    document.getElementById('pz-death-banner')?.classList.remove('show');
    if (this._onRetry) this._onRetry();
    if (this.onResume) this.onResume();
  },

  async _shareScore() {
    if (this._lastCanvas) {
      await PZ.shareScreenshot(this._lastCanvas, this._lastScore, this.gameName);
    }
  },

  // ── TOAST ──
  _toastTimer: null,
  toast(msg, color = '#00ff88') {
    const el = document.getElementById('pz-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.background = color;
    el.style.color = color === '#00ff88' ? '#000' : '#fff';
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  },
};
