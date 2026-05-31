const INVITE = window.INVITE || {
  groom: { name: '홍길동', father: '홍판서', mother: '김춘섬', order: '장남' },
  bride: { name: '이영희', father: '이대감', mother: '박소사', order: '장녀' },
  date: new Date('2026-11-14T15:30:00+09:00'),
  venue: {
    name: '웨딩홀 이름', hall: '그랜드볼룸',
    address: '서울특별시 강남구 테헤란로 123',
    lat: 37.5065, lng: 127.0536,
  },
  accounts: {
    groom: [
      { role: '신랑', name: '홍길동', bank: '은행명', number: '000-000000-00-000' },
      { role: '아버지', name: '홍판서', bank: '은행명', number: '000-000000-00-000' },
      { role: '어머니', name: '김춘섬', bank: '은행명', number: '000-000000-00-000' },
    ],
    bride: [
      { role: '신부', name: '이영희', bank: '은행명', number: '000-000000-00-000' },
    ],
  },
  shareUrl: 'https://your-domain.com',
  photos: {
    main: 'images/main.webp',
    gallery: [
      'images/gallery/01.webp','images/gallery/02.webp','images/gallery/03.webp',
      'images/gallery/04.webp','images/gallery/05.webp','images/gallery/06.webp',
      'images/gallery/07.webp','images/gallery/08.webp','images/gallery/09.webp',
    ],
  },
};

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const MONTHS_EN_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function pad2(n) { return String(n).padStart(2, '0'); }

function setText(sel, text) {
  const el = $(sel);
  if (el) el.textContent = text;
}

function formatTimeKo(d) {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${ampm} ${h12}시${m ? ' ' + m + '분' : ''}`;
}

function renderCalendar() {
  const d = INVITE.date;
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  setText('[data-month-en]', `${MONTHS_KO[month]} ${year}`);
  setText('[data-month-ko]', `${MONTHS_KO[month]}`);
  setText('[data-month-en-short]', MONTHS_EN_SHORT[month]);
  setText('[data-date-full]', `${year}년 ${month + 1}월 ${day}일 ${DAYS_KO[d.getDay()]}요일`);
  setText('[data-time-ko]', formatTimeKo(d));
  setText('[data-date-ymd]', `${year}. ${pad2(month + 1)}. ${pad2(day)}`);
  setText('[data-date-dow-time]', `${DAYS_KO[d.getDay()]}요일 ${formatTimeKo(d)}`);
  setText('[data-venue]', `${INVITE.venue.name} · ${INVITE.venue.hall}`);
  setText('[data-groom-name]', INVITE.groom.name);
  setText('[data-bride-name]', INVITE.bride.name);
  setText('[data-couple]', `${INVITE.groom.name} · ${INVITE.bride.name}`);
  setText('[data-day-num]', String(day));
  setText('[data-month-num]', String(month + 1));
  setText('[data-year-num]', String(year));

  const grid = $('#calGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  cells.forEach((n, i) => {
    const dow = i % 7;
    const cell = document.createElement('div');
    cell.className = `cal-cell dow-${dow}`;
    if (n === day) cell.classList.add('is-target');
    if (n !== null) {
      const num = document.createElement('span');
      num.className = 'cal-num';
      num.textContent = n;
      cell.appendChild(num);
    }
    grid.appendChild(cell);
  });
}

function renderCountdown() {
  const target = INVITE.date.getTime();
  const now = Date.now();
  let diff = Math.max(0, target - now);

  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);

  setText('#cdDays', pad2(days));
  setText('#cdHours', pad2(hours));
  setText('#cdMin', pad2(minutes));
  setText('#cdSec', pad2(seconds));
  setText('#cdDday', target < now ? '결혼' : `결혼식까지 ${days}일`);
}

function setupLargeText() {
  const btn = $('#largeTextToggle');
  if (!btn) return;
  const KEY = 'wedding.largeText';
  let on = localStorage.getItem(KEY) === '1';
  apply();
  btn.addEventListener('click', () => { on = !on; localStorage.setItem(KEY, on ? '1' : '0'); apply(); });
  function apply() {
    document.documentElement.style.setProperty('--scale', on ? '1.28' : '1');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

function formatYmd(d) {
  return `${d.getFullYear()}. ${pad2(d.getMonth() + 1)}. ${pad2(d.getDate())}.`;
}

function setupShareSheet() {
  const modal = $('#shareModal');
  if (!modal) return;
  const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };

  $('#shareTopBtn')?.addEventListener('click', open);
  $('#shareBottomBtn')?.addEventListener('click', open);
  modal.addEventListener('click', e => { if (e.target.dataset.close !== undefined) close(); });

  setText('#shareUrl', INVITE.shareUrl);

  $('#copyUrlBtn')?.addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(INVITE.shareUrl);
      e.currentTarget.classList.add('copied');
      e.currentTarget.textContent = '복사됨';
      setTimeout(() => { e.currentTarget.classList.remove('copied'); e.currentTarget.textContent = 'URL 복사'; }, 1600);
    } catch { showToast('복사에 실패했습니다'); }
  });

  $$('.share-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.share;
      const title = `${INVITE.groom.name} ♡ ${INVITE.bride.name} 결혼합니다`;
      const text = `${formatYmd(INVITE.date)} ${formatTimeKo(INVITE.date)}\n${INVITE.venue.name}`;
      const url = INVITE.shareUrl;
      if (kind === 'more' && navigator.share) { navigator.share({ title, text, url }).catch(() => {}); return; }
      if (kind === 'sms') { window.location.href = `sms:?body=${encodeURIComponent(`${title}\n${text}\n${url}`)}`; return; }
      if (kind === 'mail') { window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`; return; }
      if (kind === 'kakao') { showToast('카카오톡 공유는 카카오 SDK 연동 후 사용 가능합니다'); return; }
    });
  });
}

