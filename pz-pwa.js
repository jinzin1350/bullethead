// ═══════════════════════════════════════════════
//  PlayZone PWA Init
//  Include in ALL pages
//  Registers service worker + handles install prompt
// ═══════════════════════════════════════════════

(function() {
  'use strict';

  // ── 1. Register Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[PWA] SW registered:', reg.scope);

          // چک کن آپدیت هست
          reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                // آپدیت جدید آماده‌ست
                _showUpdateBanner();
              }
            });
          });
        })
        .catch(err => console.warn('[PWA] SW registration failed:', err));
    });
  }

  // ── 2. Install Prompt (Add to Home Screen) ──
  let _installPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _installPrompt = e;
    _showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed!');
    _hideInstallBanner();
  });

  // ── 3. Install Banner ──
  function _showInstallBanner() {
    // اگه قبلاً رد کرده بودن نشون نده
    if (localStorage.getItem('pz_install_dismissed')) return;

    const banner = document.createElement('div');
    banner.id = 'pz-install-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 9999;
      background: linear-gradient(135deg, #12122a, #1a1a35);
      border-top: 1.5px solid #00b4d8;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Arial Black', Arial, sans-serif;
    `;
    banner.innerHTML = `
      <span style="font-size:28px;flex-shrink:0">🎮</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:900;color:#fff;margin-bottom:2px">
          Add PlayZone to Home Screen
        </div>
        <div style="font-size:11px;color:#666688">
          Play offline · No browser bar · Full screen
        </div>
      </div>
      <button id="pz-install-btn" style="
        padding:8px 16px;border-radius:20px;
        background:linear-gradient(135deg,#00b4d8,#00ff88);
        color:#000;font-size:12px;font-weight:900;
        border:none;cursor:pointer;flex-shrink:0;
        font-family:'Arial Black',Arial,sans-serif;
      ">Install</button>
      <button id="pz-install-dismiss" style="
        padding:8px;border-radius:50%;
        background:transparent;border:1px solid #2a2a50;
        color:#666688;font-size:14px;cursor:pointer;
        width:32px;height:32px;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;
      ">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('pz-install-btn').onclick = async () => {
      if (!_installPrompt) return;
      _installPrompt.prompt();
      const { outcome } = await _installPrompt.userChoice;
      console.log('[PWA] Install choice:', outcome);
      _hideInstallBanner();
      if (outcome === 'dismissed') {
        localStorage.setItem('pz_install_dismissed', '1');
      }
    };

    document.getElementById('pz-install-dismiss').onclick = () => {
      _hideInstallBanner();
      localStorage.setItem('pz_install_dismissed', '1');
    };
  }

  function _hideInstallBanner() {
    document.getElementById('pz-install-banner')?.remove();
  }

  // ── 4. Update Banner ──
  function _showUpdateBanner() {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 50px; left: 50%;
      transform: translateX(-50%);
      z-index: 9998;
      background: #1a1a35;
      border: 1.5px solid #00ff88;
      border-radius: 12px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: Arial, sans-serif;
      box-shadow: 0 0 20px #00ff8833;
    `;
    banner.innerHTML = `
      <span>✨</span>
      <span style="font-size:13px;color:#fff">New version available!</span>
      <button onclick="window.location.reload()" style="
        padding:6px 14px;border-radius:16px;
        background:var(--green,#00ff88);color:#000;
        font-size:12px;font-weight:700;border:none;cursor:pointer;
      ">Update</button>
    `;
    document.body.appendChild(banner);
    // 10 ثانیه بعد خودکار حذف شه
    setTimeout(() => banner.remove(), 10000);
  }

  // ── 5. Supabase Session Persistence ──
  // Supabase به‌صورت پیش‌فرض از localStorage استفاده می‌کنه
  // پس session به‌صورت خودکار ذخیره میشه
  // ما فقط مطمئن میشیم که token refresh کار می‌کنه

  // وقتی app به‌صورت PWA باز میشه
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[PWA] Running as installed PWA');
    document.documentElement.classList.add('pwa-mode');
  }

})();
