// invite.jsx — 모바일 청첩장 컴포넌트
const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// 청첩장 데이터 (수정 가능)
// ─────────────────────────────────────────────────────────────
const INVITE = {
  groom: { name: '주형민', father: '주재혁', mother: '김수수', order: '장남' },
  bride: { name: '박서경', father: '박성현', mother: '이아주', order: '장녀' },
  date: new Date('2026-11-14T15:30:00+09:00'),
  venue: {
    name: '대성호텔청남',
    hall: '5F 상화홀',
    address: '서울특별시 강남구 도산대로 442',
    lat: 37.5247,
    lng: 127.0428,
  },
  greeting: {
    title: '소중한 분들을 초대합니다',
    body: '서로 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로 지켜나갈 수 있게\n늘 축복해 주시면 감사하겠습니다.',
  },
  shareUrl: 'https://your-domain.web.app',
};

// ─────────────────────────────────────────────────────────────
// 헬퍼: 날짜 포맷
// ─────────────────────────────────────────────────────────────
const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_EN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function formatDateKo(d) {
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 ${DAYS_KO[d.getDay()]}요일`;
}
function formatTimeKo(d) {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${ampm} ${h12}시${m ? ' ' + m + '분' : ''}`;
}

// ─────────────────────────────────────────────────────────────
// 카운트다운 훅
// ─────────────────────────────────────────────────────────────
function useCountdown(target) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  let diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  return { days, hours, minutes, seconds, passed: target.getTime() < Date.now() };
}

// ─────────────────────────────────────────────────────────────
// 아이콘 (인라인 SVG)
// ─────────────────────────────────────────────────────────────
const Icon = {
  textSize: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7h8M7 7v12M14 11h6M17 11v8M3 4h8M14 8h6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  share: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.5" stroke={c} strokeWidth="1.4"/><circle cx="18" cy="6" r="2.5" stroke={c} strokeWidth="1.4"/><circle cx="18" cy="18" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  copy: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="8" y="3" width="13" height="13" rx="2" stroke={c} strokeWidth="1.4"/><path d="M16 16v3a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h3" stroke={c} strokeWidth="1.4"/></svg>,
  close: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// TopBar — 상단 액션 바
// ─────────────────────────────────────────────────────────────
function TopBar({ largeText, setLargeText, onShare, scale }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 14px',
      background: 'linear-gradient(to bottom, rgba(250,247,242,0.92) 60%, rgba(250,247,242,0))',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    }}>
      <button
        onClick={() => setLargeText(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 12px 0 10px', borderRadius: 999,
          background: largeText ? '#2C2A26' : 'rgba(255,255,255,0.9)',
          color: largeText ? '#FAF7F2' : '#2C2A26',
          border: '1px solid ' + (largeText ? '#2C2A26' : 'rgba(44,42,38,0.12)'),
          backdropFilter: 'blur(10px) saturate(160%)',
          WebkitBackdropFilter: 'blur(10px) saturate(160%)',
          boxShadow: '0 2px 10px rgba(44,42,38,0.06)',
          fontFamily: 'Pretendard, -apple-system, system-ui',
          fontSize: 13 * scale, fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        {Icon.textSize(largeText ? '#FAF7F2' : '#2C2A26')}
        <span>큰글씨 보기</span>
      </button>
      <button
        onClick={onShare}
        style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(44,42,38,0.12)',
          backdropFilter: 'blur(10px) saturate(160%)',
          WebkitBackdropFilter: 'blur(10px) saturate(160%)',
          boxShadow: '0 2px 10px rgba(44,42,38,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {Icon.share('#2C2A26')}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cover — 표지
// ─────────────────────────────────────────────────────────────
function Cover({ scale }) {
  const d = INVITE.date;
  return (
    <section style={{ padding: '40px 28px 56px', textAlign: 'center' }}>
      <div style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 12 * scale, letterSpacing: 6, color: '#8A8378',
        marginBottom: 36, textTransform: 'uppercase',
      }}>
        We're getting married
      </div>

      {/* 사진 자리 (placeholder) */}
      <div style={{
        width: '100%', aspectRatio: '3/4', borderRadius: 4,
        background: `repeating-linear-gradient(135deg, #E8E2D6 0px, #E8E2D6 1px, #EDE7DC 1px, #EDE7DC 14px), #EDE7DC`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 40,
        color: '#A39A8A',
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 11 * scale, letterSpacing: 0.6,
      }}>
        <div style={{ marginBottom: 4, opacity: 0.7 }}>──────────</div>
        <div>main couple photo</div>
        <div style={{ marginTop: 4, opacity: 0.7 }}>──────────</div>
      </div>

      {/* 이름 */}
      <div style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 40 * scale, fontWeight: 400,
        color: '#2C2A26', lineHeight: 1.1, letterSpacing: -0.5,
      }}>
        {INVITE.groom.name}
        <div style={{
          fontSize: 22 * scale, fontStyle: 'italic',
          color: '#A07856', margin: '8px 0', fontWeight: 300,
        }}>&</div>
        {INVITE.bride.name}
      </div>

      <div style={{ marginTop: 32, height: 1, background: '#D9D2C5', width: 60, margin: '32px auto 0' }} />

      <div style={{
        marginTop: 24,
        fontFamily: 'Pretendard, -apple-system, system-ui',
        fontSize: 14 * scale, color: '#5C564D', lineHeight: 1.8, letterSpacing: 0.4,
      }}>
        {d.getFullYear()}. {String(d.getMonth()+1).padStart(2,'0')}. {String(d.getDate()).padStart(2,'0')}<br/>
        {DAYS_KO[d.getDay()]}요일 {formatTimeKo(d)}<br/>
        <span style={{ color: '#8A8378' }}>{INVITE.venue.name} · {INVITE.venue.hall}</span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Greeting — 인사말