function setupAddressCopy() {
  const btn = $('#copyAddressBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const label = btn.querySelector('.copy-label');
    try {
      await navigator.clipboard.writeText(INVITE.venue.address);
      btn.classList.add('copied');
      label.textContent = '복사됨';
      setTimeout(() => { btn.classList.remove('copied'); label.textContent = '복사'; }, 1600);
    } catch { showToast('복사에 실패했습니다'); }
  });
}

function setupMapLinks() {
  const v = INVITE.venue;
  const enc = encodeURIComponent(v.name);
  const links = {
    naver: { app: '네이버지도', deeplink: `nmap://place?lat=${v.lat}&lng=${v.lng}&name=${enc}&appname=wedding.invite`, web: `https://map.naver.com/v5/search/${enc}` },
    kakao: { app: '카카오맵', deeplink: `kakaomap://look?p=${v.lat},${v.lng}`, web: `https://map.kakao.com/link/to/${enc},${v.lat},${v.lng}` },
    tmap:  { app: '티맵', deeplink: `tmap://route?goalname=${enc}&goalx=${v.lng}&goaly=${v.lat}`, web: `https://tmap.life/` },
  };
  $$('.map-btn').forEach(btn => {
    btn.addEventListener('click', () => { const cfg = links[btn.dataset.map]; if (cfg) openMapModal(cfg); });
  });
  const modal = $('#mapModal');
  if (modal) modal.addEventListener('click', e => { if (e.target.dataset.close !== undefined) closeMapModal(); });
}

