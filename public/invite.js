// invite.js — 청첩장 UI 렌더링 + 인터랙션 (순수 JS)

const DAYS_KO   = ['일','월','화','수','목','금','토'];
const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function formatDateKo(d) {
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${DAYS_KO[d.getDay()]}요일`;
}
function formatTimeKo(d) {
  const h = d.getHours(), m = d.getMinutes();
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h < 12 ? '오전' : '오후'} ${h12}시${m ? ' ' + m + '분' : ''}`;
}
function pad(n) { return String(n).padStart(2, '0'); }

// ─────────────────────────────────────────────────────────────
// renderInvite — 데이터를 DOM에 채움
// ─────────────────────────────────────────────────────────────
function renderInvite(data) {
  const d = data.date;

  // OG 메타
  document.title = `${data.groom.name} ♡ ${data.bride.name}`;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = document.title;

  // Cover
  const mediaEl = document.getElementById('cover-media');
  if (data.photoUrl) {
    const img = document.createElement('img');
    img.src = data.photoUrl;
    img.alt = 'couple';
    img.className = 'cover-photo';
    mediaEl.appendChild(img);
  } else {
    mediaEl.innerHTML = `<div class="cover-photo-placeholder"><span>──────────</span><span>main couple photo</span><span>──────────</span></div>`;
  }

  document.getElementById('groom-name').textContent = data.groom.name;
  document.getElementById('bride-name').textContent = data.bride.name;
  document.getElementById('cover-date').innerHTML =
    `${d.getFullYear()}. ${pad(d.getMonth()+1)}. ${pad(d.getDate())}<br>
     ${DAYS_KO[d.getDay()]}요일 ${formatTimeKo(d)}<br>
     <span class="muted">${data.venue.name} · ${data.venue.hall}</span>`;

  // Greeting
  document.getElementById('greeting-title').textContent = data.greeting.title;
  document.getElementById('greeting-body').textContent  = data.greeting.body;
  document.getElementById('parents-groom').innerHTML =
    `<span class="side-label">신랑측</span>${data.groom.father} · ${data.groom.mother}<br><span class="child-name">${data.groom.order} ${data.groom.name}</span>`;
  document.getElementById('parents-bride').innerHTML =
    `<span class="side-label">신부측</span>${data.bride.father} · ${data.bride.mother}<br><span class="child-name">${data.bride.order} ${data.bride.name}</span>`;

  // DateCard
  document.getElementById('month-header').textContent = `${MONTHS_EN[d.getMonth()]} ${d.getFullYear()}`;
  document.getElementById('calendar').innerHTML = buildCalendar(d);
  document.getElementById('full-date').innerHTML =
    `${formatDateKo(d)}<br><span class="muted">${formatTimeKo(d)}</span>`;

  // Countdown label
  document.getElementById('countdown-label').innerHTML =
    `${data.groom.name} <span class="accent">♡</span> ${data.bride.name} 결혼식까지`;

  // Location
  document.getElementById('venue-name').textContent   = data.venue.name;
  document.getElementById('venue-hall').textContent   = data.venue.hall;
  document.getElementById('venue-address').textContent = data.venue.address;
  document.getElementById('map-pin-label').textContent = data.venue.name;

  // 지도 버튼
  const enc = encodeURIComponent(data.venue.name);
  const { lat, lng } = data.venue;
  const maps = [
    { logo: 'N', label: '네이버지도', sub: '길찾기', bg: '#03C75A', fg: '#fff',
      deeplink: `nmap://place?lat=${lat}&lng=${lng}&name=${enc}&appname=wedding.invite`,
      web: `https://map.naver.com/v5/search/${enc}` },
    { logo: 'K', label: '카카오맵', sub: '길찾기', bg: '#FEE500', fg: '#191919',
      deeplink: `kakaomap://look?p=${lat},${lng}`,
      web: `https://map.kakao.com/link/to/${enc},${lat},${lng}` },
    { logo: 'T', label: '티맵', sub: '내비게이션', bg: '#0064FF', fg: '#fff',
      deeplink: `tmap://route?goalname=${enc}&goalx=${lng}&goaly=${lat}`,
      web: 'https://tmap.life' },
  ];
  document.getElementById('map-btns').innerHTML = maps.map(m =>
    `<button class="map-btn" onclick="openMap('${m.deeplink}','${m.web}')">
       <div class="map-btn-icon" style="background:${m.bg};color:${m.fg}">${m.logo}</div>
       <div class="map-btn-label">${m.label}</div>
       <div class="map-btn-sub">${m.sub}</div>
     </button>`
  ).join('');

  // 교통편
  const transport = data.transport || [];
  if (transport.length) {
    const card = document.getElementById('transport-card');
    card.innerHTML = transport.map(t =>
      `<div class="transport-row"><div class="transport-label">${t.label}</div><div class="transport-text">${t.text}</div></div>`
    ).join('');
    card.classList.remove('hidden');
  }

  // Footer
  document.getElementById('footer-msg').textContent =
    data.footer || '저희의 새로운 시작을\n함께 축복해 주세요';

  // 주소 복사 버튼
  initCopyAddress(data.venue.address);

  // 공유 시트 URL
  const shareUrl = data.shareUrl || location.href;
  document.getElementById('share-url-text').textContent = shareUrl;
  initShareSheet(data, shareUrl);
}