// ─────────────────────────────────────────────────────────────
function Greeting({ scale }) {
  return (
    <section style={{ padding: '56px 32px 56px', textAlign: 'center', borderTop: '1px solid #ECE6DA' }}>
      <div style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 11 * scale, letterSpacing: 5, color: '#A07856',
        marginBottom: 12, textTransform: 'uppercase',
      }}>Invitation</div>
      <div style={{
        fontFamily: '"Noto Serif KR", serif',
        fontSize: 18 * scale, color: '#2C2A26', marginBottom: 28,
        fontWeight: 500, letterSpacing: -0.2,
      }}>
        {INVITE.greeting.title}
      </div>
      <div style={{
        fontFamily: '"Noto Serif KR", serif',
        fontSize: 14 * scale, color: '#5C564D', lineHeight: 2,
        whiteSpace: 'pre-line', letterSpacing: -0.1,
      }}>
        {INVITE.greeting.body}
      </div>

      {/* 부모님 */}
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center' }}>
        <div style={{ textAlign: 'right', fontFamily: '"Noto Serif KR", serif', fontSize: 13 * scale, color: '#5C564D', lineHeight: 1.7 }}>
          <div style={{ color: '#8A8378', fontSize: 11 * scale, marginBottom: 2 }}>신랑측</div>
          {INVITE.groom.father} · {INVITE.groom.mother}<br/>
          <span style={{ color: '#2C2A26' }}>{INVITE.groom.order} {INVITE.groom.name}</span>
        </div>
        <div style={{ width: 1, height: 36, background: '#D9D2C5' }} />
        <div style={{ textAlign: 'left', fontFamily: '"Noto Serif KR", serif', fontSize: 13 * scale, color: '#5C564D', lineHeight: 1.7 }}>
          <div style={{ color: '#8A8378', fontSize: 11 * scale, marginBottom: 2 }}>신부측</div>
          {INVITE.bride.father} · {INVITE.bride.mother}<br/>
          <span style={{ color: '#2C2A26' }}>{INVITE.bride.order} {INVITE.bride.name}</span>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// DateCard — 날짜 + 달력
