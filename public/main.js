/* =================================================================
   모바일 청첩장 — 바닐라 JS (템플릿 공용)
   각 템플릿 HTML이 window.INVITE를 정의한 뒤 이 파일을 로드합니다.
   ================================================================= */

const INVITE = window.INVITE || {
  groom: { name: '홍길동', father: '홍판서', mother: '김춘섬', order: '장남' },
  bride: { name: '이영희', father: '이대감', mother: '박소사', order: '장녀' },
  date: new Date('2026-11-14T15:30:00+09:00'),
  venue: {
    name: '웨딩홀 이름',
    hall: '그랜드볼룸',
    address: '서울특별시 강남구 테헤란로 123',
    lat: 37.5065,
    lng: 127.0536,
  },
  shareUrl: 'https://your-domain.com',
  accounts: [
    { side: '신랑', name: '홍판서', bank: '은행명', number: '000-000000-00-000' },
    { side: '신랑', name: '홍길동', bank: '은행명', number: '000-000000-00-000' },
    { side: '신부', name: '이영희', bank: '은행명', number: '000-000000-00-000' },
  ],
  photos: {
    main: 'images/main.webp',
    gallery: [
      'images/gallery/01.webp','images/gallery/02.webp','images/gallery/03.webp',
      'images/gallery/04.webp','images/gallery/05.webp','images/gallery/06.webp',
      'images/gallery/07.webp','images/gallery/08.webp','images/gallery/09.webp',
    ],
  },
};

// ─── 상수 ────────────────────────────────────────────────────────
const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
// 영문 약자 (필요 시 사용)
const MONTHS_EN_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ─── 헬퍼 ────────────────────────────────────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function pad2(n) { return String(n).padStart(2, '0'); }

// safe text setter — element이 없으면 무시
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

// ─── 1) 캘린더 렌더 ────────────────────────────────────────────────
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

// ─── 2) 카운트다운 ───────────────────────────────────────────────
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

// ─── 3) 큰글씨 모드 (localStorage 영속화) ───────────────────────────
function setupLargeText() {
  const btn = $('#largeTextToggle');
  if (!btn) return;
  const KEY = 'wedding.largeText';
  let on = localStorage.getItem(KEY) === '1';
  apply();

  btn.addEventListener('click', () => {
    on = !on;
    localStorage.setItem(KEY, on ? '1' : '0');
    apply();
  });

  function apply() {
    document.documentElement.style.setProperty('--scale', on ? '1.35' : '1');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

// ─── 4) 공유 시트 ────────────────────────────────────────────────
function setupShareSheet() {
  const modal = $('#shareModal');
  if (!modal) return;
  const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; };
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };

  $('#shareTopBtn')?.addEventListener('click', open);
  $('#shareBottomBtn')?.addEventListener('click', open);
  modal.addEventListener('click', e => {
    if (e.target.dataset.close !== undefined) close();
  });

  // URL 텍스트
  setText('#shareUrl', INVITE.shareUrl);

  // URL 복사
  $('#copyUrlBtn')?.addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(INVITE.shareUrl);
      e.currentTarget.classList.add('copied');
      e.currentTarget.textContent = '복사됨';
      setTimeout(() => {
        e.currentTarget.classList.remove('copied');
        e.currentTarget.textContent = 'URL 복사';
      }, 1600);
    } catch {
      showToast('복사에 실패했습니다');
    }
  });

  // 공유 옵션
  $$('.share-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.share;
      const title = `${INVITE.groom.name} ♡ ${INVITE.bride.name} 결혼합니다`;
      const text = `${formatYmd(INVITE.date)} ${formatTimeKo(INVITE.date)}\n${INVITE.venue.name}`;
      const url = INVITE.shareUrl;

      if (kind === 'more' && navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
        return;
      }
      if (kind === 'sms') {
        window.location.href = `sms:?body=${encodeURIComponent(`${title}\n${text}\n${url}`)}`;
        return;
      }
      if (kind === 'mail') {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        return;
      }
      if (kind === 'kakao') {
        // TODO: 카카오 JavaScript SDK 연동 후 Kakao.Share.sendDefault 호출
        showToast('카카오톡 공유는 카카오 SDK 연동 후 사용 가능합니다');
        return;
      }
    });
  });
}

function formatYmd(d) {
  return `${d.getFullYear()}. ${pad2(d.getMonth() + 1)}. ${pad2(d.getDate())}.`;
}