// ─────────────────────────────────────────────────────────────
// buildCalendar — 달력 HTML 생성
// ─────────────────────────────────────────────────────────────
function buildCalendar(date) {
  const year = date.getFullYear(), month = date.getMonth(), targetDay = date.getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const headers = ['S','M','T','W','T','F','S'].map((v, i) => {
    const color = i === 0 ? '#C97B6A' : i === 6 ? '#7A8FA6' : '#8A8378';
    return `<div style="color:${color}">${v}</div>`;
  }).join('');

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(`<div class="cal-cell"></div>`);
  for (let n = 1; n <= daysInMonth; n++) {
    const dow = (firstDow + n - 1) % 7;
    const isTarget = n === targetDay;
    const cls = isTarget ? 'target' : dow === 0 ? 'sun' : dow === 6 ? 'sat' : 'normal';
    cells.push(`<div class="cal-cell"><span class="cal-day ${cls}">${n}</span></div>`);
  }
  while (cells.length % 7) cells.push(`<div class="cal-cell"></div>`);

  return `<div class="cal-header">${headers}</div><div class="cal-grid">${cells.join('')}</div>`;
}

// ─────────────────────────────────────────────────────────────
// startCountdown — 1초마다 카운트다운 업데이트
// ─────────────────────────────────────────────────────────────
function startCountdown(targetDate) {
  function update() {
    const now  = Date.now();
    const diff = Math.max(0, targetDate.getTime() - now);
    const passed = targetDate < new Date();

    document.getElementById('dday-label').textContent =
      passed ? 'Married' : `D-${Math.floor(diff / 86400000)}`;

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  /   60000);
    const seconds = Math.floor((diff %   60000)  /    1000);

    document.getElementById('cnt-days').textContent  = pad(days);
    document.getElementById('cnt-hours').textContent = pad(hours);
    document.getElementById('cnt-min').textContent   = pad(minutes);
    document.getElementById('cnt-sec').textContent   = pad(seconds);
  }
  update();
  setInterval(update, 1000);
}

// ─────────────────────────────────────────────────────────────
// initLargeText — 큰글씨 토글 (localStorage 유지)
// ─────────────────────────────────────────────────────────────
function initLargeText() {
  const invite = document.getElementById('invite');
  const btn    = document.getElementById('btn-large-text');
  let large = localStorage.getItem('wedding.largeText') === 'true';

  function apply() {
    invite.classList.toggle('large-text', large);
    btn.classList.toggle('active', large);
  }
  apply();

  btn.addEventListener('click', () => {
    large = !large;
    localStorage.setItem('wedding.largeText', large);
    apply();
  });
}

// ─────────────────────────────────────────────────────────────
// initCopyAddress — 주소 복사 버튼
// ─────────────────────────────────────────────────────────────
function initCopyAddress(address) {
  const btn = document.getElementById('btn-copy-addr');
  btn.addEventListener('click', () => {
    navigator.clipboard?.writeText(address);
    btn.querySelector('span').textContent = '복사됨';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.querySelector('span').textContent = '복사';
      btn.classList.remove('copied');
    }, 1600);
  });
}

// ─────────────────────────────────────────────────────────────
// initShareSheet — 공유 모달
// ─────────────────────────────────────────────────────────────
function initShareSheet(data, url) {
  const overlay = document.getElementById('share-overlay');

  function open() { overlay.classList.remove('hidden'); }
  function close() { overlay.classList.add('hidden'); }

  document.getElementById('btn-share-top').addEventListener('click', open);
  document.getElementById('btn-share-footer').addEventListener('click', open);
  document.getElementById('btn-close-share').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  // 공유 옵션
  const options = [
    { label: '카카오톡', color: '#FEE500', fg: '#191919', sub: '카카오톡',
      action: () => { window.Kakao?.Share?.sendDefault({ objectType: 'feed', content: { title: `${data.groom.name} ♡ ${data.bride.name}`, description: `${data.date.toLocaleDateString('ko-KR')} ${data.venue.name}`, link: { mobileWebUrl: url, webUrl: url } } }); } },
    { label: 'Msg', color: '#5AC8FA', fg: '#fff', sub: '문자',
      action: () => { location.href = `sms:?body=${encodeURIComponent(`청첩장을 보내드립니다\n${url}`)}`; } },
    { label: '@', color: '#34C759', fg: '#fff', sub: '메일',
      action: () => { location.href = `mailto:?subject=${encodeURIComponent('청첩장')}&body=${encodeURIComponent(url)}`; } },
    { label: '···', color: '#8A8378', fg: '#fff', sub: '더보기',
      action: () => { navigator.share?.({ title: `${data.groom.name} ♡ ${data.bride.name}`, url }); } },
  ];
  document.getElementById('share-options').innerHTML = options.map((o, i) =>
    `<div class="share-opt" data-idx="${i}">
       <div class="share-opt-icon" style="background:${o.color};color:${o.fg}">${o.label}</div>
       <div class="share-opt-label">${o.sub}</div>
     </div>`
  ).join('');
  document.getElementById('share-options').addEventListener('click', e => {
    const opt = e.target.closest('[data-idx]');
    if (opt) options[+opt.dataset.idx].action();
  });

  // URL 복사
  const copyBtn = document.getElementById('btn-copy-url');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard?.writeText(url);
    copyBtn.textContent = '복사됨';
    copyBtn.classList.add('copied');
    setTimeout(() => { copyBtn.textContent = 'URL 복사'; copyBtn.classList.remove('copied'); }, 1600);
  });
}

// ─────────────────────────────────────────────────────────────
// openMap — 지도 딥링크 (모바일: 앱 → fallback, 데스크톱: 웹)
// ─────────────────────────────────────────────────────────────
function openMap(deeplink, fallback) {
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    window.open(fallback, '_blank');
    return;
  }
  const timer = setTimeout(() => { location.href = fallback; }, 1500);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
  }, { once: true });
  location.href = deeplink;
}