// ─────────────────────────────────────────────────────────────
function DateCard({ scale }) {
  const d = INVITE.date;
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section style={{ padding: '56px 28px', textAlign: 'center', borderTop: '1px solid #ECE6DA', background: '#FBF8F2' }}>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 11 * scale, letterSpacing: 5, color: '#A07856', marginBottom: 16, textTransform: 'uppercase' }}>The Day</div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 16 * scale, color: '#5C564D', letterSpacing: 4, marginBottom: 4 }}>
        {MONTHS_EN[month]} {year}
      </div>

      <div style={{ background: '#fff', borderRadius: 6, padding: '20px 14px 16px', margin: '20px auto 0', maxWidth: 280, border: '1px solid #ECE6DA' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', fontFamily: '"Cormorant Garamond", serif', fontSize: 10 * scale, letterSpacing: 1, marginBottom: 10 }}>
          {['S','M','T','W','T','F','S'].map((v, i) => (
            <div key={i} style={{ color: i === 0 ? '#C97B6A' : i === 6 ? '#7A8FA6' : '#8A8378' }}>{v}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: 6, fontFamily: '"Cormorant Garamond", serif', fontSize: 13 * scale }}>
          {cells.map((n, i) => {
            const isTarget = n === day;
            const dow = i % 7;
            const color = isTarget ? '#fff' : dow === 0 ? '#C97B6A' : dow === 6 ? '#7A8FA6' : '#2C2A26';
            return (
              <div key={i} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {n && (
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isTarget ? '#A07856' : 'transparent',
                    color, fontWeight: isTarget ? 600 : 400,
                  }}>{n}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 18, fontFamily: '"Noto Serif KR", serif', fontSize: 14 * scale, color: '#2C2A26', lineHeight: 1.7 }}>
        {formatDateKo(d)}<br/>
        <span style={{ color: '#8A8378' }}>{formatTimeKo(d)}</span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Countdown — 카운트다운
// ─────────────────────────────────────────────────────────────
function Countdown({ scale }) {
  const { days, hours, minutes, seconds, passed } = useCountdown(INVITE.date);
  const cell = (label, value, big = false) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: (big ? 36 : 30) * scale, fontWeight: 400, color: '#2C2A26', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {String(value).padStart(2,'0')}
      </div>
      <div style={{ fontFamily: 'Pretendard, system-ui', fontSize: 10 * scale, color: '#8A8378', letterSpacing: 1, marginTop: 8, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
  const sep = <div style={{ color: '#D9D2C5', fontFamily: '"Cormorant Garamond", serif', fontSize: 24 * scale, alignSelf: 'flex-start', marginTop: -4 }}>:</div>;

  return (
    <section style={{ padding: '48px 28px', borderTop: '1px solid #ECE6DA', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Pretendard, system-ui', fontSize: 13 * scale, color: '#5C564D', marginBottom: 6 }}>
        {INVITE.groom.name} <span style={{ color: '#A07856' }}>♡</span> {INVITE.bride.name} 결혼식까지
      </div>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 11 * scale, letterSpacing: 4, color: '#A07856', textTransform: 'uppercase', marginBottom: 24 }}>
        {passed ? 'Married' : `D-${days}`}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '20px 8px', background: '#fff', borderRadius: 6, border: '1px solid #ECE6DA' }}>
        {cell('Days', days, true)}
        {sep}
        {cell('Hours', hours)}
        {sep}
        {cell('Min', minutes)}
        {sep}
        {cell('Sec', seconds)}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Location — 오시는 길
// ─────────────────────────────────────────────────────────────
function MapButton({ logo, label, sub, onClick, bg, fg }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '14px 6px', borderRadius: 10, background: '#fff', border: '1px solid #ECE6DA',
      cursor: 'pointer', fontFamily: 'Pretendard, system-ui',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, fontFamily: 'Pretendard, system-ui' }}>{logo}</div>
      <div style={{ fontSize: 12, color: '#2C2A26', fontWeight: 600, marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: '#8A8378' }}>{sub}</div>
    </button>
  );
}

function openMap(deeplink, fallback) {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile) { window.open(fallback, '_blank'); return; }
  const timer = setTimeout(() => { window.location.href = fallback; }, 1500);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); }, { once: true });
  window.location.href = deeplink;
}