let _currentMap = null;
function openMapModal(cfg) {
  _currentMap = cfg;
  setText('#mtAppName', cfg.app);
  setText('#mtDeeplink', cfg.deeplink);
  setText('#mtFallback', cfg.web);
  const m = $('#mapModal');
  if (m) { m.hidden = false; document.body.style.overflow = 'hidden'; }
}
function closeMapModal() {
  const m = $('#mapModal');
  if (m) m.hidden = true;
  document.body.style.overflow = '';
  _currentMap = null;
}
function openMapApp(cfg) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) { window.open(cfg.web, '_blank'); return; }
  const start = Date.now();
  const timer = setTimeout(() => { if (Date.now() - start < 2000 && !document.hidden) window.location.href = cfg.web; }, 1500);
  const onHide = () => { if (document.hidden) clearTimeout(timer); document.removeEventListener('visibilitychange', onHide); };
  document.addEventListener('visibilitychange', onHide);
  window.location.href = cfg.deeplink;
}

function setupMapOpen() {
  $('#mtOpenBtn')?.addEventListener('click', () => { if (_currentMap) openMapApp(_currentMap); closeMapModal(); });
}

let toastTimer = null;
function showToast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const sm = $('#shareModal');
    const mm = $('#mapModal');
    if (sm && !sm.hidden) { sm.hidden = true; document.body.style.overflow = ''; }
    if (mm && !mm.hidden) closeMapModal();
  }
});

function renderAccounts() {
  const root = $('[data-accounts]');
  if (!root || !INVITE.accounts) return;
  const groups = [
    { key: 'groom', label: '신랑측', list: INVITE.accounts.groom || [] },
    { key: 'bride', label: '신부측', list: INVITE.accounts.bride || [] },
  ];
  root.innerHTML = groups.map(g => `
    <div class="acc-group" data-acc-group>
      <button class="acc-head" type="button" data-acc-toggle aria-expanded="false">
        <span class="acc-head-label">${g.label}</span>
        <span class="acc-chevron" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <div class="acc-body"><div class="acc-body-inner">
        ${g.list.map(a => `
          <div class="acc-row">
            <div class="acc-info">
              <div class="acc-role">${a.role} <strong>${a.name}</strong></div>
              <div class="acc-num">${a.bank} ${a.number}</div>
            </div>
            <button class="acc-copy" type="button" data-acc-copy="${a.bank} ${a.number}">복사</button>
          </div>`).join('')}
      </div></div>
    </div>`).join('');

  $$('[data-acc-toggle]', root).forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-acc-group]');
      const open = group.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  $$('[data-acc-copy]', root).forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.accCopy);
        btn.classList.add('copied');
        const orig = btn.textContent;
        btn.textContent = '복사됨';
        showToast('계좌번호가 복사되었습니다');
        setTimeout(() => { btn.classList.remove('copied'); btn.textContent = orig; }, 1600);
      } catch { showToast('복사에 실패했습니다'); }
    });
  });
}

const EASE = 'cubic-bezier(0.22,0.61,0.36,1)';
const PREFERS_REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function injectFxStyle() {
  if (document.getElementById('__fx-style')) return;
  const st = document.createElement('style');
  st.id = '__fx-style';
  st.textContent = `
    .fx { opacity: 0; transform: translateY(28px); transition: opacity .85s ${EASE}, transform .85s ${EASE}; }
    .fx-hero { transform: translateY(22px); transition: opacity 1s ${EASE}, transform 1s ${EASE}; }
    .fx.fx-in { opacity: 1 !important; transform: none !important; }
  `;
  document.head.appendChild(st);
}

