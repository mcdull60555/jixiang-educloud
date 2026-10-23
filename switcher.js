/* ============================================================
 * 基翔學務雲：系統切換鈕
 * 放在各系統（雲點名、學習通…）頁面裡，登入後右下角會出現「切換系統」，
 * 點開可直接跳到其他系統或回學務雲首頁，不用再登入。
 *
 * 用法：在頁面最後加上
 *   <script src="https://mcdull60555.github.io/jixiang-educloud/switcher.js" data-app="rollcall" defer></script>
 * data-app：目前所在的系統（rollcall / learning / roster / tuition / accounts）
 *
 * 登入狀態來自學務雲入口寫在 sessionStorage 的 jx-me 與 jx-auth（同網域、同分頁共用）。
 * 沒有從學務雲登入（或已登出）時不顯示。
 * ============================================================ */
(function () {
  'use strict';
  if (window.__jxSwitcher) return;
  window.__jxSwitcher = true;

  var BASE = 'https://mcdull60555.github.io';
  var HOME_URL = BASE + '/jixiang-educloud/';
  // 各系統網址（測試版）。正式切換時只要改這裡和入口頁。
  var APPS = {
    rollcall: { title: '雲點名', en: 'JX CloudCheck', url: BASE + '/jixiang2017-test/rollcall/', bg: '#DBEAFE', fg: '#0F4FB8' },
    learning: { title: '學習通', en: 'JX Learning', url: BASE + '/jixiang2017-test/', bg: '#E0EAFF', fg: '#1D4ED8' },
    roster:   { title: '學生名冊', en: 'Student Roster', url: BASE + '/jixiang-educloud/roster/', bg: '#FEF3C7', fg: '#92400E' },
    tuition:  { title: '學費管理', en: 'Tuition', url: BASE + '/jixiang-educloud/tuition/', bg: '#D1FAE5', fg: '#047857' },
    tuitionFamily: { title: '學費單', en: 'Tuition', tag: '規劃中', bg: '#D1FAE5', fg: '#047857', icon: 'tuition' },
    accounts: { title: '帳號管理', en: 'Accounts', url: BASE + '/jixiang-educloud/accounts/', bg: '#E2E8F0', fg: '#334155' }
  };
  var BY_ROLE = {
    admin: ['rollcall', 'learning', 'roster', 'tuition', 'accounts'],
    teacher: ['rollcall', 'learning'],
    student: ['learning', 'tuitionFamily']
  };
  var ROLE_NAME = { admin: '管理員', teacher: '老師', student: '學生・家長' };

  var SVG = function (w, body, extra) {
    return '<svg aria-hidden="true" width="' + w + '" height="' + w + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '>' + body + '</svg>';
  };
  var ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    rollcall: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    learning: '<path d="M2 5h7a3 3 0 013 3v12a2 2 0 00-2-2H2z"/><path d="M22 5h-7a3 3 0 00-3 3v12a2 2 0 012-2h8z"/>',
    roster: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 010 7M21 20c0-2.6-1.6-4.8-4-5.6"/>',
    tuition: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    accounts: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrow: '<path d="M9 6l6 6-6 6"/>'
  };

  var script = document.currentScript;
  var current = (script && script.getAttribute('data-app')) || guessApp();

  function guessApp() {
    var p = location.pathname;
    if (/\/rollcall\/?/.test(p)) return 'rollcall';
    return 'learning';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function readMe() {
    try {
      if (!sessionStorage.getItem('jx-auth')) return null;
      var me = JSON.parse(sessionStorage.getItem('jx-me') || 'null');
      return me && BY_ROLE[me.role] ? me : null;
    } catch (e) { return null; }
  }

  var css = '' +
    '#jxsw-btn{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9500;display:flex;align-items:center;gap:8px;height:48px;padding:0 18px 0 14px;border:0;border-radius:999px;background:linear-gradient(90deg,#0F56CF,#1D8CF0);color:#fff;font:700 15px/1 "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;letter-spacing:1px;cursor:pointer;box-shadow:0 8px 22px rgba(15,86,207,.35);transition:transform .15s,box-shadow .15s}' +
    '#jxsw-btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(15,86,207,.4)}' +
    '#jxsw-btn:focus-visible,#jxsw-panel a:focus-visible,#jxsw-close:focus-visible{outline:3px solid #F5B301;outline-offset:2px}' +
    '#jxsw-btn[hidden],#jxsw-bg[hidden]{display:none}' +
    '#jxsw-bg{position:fixed;inset:0;z-index:9600;background:rgba(15,23,42,.35);display:flex;align-items:flex-end;justify-content:flex-end;padding:16px;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}' +
    '#jxsw-panel{width:340px;max-width:100%;max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(15,23,42,.3);margin-bottom:64px;animation:jxsw-in .16s ease-out}' +
    '@keyframes jxsw-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}' +
    '#jxsw-head{display:flex;align-items:center;gap:12px;padding:16px 16px 14px;background:linear-gradient(115deg,#0B4FC4,#2D8EF0);color:#fff}' +
    '#jxsw-head img{width:40px;height:40px;border-radius:11px;background:#fff;flex:0 0 40px}' +
    '#jxsw-head .t{font-weight:700;font-size:16px;letter-spacing:2px}' +
    '#jxsw-head .s{font-size:12.5px;color:#DCE9FF;margin-top:3px}' +
    '#jxsw-close{margin-left:auto;width:36px;height:36px;border:0;border-radius:10px;background:rgba(255,255,255,.16);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
    '#jxsw-close:hover{background:rgba(255,255,255,.28)}' +
    '#jxsw-list{list-style:none;margin:0;padding:10px}' +
    '#jxsw-list li+li{margin-top:4px}' +
    '#jxsw-list a,#jxsw-list .off{display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;color:#0F172A;text-decoration:none}' +
    '#jxsw-list a:hover{background:#F1F5F9}' +
    '#jxsw-list .ic{width:40px;height:40px;flex:0 0 40px;border-radius:11px;display:flex;align-items:center;justify-content:center}' +
    '#jxsw-list .nm{font-weight:700;font-size:15px}' +
    '#jxsw-list .en{font-size:12px;color:#64748B;margin-top:2px}' +
    '#jxsw-list .rt{margin-left:auto;color:#94A3B8;display:flex}' +
    '#jxsw-list .here{background:#EEF4FF;box-shadow:inset 0 0 0 1px #C7D8FB}' +
    '#jxsw-list .here .rt{color:#1D4ED8;font-size:12px;font-weight:700}' +
    '#jxsw-list .off{opacity:.55;cursor:default}' +
    '#jxsw-list .off .rt{font-size:12px;background:#F1F5F9;color:#64748B;border-radius:999px;padding:3px 8px}' +
    '#jxsw-list .sep{height:1px;background:#E2E8F0;margin:8px 6px}' +
    '@media (max-width:560px){#jxsw-btn{right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));height:46px;padding:0 14px 0 12px;font-size:14px}' +
    '#jxsw-bg{align-items:flex-end;justify-content:center;padding:0}' +
    '#jxsw-panel{width:100%;border-radius:20px 20px 0 0;margin:0;padding-bottom:env(safe-area-inset-bottom,0px);animation-name:jxsw-up}' +
    '@keyframes jxsw-up{from{transform:translateY(100%)}to{transform:none}}}' +
    '@media print{#jxsw-btn,#jxsw-bg{display:none!important}}';

  function itemHtml(key, isHome) {
    var a = isHome ? { title: '學務雲首頁', en: 'JX EduCloud', url: HOME_URL, bg: '#E8EEF9', fg: '#0B4FC4' } : APPS[key];
    var icon = SVG(22, ICONS[isHome ? 'home' : (a.icon || key)]);
    var here = !isHome && key === current;
    var body = '<span class="ic" style="background:' + a.bg + ';color:' + a.fg + '">' + icon + '</span>' +
      '<span><div class="nm">' + esc(a.title) + '</div><div class="en">' + esc(a.en) + '</div></span>';
    if (!a.url) return '<li><div class="off" aria-disabled="true">' + body + '<span class="rt">' + esc(a.tag || '尚未開放') + '</span></div></li>';
    if (here) return '<li><a class="here" href="' + esc(a.url) + '" aria-current="page">' + body + '<span class="rt">目前所在</span></a></li>';
    return '<li><a href="' + esc(a.url) + '">' + body + '<span class="rt">' + SVG(18, ICONS.arrow) + '</span></a></li>';
  }

  var btn, bg, lastFocus;

  function build() {
    var st = document.createElement('style');
    st.id = 'jxsw-style';
    st.textContent = css;
    document.head.appendChild(st);

    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'jxsw-btn';
    btn.hidden = true;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = SVG(20, ICONS.grid) + '<span>切換系統</span>';
    btn.addEventListener('click', open);

    bg = document.createElement('div');
    bg.id = 'jxsw-bg';
    bg.hidden = true;
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !bg.hidden) close(); });

    document.body.appendChild(btn);
    document.body.appendChild(bg);
    refresh();
    setInterval(refresh, 2000);          // 在系統內登出後自動隱藏
    window.addEventListener('pageshow', refresh);
  }

  function refresh() {
    var me = readMe();
    btn.hidden = !me;
    if (!me && !bg.hidden) close();
  }

  function open() {
    var me = readMe();
    if (!me) return refresh();
    var keys = BY_ROLE[me.role].slice();
    if (me.role === 'teacher' && me.fee) keys.push('tuition');   // 主任、被開通學費權限的老師
    var who = (me.name && me.role !== 'admin' ? me.name + '・' : '') + (ROLE_NAME[me.role] || '');
    bg.innerHTML =
      '<div id="jxsw-panel" role="dialog" aria-modal="true" aria-labelledby="jxsw-title">' +
        '<div id="jxsw-head">' +
          '<img src="' + HOME_URL + 'logo.png" alt="">' +
          '<div><div class="t" id="jxsw-title">切換系統</div><div class="s">' + esc(who) + '</div></div>' +
          '<button type="button" id="jxsw-close" aria-label="關閉">' + SVG(20, ICONS.close) + '</button>' +
        '</div>' +
        '<ul id="jxsw-list">' +
          keys.map(function (k) { return itemHtml(k, false); }).join('') +
          '<li class="sep" aria-hidden="true"></li>' +
          itemHtml(null, true) +
        '</ul>' +
      '</div>';
    bg.querySelector('#jxsw-close').addEventListener('click', close);
    lastFocus = document.activeElement;
    bg.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    var first = bg.querySelector('#jxsw-list a:not(.here)') || bg.querySelector('#jxsw-close');
    if (first) first.focus();
  }

  function close() {
    bg.hidden = true;
    bg.innerHTML = '';
    btn.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { /* 忽略 */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