function Location({ scale }) {
  const v = INVITE.venue;
  const enc = encodeURIComponent(v.name);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard?.writeText(v.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section style={{ padding: '56px 28px 48px', borderTop: '1px solid #ECE6DA', background: '#FBF8F2', textAlign: 'center' }}>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 11 * scale, letterSpacing: 5, color: '#A07856', textTransform: 'uppercase', marginBottom: 14 }}>Location</div>
      <div style={{ fontFamily: '"Noto Serif KR", serif', fontSize: 20 * scale, color: '#2C2A26', fontWeight: 500, letterSpacing: -0.3, marginBottom: 4 }}>{v.name}</div>
      <div style={{ fontFamily: 'Pretendard, system-ui', fontSize: 13 * scale, color: '#5C564D' }}>{v.hall}</div>

      {/* 지도 placeholder */}
      <div style={{ marginTop: 22, width: '100%', height: 160, borderRadius: 6, background: 'linear-gradient(135deg, #F5F0E5 0%, #EFE9DB 100%)', position: 'relative', overflow: 'hidden', border: '1px solid #ECE6DA' }}>
        <svg viewBox="0 0 320 160" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M0 120 Q 80 80 160 90 T 320 60" stroke="#DDD5C5" strokeWidth="6" fill="none"/>
          <path d="M0 120 Q 80 80 160 90 T 320 60" stroke="#fff" strokeWidth="2" strokeDasharray="6 6" fill="none"/>
          <path d="M40 0 L 60 160" stroke="#E8E0CE" strokeWidth="4" fill="none"/>
          <path d="M220 0 L 240 160" stroke="#E8E0CE" strokeWidth="4" fill="none"/>
        </svg>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#A07856', color: '#fff', padding: '6px 12px', borderRadius: 999, fontFamily: 'Pretendard, system-ui', fontSize: 11, fontWeight: 600, boxShadow: '0 4px 12px rgba(160,120,86,0.3)', whiteSpace: 'nowrap' }}>{v.name}</div>
          <div style={{ width: 0, height: 0, marginTop: -1, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #A07856' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#A07856', border: '2px solid #fff', marginTop: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
        </div>
      </div>

      {/* 주소 */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Pretendard, system-ui', fontSize: 13 * scale, color: '#2C2A26' }}>
        <span>{v.address}</span>
        <button onClick={copyAddress} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', borderRadius: 999,
          background: copied ? '#2C2A26' : '#fff',
          color: copied ? '#FAF7F2' : '#5C564D',
          border: '1px solid ' + (copied ? '#2C2A26' : '#ECE6DA'),
          fontSize: 11, cursor: 'pointer', fontFamily: 'Pretendard, system-ui',
        }}>
          {!copied && Icon.copy('#5C564D')}
          {copied ? '복사됨' : '복사'}
        </button>
      </div>

      {/* 지도 딥링크 3개 */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: 'Pretendard, system-ui', fontSize: 11 * scale, color: '#8A8378', marginBottom: 10, letterSpacing: 0.5 }}>지도앱에서 길찾기</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <MapButton logo="N" label="네이버지도" sub="길찾기" bg="#03C75A" fg="#fff"
            onClick={() => openMap(`nmap://place?lat=${v.lat}&lng=${v.lng}&name=${enc}&appname=wedding.invite`, `https://map.naver.com/v5/search/${enc}`)} />
          <MapButton logo="K" label="카카오맵" sub="길찾기" bg="#FEE500" fg="#191919"
            onClick={() => openMap(`kakaomap://look?p=${v.lat},${v.lng}`, `https://map.kakao.com/link/to/${enc},${v.lat},${v.lng}`)} />
          <MapButton logo="T" label="티맵" sub="내비게이션" bg="#0064FF" fg="#fff"
            onClick={() => openMap(`tmap://route?goalname=${enc}&goalx=${v.lng}&goaly=${v.lat}`, `https://tmap.life`)} />
        </div>
      </div>

      {/* 교통편 */}
      <div style={{ marginTop: 26, textAlign: 'left', background: '#fff', borderRadius: 6, padding: '16px 18px', border: '1px solid #ECE6DA', fontFamily: 'Pretendard, system-ui' }}>
        {[
          { label: '지하철', text: '7호선 청담역 13번 출구 도보 8분' },
          { label: '버스', text: '강변 360, 동05 → 청담사거리 하차' },
          { label: '주차', text: '건물 지하 2시간 무료 (만차 시 발렛 가능)' },
        ].map(({ label, text }, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
            <div style={{ fontSize: 11 * scale, fontWeight: 700, color: '#A07856', minWidth: 40 }}>{label}</div>
            <div style={{ fontSize: 12 * scale, color: '#2C2A26', lineHeight: 1.6 }}>{text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function Footer({ scale, onShare }) {
  return (
    <section style={{ padding: '48px 28px 80px', borderTop: '1px solid #ECE6DA', textAlign: 'center' }}>
      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 13 * scale, color: '#A07856', letterSpacing: 4, marginBottom: 18 }}>THANK YOU</div>
      <div style={{ fontFamily: '"Noto Serif KR", serif', fontSize: 14 * scale, color: '#5C564D', lineHeight: 1.9 }}>
        저희의 새로운 시작을<br/>함께 축복해 주세요
      </div>
      <button onClick={onShare} style={{
        marginTop: 28,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 28px', borderRadius: 999,
        background: '#2C2A26', color: '#FAF7F2',
        border: 'none', cursor: 'pointer',
        fontFamily: 'Pretendard, system-ui', fontSize: 13 * scale, fontWeight: 500, letterSpacing: 0.2,
      }}>
        {Icon.share('#FAF7F2')}
        청첩장 공유하기
      </button>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ShareSheet — 공유 모달
// ─────────────────────────────────────────────────────────────
function ShareSheet({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const url = INVITE.shareUrl;

  const copy = () => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const shareOptions = [
    { label: '카카오톡', color: '#FEE500', fg: '#191919', sub: '카카오톡', action: () => { if (window.Kakao?.Share) { window.Kakao.Share.sendDefault({ objectType: 'feed', content: { title: `${INVITE.groom.name} ♡ ${INVITE.bride.name}`, description: `${INVITE.date.toLocaleDateString('ko-KR')} ${INVITE.venue.name}`, imageUrl: '', link: { mobileWebUrl: url, webUrl: url } } }); } } },
    { label: '문자', color: '#5AC8FA', fg: '#fff', sub: '문자', action: () => { window.location.href = `sms:?body=${encodeURIComponent(`청첩장을 보내드립니다 ${url}`)}`; } },
    { label: '메일', color: '#34C759', fg: '#fff', sub: '메일', action: () => { window.location.href = `mailto:?subject=${encodeURIComponent('청첩장')}&body=${encodeURIComponent(url)}`; } },
    { label: '···', color: '#8A8378', fg: '#fff', sub: '더보기', action: () => { navigator.share?.({ title: `${INVITE.groom.name} ♡ ${INVITE.bride.name}`, url }); } },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(28,26,22,0.4)', backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease-out' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: '20px 20px 0 0', padding: '12px 24px 36px', maxWidth: 460, width: '100%', margin: '0 auto', animation: 'slideUp 0.25s ease-out' }}>
        <div style={{ width: 36, height: 4, background: '#D9D2C5', borderRadius: 2, margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontFamily: '"Noto Serif KR", serif', fontSize: 17, fontWeight: 500, color: '#2C2A26' }}>청첩장 공유하기</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.close('#5C564D')}</button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          {shareOptions.map(({ label, color, fg, sub, action }) => (
            <div key={label} onClick={action} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: color, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Pretendard, system-ui', fontWeight: 700, fontSize: 16, margin: '0 auto 8px' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#5C564D', fontFamily: 'Pretendard, system-ui' }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fff', border: '1px solid #ECE6DA', borderRadius: 10 }}>
          <div style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#5C564D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
          <button onClick={copy} style={{ padding: '6px 12px', borderRadius: 999, background: copied ? '#2C2A26' : '#A07856', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, system-ui', fontSize: 12, fontWeight: 600 }}>
            {copied ? '복사됨' : 'URL 복사'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WeddingInvite — 메인
// ─────────────────────────────────────────────────────────────
function WeddingInvite() {
  const [largeText, setLargeText] = useState(() => {
    try { return localStorage.getItem('wedding.largeText') === 'true'; } catch { return false; }
  });
  const [shareOpen, setShareOpen] = useState(false);
  const scale = largeText ? 1.28 : 1.0;

  useEffect(() => {
    try { localStorage.setItem('wedding.largeText', largeText); } catch {}
  }, [largeText]);

  return (
    <div style={{ minHeight: '100%', background: '#FAF7F2', color: '#2C2A26', paddingBottom: 40, position: 'relative', fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif' }}>
      <TopBar largeText={largeText} setLargeText={setLargeText} onShare={() => setShareOpen(true)} scale={scale} />
      <Cover scale={scale} />
      <Greeting scale={scale} />
      <DateCard scale={scale} />
      <Countdown scale={scale} />
      <Location scale={scale} />
      <Footer scale={scale} onShare={() => setShareOpen(true)} />
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

Object.assign(window, { WeddingInvite });