// ─── 5) 주소 복사 ────────────────────────────────────────────────
function setupAddressCopy() {
  const btn = $('#copyAddressBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const label = btn.querySelector('.copy-label');
    try {
      await navigator.clipboard.writeText(INVITE.venue.address);
      btn.classList.add('copied');
      label.textContent = '복사됨';
      setTimeout(() => {
        btn.classList.remove('copied');
        label.textContent = '복사';
      }, 1600);
    } catch {
      showToast('복사에 실패했습니다');
    }
  });
}

// ─── 6) 지도 딥링크 ──────────────────────────────────────────────
function setupMapLinks() {
  const v = INVITE.venue;
  const enc = encodeURIComponent(v.name);

  const links = {
    naver: {
      app: '네이버지도',
      deeplink: `nmap://place?lat=${v.lat}&lng=${v.lng}&name=${enc}&appname=wedding.invite`,
      web: `https://map.naver.com/v5/search/${enc}`,
    },
    kakao: {
      app: '카카오맵',
      deeplink: `kakaomap://look?p=${v.lat},${v.lng}`,
      web: `https://map.kakao.com/link/to/${enc},${v.lat},${v.lng}`,
    },
    tmap: {
      app: '티맵',
      // 주의: tmap은 x=lng, y=lat
      deeplink: `tmap://route?goalname=${enc}&goalx=${v.lng}&goaly=${v.lat}`,
      web: `https://tmap.life/`,
    },
  };

  $$('.map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cfg = links[btn.dataset.map];
      if (!cfg) return;
      openMapModal(cfg);
    });
  });

  const modal = $('#mapModal');
  if (!modal) return;
  modal.addEventListener('click', e => {
    if (e.target.dataset.close !== undefined) closeMapModal();
  });
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
  const ua = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

  if (!isMobile) {
    window.open(cfg.web, '_blank');
    return;
  }

  // 모바일: 딥링크 시도 + 일정 시간 후 폴백
  const start = Date.now();
  const timer = setTimeout(() => {
    if (Date.now() - start < 2000 && !document.hidden) {
      window.location.href = cfg.web;
    }
  }, 1500);

  const onHide = () => {
    if (document.hidden) clearTimeout(timer);
    document.removeEventListener('visibilitychange', onHide);
  };
  document.addEventListener('visibilitychange', onHide);

  window.location.href = cfg.deeplink;
}

// "열기" 버튼 핸들러
function setupMapOpen() {
  $('#mtOpenBtn')?.addEventListener('click', () => {
    if (_currentMap) openMapApp(_currentMap);
    closeMapModal();
  });
}

// ─── 7) 토스트 ───────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

// ─── ESC 키로 모달 닫기 ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const sm = $('#shareModal');
    const mm = $('#mapModal');
    if (!sm.hidden) { sm.hidden = true; document.body.style.overflow = ''; }
    if (!mm.hidden) closeMapModal();
  }
});

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

function renderAccounts() {
  const el = $('#accounts');
  if (!el || !INVITE.accounts?.length) return;
  const groups = {};
  INVITE.accounts.forEach(a => {
    if (!groups[a.side]) groups[a.side] = [];
    groups[a.side].push(a);
  });
  el.innerHTML = Object.entries(groups).map(([side, list]) => `
    <div class="acc-group">
      <div class="acc-side-label">${side}측</div>
      ${list.map(a => `
        <div class="acc-row">
          <div class="acc-info">
            <span class="acc-name">${a.name}</span>
            <span class="acc-bank">${a.bank}</span>
            <span class="acc-num">${a.number}</span>
          </div>
          <button class="acc-copy" type="button" data-number="${a.number}">복사</button>
        </div>`).join('')}
    </div>`).join('');
  el.querySelectorAll('.acc-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.number);
        btn.textContent = '복사됨';
        setTimeout(() => { btn.textContent = '복사'; }, 1600);
      } catch { showToast('복사에 실패했습니다'); }
    });
  });
}

function renderPhotos() {
  const p = INVITE.photos;
  if (!p) return;
  if (p.main) $$('[data-photo="main"]').forEach(el => { el.src = p.main; });
  (p.gallery || []).forEach((src, i) => {
    $$(`[data-photo="gallery-${i + 1}"]`).forEach(el => { el.src = src; });
  });
}

// ─── init ───────────────────────────────────────────────────────
function init() {
  preventPinchZoom();
  showTemplateIndicator();
  renderCalendar();
  renderAccounts();
  renderPhotos();
  renderCountdown();
  setInterval(renderCountdown, 1000);
  setupLargeText();
  setupShareSheet();
  setupAddressCopy();
  setupMapLinks();
  setupMapOpen();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
