// ═══════════════════════════════════════════════════════════════
//  PlayZone Core — Global Platform Engine
//  Shared across ALL games (BulletHead, Contra, ...)
//  Handles: Auth, Coins, XP, Shop, Profile, Leaderboard, 2-Player
// ═══════════════════════════════════════════════════════════════

const _PZ_SUPA_URL = 'https://oshkqzxmnqvbfkuvxwbc.supabase.co';
const _PZ_SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGtxenhtbnF2YmZrdXZ4d2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTU5OTYsImV4cCI6MjA5MzM5MTk5Nn0.dkTO5a402Xa3AZMUDo53WDTFBSz4tny9o5-Mpsljlgk';

// ── یه Supabase client مشترک — همه جا از این استفاده کنن ──
const _sb = (typeof supabase !== 'undefined')
  ? supabase.createClient(_PZ_SUPA_URL, _PZ_SUPA_KEY)
  : null;

// expose برای بازی‌ها — به جای ساختن client جدید
window.PZ_SB = _sb;

// ═══════════════════════════════════════════════════════════════
//  PlayZone namespace
// ═══════════════════════════════════════════════════════════════
window.PZ = {

  // ── STATE ──
  user:    null,   // Supabase auth user
  profile: null,   // players row
  ready:   false,  // platform initialized
  _listeners: {},  // event callbacks

  // ── INIT ──
  async init() {
    if (!_sb) { console.error('PZ: Supabase not loaded'); return; }

    // Listen to auth changes
    _sb.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        this.user = session.user;
        await this._loadProfile();
        this._emit('login', this.user);
      } else {
        this.user    = null;
        this.profile = null;
        this._emit('logout');
      }
    });

    // Check current session
    const { data: { session } } = await _sb.auth.getSession();
    if (session) {
      this.user = session.user;
      await this._loadProfile();
    }
    this.ready = true;
    this._emit('ready');
  },

  // ── AUTH ──
  async login(email, password) {
    const { data, error } = await _sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signup(email, password, username) {
    const { data, error } = await _sb.auth.signUp({ email, password });
    if (error) throw error;
    // auto-login after signup
    if (data.user) {
      await _sb.auth.signInWithPassword({ email, password });
      // create profile
      await _sb.from('players').upsert({
        user_id:  data.user.id,
        username: username || email.split('@')[0],
        coins:    0,
        total_coins: 0,
        avatar:   'noob',
        title:    'Rookie',
      });
      await this._loadProfile();
    }
    return data;
  },

  async logout() {
    await _sb.auth.signOut();
  },

  isLoggedIn() { return !!this.user; },

  // ── PROFILE ──
  async _loadProfile() {
    if (!this.user) return;
    const { data } = await _sb.from('players')
      .select('*')
      .eq('user_id', this.user.id)
      .single();

    if (!data) {
      // auto-create profile
      const username = this.user.email.split('@')[0];
      const { data: newP } = await _sb.from('players').insert({
        user_id:     this.user.id,
        username,
        coins:       0,
        total_coins: 0,
        avatar:      'noob',
        title:       'Rookie',
      }).select().single();
      this.profile = newP;
    } else {
      this.profile = data;
    }
    this._emit('profile', this.profile);
  },

  async refreshProfile() { await this._loadProfile(); },

  getUsername()   { return this.profile?.username || 'Guest'; },
  getCoins()      { return this.profile?.coins || 0; },
  getTotalCoins() { return this.profile?.total_coins || 0; },
  getAvatar()     { return this.profile?.avatar || 'noob'; },
  getTitle()      { return this.profile?.title || 'Rookie'; },
  getRank()       { return this._calcRank(this.getTotalCoins()); },

  _calcRank(totalCoins) {
    if (totalCoins >= 50000) return { name: 'LEGEND',    icon: '👑', color: '#ffcc00' };
    if (totalCoins >= 20000) return { name: 'MASTER',    icon: '💎', color: '#00ccff' };
    if (totalCoins >= 10000) return { name: 'ELITE',     icon: '🔥', color: '#ff4400' };
    if (totalCoins >= 5000)  return { name: 'PRO',       icon: '⭐', color: '#cc44ff' };
    if (totalCoins >= 2000)  return { name: 'VETERAN',   icon: '🛡️', color: '#00ff88' };
    if (totalCoins >= 500)   return { name: 'WARRIOR',   icon: '⚔️', color: '#4488ff' };
    return                          { name: 'ROOKIE',    icon: '🎮', color: '#888888' };
  },

  // ── COINS ──
  async addCoins(amount) {
    if (!this.user) return;
    await _sb.rpc('add_coins', { p_user_id: this.user.id, p_amount: amount });
    if (this.profile) {
      this.profile.coins       = (this.profile.coins || 0) + amount;
      this.profile.total_coins = (this.profile.total_coins || 0) + amount;
    }
    this._emit('coins', this.profile?.coins);
  },

  async spendCoins(amount) {
    if (!this.user) return false;
    if ((this.profile?.coins || 0) < amount) return false;
    const { data } = await _sb.rpc('spend_coins', { p_user_id: this.user.id, p_amount: amount });
    if (data) {
      if (this.profile) this.profile.coins -= amount;
      this._emit('coins', this.profile?.coins);
    }
    return !!data;
  },

  // ── SHOP ──
  async getShopItems(game = 'global') {
    const { data } = await _sb.from('shop_items')
      .select('*')
      .in('game', ['global', game])
      .order('cost', { ascending: true });
    return data || [];
  },

  async getPlayerItems() {
    if (!this.user) return [];
    const { data } = await _sb.from('player_items')
      .select('*')
      .eq('user_id', this.user.id);
    return data || [];
  },

  async buyItem(itemKey, game = 'global') {
    if (!this.user) return { ok: false, msg: 'Not logged in' };
    // get item
    const { data: item } = await _sb.from('shop_items')
      .select('*').eq('item_key', itemKey).single();
    if (!item) return { ok: false, msg: 'Item not found' };

    // check already owned
    const { data: owned } = await _sb.from('player_items')
      .select('id').eq('user_id', this.user.id).eq('item_key', itemKey).single();
    if (owned) return { ok: false, msg: 'Already owned' };

    // spend coins
    const spent = await this.spendCoins(item.cost);
    if (!spent) return { ok: false, msg: 'Not enough coins' };

    // add to inventory
    await _sb.from('player_items').insert({
      user_id:  this.user.id,
      item_key: itemKey,
      game,
    });
    return { ok: true, item };
  },

  async equipItem(itemKey) {
    if (!this.user) return;
    // unequip same type first
    const { data: item } = await _sb.from('shop_items')
      .select('item_type').eq('item_key', itemKey).single();
    if (item) {
      const ownedItems = await this.getPlayerItems();
      const sameType = ownedItems.filter(i => i.item_type === item.item_type);
      for (const i of sameType) {
        await _sb.from('player_items')
          .update({ equipped: false })
          .eq('user_id', this.user.id).eq('item_key', i.item_key);
      }
    }
    await _sb.from('player_items')
      .update({ equipped: true })
      .eq('user_id', this.user.id).eq('item_key', itemKey);
    this._emit('equip', itemKey);
  },

  async getEquipped() {
    if (!this.user) return {};
    const { data } = await _sb.from('player_items')
      .select('item_key, game, shop_items(item_type, data)')
      .eq('user_id', this.user.id)
      .eq('equipped', true);
    if (!data) return {};
    const result = {};
    for (const row of data) {
      const type = row.shop_items?.item_type;
      if (type) result[type] = { key: row.item_key, data: row.shop_items?.data };
    }
    return result;
  },

  // ── SCORES ──
  async saveScore(gameSlug, score, wave = 1, extra = {}) {
    if (!this.user) return;
    await _sb.from('scores').insert({
      game_slug:   gameSlug,
      player_name: this.getUsername(),
      score,
      wave,
      ...extra,
    });
    // coins از score
    const earned = Math.floor(score / 40);
    if (earned > 0) await this.addCoins(earned);
  },

  async getLeaderboard(gameSlug, limit = 10) {
    const { data } = await _sb.from('scores')
      .select('player_name, score, wave')
      .eq('game_slug', gameSlug)
      .order('score', { ascending: false })
      .limit(50);
    // deduplicate
    const best = new Map();
    for (const row of (data || [])) {
      const prev = best.get(row.player_name);
      if (!prev || row.score > prev.score) best.set(row.player_name, row);
    }
    return [...best.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  async getGlobalLeaderboard(limit = 10) {
    const { data } = await _sb.from('players')
      .select('username, total_coins, avatar, title')
      .order('total_coins', { ascending: false })
      .limit(limit);
    return data || [];
  },

  // ── 2-PLAYER ONLINE ──
  _room:    null,
  _channel: null,

  async createRoom(game) {
    if (!this.user) return null;
    const code = Math.random().toString(36).substr(2,6).toUpperCase();
    const { data } = await _sb.from('game_sessions').insert({
      game,
      room_code:  code,
      player1_id: this.user.id,
      state:      'waiting',
      data:       {},
    }).select().single();
    this._room = data;
    this._subscribeRoom(code);
    return code;
  },

  async joinRoom(code) {
    if (!this.user) return null;
    const { data: room } = await _sb.from('game_sessions')
      .select('*').eq('room_code', code.toUpperCase()).single();
    if (!room || room.state !== 'waiting') return null;
    if (room.player1_id === this.user.id) return null; // خودته

    await _sb.from('game_sessions')
      .update({ player2_id: this.user.id, state: 'playing' })
      .eq('room_code', code.toUpperCase());

    this._room = { ...room, player2_id: this.user.id, state: 'playing' };
    this._subscribeRoom(code.toUpperCase());
    return this._room;
  },

  _subscribeRoom(code) {
    if (this._channel) _sb.removeChannel(this._channel);
    this._channel = _sb
      .channel('room:' + code)
      .on('broadcast', { event: 'game' }, ({ payload }) => {
        this._emit('room_msg', payload);
      })
      .subscribe();
  },

  async sendRoomMsg(payload) {
    if (!this._channel) return;
    await this._channel.send({
      type: 'broadcast',
      event: 'game',
      payload,
    });
  },

  async leaveRoom() {
    if (this._channel) { _sb.removeChannel(this._channel); this._channel=null; }
    if (this._room) {
      await _sb.from('game_sessions')
        .update({ state: 'finished' })
        .eq('room_code', this._room.room_code);
      this._room = null;
    }
  },

  isPlayer1() {
    return this._room?.player1_id === this.user?.id;
  },

  // ── USERNAME UPDATE ──
  async setUsername(username) {
    if (!this.user) return false;
    const { error } = await _sb.from('players')
      .update({ username })
      .eq('user_id', this.user.id);
    if (!error && this.profile) this.profile.username = username;
    return !error;
  },

  // ── EVENTS ──
  on(event, cb) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
  },
  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== cb);
  },
  _emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
  },

  // ── DEATH SCREENSHOT (Canvas) ──
  captureScreenshot(canvas) {
    try { return canvas.toDataURL('image/png'); } catch { return null; }
  },

  async shareScreenshot(canvas, score, game) {
    const img = this.captureScreenshot(canvas);
    if (!img) return;
    const text = `I scored ${score} in ${game} on PlayZone! Can you beat me? 🎮`;
    if (navigator.share) {
      try {
        const blob = await (await fetch(img)).blob();
        const file = new File([blob], 'playzone.png', { type: 'image/png' });
        await navigator.share({ title: 'PlayZone', text, files: [file] });
      } catch {
        // fallback: copy link
        navigator.clipboard?.writeText(location.href + ' — ' + text);
      }
    } else {
      navigator.clipboard?.writeText(location.href + ' — ' + text);
      this._emit('toast', '📋 Score copied to clipboard!');
    }
  },

  // ── DAILY CHALLENGE ──
  getDailyChallenge(game) {
    const day = new Date().toISOString().split('T')[0];
    const seed = day.split('-').reduce((a,b) => a + parseInt(b), 0);
    const challenges = {
      bullethead: [
        { id:'pistol_only',  title:'Pistol Only',    desc:'Kill 10 enemies with only the Pistol',   target:10  },
        { id:'no_jump',      title:'No Jump!',        desc:'Reach level 5 without jumping',          target:5   },
        { id:'speed_run',    title:'Speed Run',       desc:'Reach level 3 in under 2 minutes',       target:180 },
        { id:'boss_solo',    title:'Boss Slayer',     desc:'Defeat the boss without dying',          target:1   },
        { id:'coin_rush',    title:'Coin Rush',       desc:'Collect 200 coins in one run',           target:200 },
      ],
      contra: [
        { id:'no_dash',      title:'No Dash!',        desc:'Complete the level without using dash',  target:1   },
        { id:'tank_killer',  title:'Tank Killer',     desc:'Destroy 3 tanks',                        target:3   },
        { id:'sniper_rush',  title:'Sniper Rush',     desc:'Kill 5 snipers',                         target:5   },
        { id:'speed_contra', title:'Speed Run',       desc:'Finish in under 3 minutes',              target:180 },
        { id:'no_hit',       title:'Pacifist',        desc:'Reach the boss without taking damage',   target:1   },
      ],
    };
    const list = challenges[game] || challenges.bullethead;
    return list[seed % list.length];
  },

  // ── TOAST helper ──
  showToast(msg, color = '#00ff88') {
    this._emit('toast', { msg, color });
  },

};

// Auto-init
PZ.init();