function revealWhenVisible(els, { stagger = 0.08, failsafe = 2400 } = {}) {
  const show = el => el.classList.add('fx-in');
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const i = parseInt(e.target.dataset.fxIndex || '0', 10);
      e.target.style.transitionDelay = Math.min(i, 5) * stagger + 's';
      show(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
  setTimeout(() => els.forEach(show), failsafe);
}

function setupHeroIntro() {
  const hero = $('.cover') || $('.hero');
  if (!hero) return;
  let items = [...hero.children].filter(el => !el.matches('script, style'));
  const overlay = hero.querySelector('.hero-overlay');
  if (overlay) {
    items = items.filter(el => el !== overlay).concat([...overlay.children].filter(el => !el.matches('script, style, svg')));
  }
  if (!items.length || PREFERS_REDUCE) return;
  injectFxStyle();
  items.forEach((el, i) => { el.classList.add('fx', 'fx-hero'); el.dataset.fxIndex = i; el.style.transitionDelay = (0.1 + i * 0.13) + 's'; });
  setTimeout(() => items.forEach(el => el.classList.add('fx-in')), 60);
  setTimeout(() => items.forEach(el => el.classList.add('fx-in')), 1200);
}

function setupReveal() {
  if (PREFERS_REDUCE) return;
  const sections = $$('section').filter(s => !s.matches('.cover, .hero'));
  const blocks = [];
  sections.forEach(sec => {
    [...sec.children].filter(el => !el.matches('script, style')).forEach((el, i) => { el.dataset.fxIndex = i; blocks.push(el); });
  });
  if (!blocks.length) return;
  injectFxStyle();
  blocks.forEach(el => el.classList.add('fx'));
  revealWhenVisible(blocks);
}

function setupParallax() {
  if (PREFERS_REDUCE) return;
  const sel = ['.hero-img', '.hero-photo img', '.cover .hero-photo img', '.gallery img', '.gallery-grid img', '.gallery-grid-9 img', '.g-grid img', '.g-grid-9 img', '.gallery-strip img', '[data-parallax]'].join(',');
  const imgs = [...new Set($$(sel))];
  if (!imgs.length) return;
  imgs.forEach(img => {
    const isHero = img.classList.contains('hero-img') || img.closest('.hero-photo') || img.closest('.hero') || img.closest('.cover');
    img.dataset.pAmt = isHero ? '22' : '11';
    img.style.willChange = 'auto';
  });
  let ticking = false;
  function update() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    imgs.forEach(img => {
      const r = img.getBoundingClientRect();
      if (r.bottom < -140 || r.top > vh + 140) return;
      const center = r.top + r.height / 2;
      const prog = (vh / 2 - center) / (vh / 2 + r.height / 2);
      const y = 50 - prog * (parseFloat(img.dataset.pAmt) || 11);
      img.style.objectPosition = `50% ${y.toFixed(2)}%`;
    });
    ticking = false;
  }
  function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

function renderPhotos() {
  if (!INVITE.photos) return;
  const mainImg = $('[data-photo="main"]');
  if (mainImg && INVITE.photos.main) mainImg.src = INVITE.photos.main;
  const gallery = INVITE.photos.gallery || [];
  gallery.forEach((url, i) => {
    const img = $(`[data-photo="gallery-${i}"]`);
    if (img) img.src = url;
  });
}

function preventPinchZoom() {
  document.addEventListener('touchmove', e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });
}

function showTemplateIndicator() {
  const host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return;
  const link = document.querySelector('link[href*="styles-"]');
  if (!link) return;
  const m = link.href.match(/styles-([a-d])\.css/);
  if (!m) return;
  const pill = document.createElement('div');
  pill.textContent = `Template ${m[1].toUpperCase()}`;
  pill.style.cssText = 'position:fixed;bottom:16px;right:16px;background:rgba(0,0,0,0.65);color:#fff;padding:4px 10px;border-radius:999px;font-size:11px;font-family:monospace;letter-spacing:1px;z-index:9999;pointer-events:none;';
  document.body.appendChild(pill);
}

function init() {
  preventPinchZoom();
  showTemplateIndicator();
  renderPhotos();
  renderCalendar();
  renderCountdown();
  setInterval(renderCountdown, 1000);
  setupLargeText();
  setupShareSheet();
  setupAddressCopy();
  setupMapLinks();
  setupMapOpen();
  renderAccounts();
  function armScrollFX() { setupHeroIntro(); setupReveal(); setupParallax(); }
  if (PREFERS_REDUCE) {
    // no animation
  } else if (document.visibilityState === 'visible') {
    armScrollFX();
  } else {
    const onVis = () => { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', onVis); armScrollFX(); } };
    document.addEventListener('visibilitychange', onVis);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
