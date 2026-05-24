// manager.jsx — 청첩장 템플릿 관리자
const { useState, useEffect, useRef } = React;
const db      = firebase.firestore();
const auth    = firebase.auth();
const storage = firebase.storage();

// ─────────────────────────────────────────────────────────────
// 공통 스타일
// ─────────────────────────────────────────────────────────────
const S = {
  btn: (variant = 'primary') => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    border: 'none', cursor: 'pointer',
    ...(variant === 'primary'   ? { background: '#2C2A26', color: '#FAF7F2' } : {}),
    ...(variant === 'secondary' ? { background: '#fff', color: '#2C2A26', border: '1px solid #E0D9CE' } : {}),
    ...(variant === 'danger'    ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' } : {}),
    ...(variant === 'ghost'     ? { background: 'transparent', color: '#5C564D' } : {}),
  }),
  input: { width: '100%', padding: '9px 12px', border: '1px solid #E0D9CE', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', color: '#1A1916' },
  label: { fontSize: 12, fontWeight: 600, color: '#5C564D', display: 'block', marginBottom: 6 },
  card:  { background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #ECE6DA' },
};

// ─────────────────────────────────────────────────────────────
// Firestore 헬퍼
// ─────────────────────────────────────────────────────────────
const col = () => db.collection('templates');

async function listTemplates() {
  const snap = await col().orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function saveTemplate(id, data) {
  const now = firebase.firestore.FieldValue.serverTimestamp();
  if (id) {
    await col().doc(id).update({ ...data, updatedAt: now });
  } else {
    await col().add({ ...data, isActive: true, createdAt: now, updatedAt: now });
  }
}

async function deleteTemplate(id) {
  await col().doc(id).delete();
}

async function toggleActive(id, current) {
  await col().doc(id).update({ isActive: !current });
}

async function uploadPhoto(file, templateLabel) {
  const ext  = file.name.split('.').pop();
  const path = `photos/${Date.now()}_${templateLabel}.${ext}`;
  const ref  = storage.ref(path);
  await ref.put(file);
  return await ref.getDownloadURL();
}

// ─────────────────────────────────────────────────────────────
// 빈 폼 초기값
// ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  label: '',
  groom:    { name: '', father: '', mother: '', order: '장남' },
  bride:    { name: '', father: '', mother: '', order: '장녀' },
  date:     '',
  venue:    { name: '', hall: '', address: '', lat: '', lng: '' },
  greeting: { title: '소중한 분들을 초대합니다', body: '서로 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로 지켜나갈 수 있게\n늘 축복해 주시면 감사하겠습니다.' },
  transport: [
    { label: '지하철', text: '' },
    { label: '버스',   text: '' },
    { label: '주차',   text: '' },
  ],
  photoUrl: '',
  shareUrl: '',
  footer:   '',
};

function templateToForm(t) {
  return {
    ...EMPTY_FORM,
    ...t,
    date: t.date?.toDate ? t.date.toDate().toISOString().slice(0, 16) : (t.date || ''),
    venue: { ...EMPTY_FORM.venue, ...t.venue },
    groom: { ...EMPTY_FORM.groom, ...t.groom },
    bride: { ...EMPTY_FORM.bride, ...t.bride },
    greeting: { ...EMPTY_FORM.greeting, ...t.greeting },
    transport: t.transport?.length ? t.transport : EMPTY_FORM.transport,
  };
}

function formToData(f) {
  return {
    label:    f.label,
    groom:    { name: f.groom.name, father: f.groom.father, mother: f.groom.mother, order: f.groom.order },
    bride:    { name: f.bride.name, father: f.bride.father, mother: f.bride.mother, order: f.bride.order },
    date:     firebase.firestore.Timestamp.fromDate(new Date(f.date)),
    venue:    { name: f.venue.name, hall: f.venue.hall, address: f.venue.address, lat: parseFloat(f.venue.lat)||0, lng: parseFloat(f.venue.lng)||0 },
    greeting: { title: f.greeting.title, body: f.greeting.body },
    transport: f.transport.filter(t => t.text.trim()),
    photoUrl: f.photoUrl,
    shareUrl: f.shareUrl,
    footer:   f.footer,
  };
}

// ─────────────────────────────────────────────────────────────
// 로그인 화면
// ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.signInWithEmailAndPassword(email, password);
      onLogin();
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ ...S.card, width: '100%', maxWidth: 360, animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1A1916' }}>관리자 로그인</div>
          <div style={{ fontSize: 13, color: '#8A8378', marginTop: 6 }}>청첩장 템플릿 관리</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={S.label}>이메일</label>
            <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
          </div>
          <div>
            <label style={S.label}>비밀번호</label>
            <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 6 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ ...S.btn('primary'), justifyContent: 'center', padding: '11px', marginTop: 4, opacity: loading ? 0.6 : 1 }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 템플릿 편집 폼
// ─────────────────────────────────────────────────────────────
function TemplateForm({ initial, onSave, onCancel }) {
  const [form, setForm]       = useState(initial || EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef               = useRef();

  const set = (path, value) => {
    setForm(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const setTransport = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      transport: prev.transport.map((t, i) => i === index ? { ...t, [field]: value } : t),
    }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, form.label || 'template');
      set('photoUrl', url);
    } catch (err) {
      alert('사진 업로드에 실패했습니다');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formToData(form));
    } finally {
      setSaving(false);
    }
  };

  const Row = ({ label, children }) => (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );

  const PersonFields = ({ prefix, title }) => (
    <div style={{ ...S.card, background: '#FAFAF9' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Row label="이름"><input style={S.input} value={form[prefix].name} onChange={e => set(`${prefix}.name`, e.target.value)} /></Row>
        <Row label="항렬">
          <select style={S.input} value={form[prefix].order} onChange={e => set(`${prefix}.order`, e.target.value)}>
            {['장남','차남','삼남','막내아들','장녀','차녀','삼녀','막내딸'].map(v => <option key={v}>{v}</option>)}
          </select>
        </Row>
        <Row label="부 이름"><input style={S.input} value={form[prefix].father} onChange={e => set(`${prefix}.father`, e.target.value)} /></Row>
        <Row label="모 이름"><input style={S.input} value={form[prefix].mother} onChange={e => set(`${prefix}.mother`, e.target.value)} /></Row>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.2s ease-out' }}>
      {/* 기본 정보 */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>기본 정보</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row label="템플릿 이름 (관리용)">
            <input style={S.input} value={form.label} onChange={e => set('label', e.target.value)} placeholder="예: A안 (스탠다드)" required />
          </Row>
          <Row label="결혼식 일시">
            <input style={S.input} type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} required />
          </Row>
          <Row label="공유 URL">
            <input style={S.input} value={form.shareUrl} onChange={e => set('shareUrl', e.target.value)} placeholder="https://your-domain.web.app" />
          </Row>
        </div>
      </div>

      {/* 사진 */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>커플 사진</div>
        {form.photoUrl ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img src={form.photoUrl} style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 8 }} />
            <button type="button" onClick={() => set('photoUrl', '')} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading} style={{ ...S.btn('secondary'), width: '100%', justifyContent: 'center', padding: 12, border: '2px dashed #E0D9CE' }}>
            {uploading ? '업로드 중...' : '+ 사진 선택 (3:4 비율 권장)'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
      </div>

      {/* 신랑/신부 */}
      <PersonFields prefix="groom" title="신랑" />
      <PersonFields prefix="bride" title="신부" />

      {/* 장소 */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>예식 장소</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Row label="예식장 이름"><input style={S.input} value={form.venue.name} onChange={e => set('venue.name', e.target.value)} /></Row>
            <Row label="홀 이름"><input style={S.input} value={form.venue.hall} onChange={e => set('venue.hall', e.target.value)} /></Row>
          </div>
          <Row label="주소"><input style={S.input} value={form.venue.address} onChange={e => set('venue.address', e.target.value)} /></Row>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Row label="위도 (lat)"><input style={S.input} type="number" step="any" value={form.venue.lat} onChange={e => set('venue.lat', e.target.value)} placeholder="37.5247" /></Row>
            <Row label="경도 (lng)"><input style={S.input} type="number" step="any" value={form.venue.lng} onChange={e => set('venue.lng', e.target.value)} placeholder="127.0428" /></Row>
          </div>
        </div>
      </div>

      {/* 인사말 */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>인사말</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Row label="제목"><input style={S.input} value={form.greeting.title} onChange={e => set('greeting.title', e.target.value)} /></Row>
          <Row label="본문">
            <textarea style={{ ...S.input, height: 120, resize: 'vertical', lineHeight: 1.7 }} value={form.greeting.body} onChange={e => set('greeting.body', e.target.value)} />
          </Row>
        </div>
      </div>

      {/* 교통편 */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>교통편 안내</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {form.transport.map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, alignItems: 'center' }}>
              <input style={S.input} value={t.label} onChange={e => setTransport(i, 'label', e.target.value)} />
              <input style={S.input} value={t.text} onChange={e => setTransport(i, 'text', e.target.value)} placeholder="비워두면 표시 안 됨" />
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>하단 문구 (선택)</div>
        <textarea style={{ ...S.input, height: 80, resize: 'vertical', lineHeight: 1.7 }} value={form.footer} onChange={e => set('footer', e.target.value)} placeholder="비워두면 기본 문구 사용" />
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={S.btn('secondary')}>취소</button>
        <button type="submit" disabled={saving} style={{ ...S.btn('primary'), opacity: saving ? 0.6 : 1 }}>
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// 템플릿 목록
// ─────────────────────────────────────────────────────────────
function TemplateList({ templates, onEdit, onDelete, onToggle, onPreview }) {
  if (!templates.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8A8378' }}>
        <div style={{ fontSize: 14 }}>등록된 템플릿이 없습니다</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>상단 버튼으로 첫 번째 템플릿을 만들어 보세요</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {templates.map(t => (
        <div key={t.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeIn 0.2s ease-out' }}>
          {/* 사진 썸네일 */}
          <div style={{ width: 56, height: 74, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {t.photoUrl ? <img src={t.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>📷</span>}
          </div>

          {/* 정보 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1916' }}>{t.label || '(이름 없음)'}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: t.isActive ? '#D1FAE5' : '#F3F4F6', color: t.isActive ? '#065F46' : '#6B7280', fontWeight: 500 }}>
                {t.isActive ? '활성' : '비활성'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#5C564D' }}>
              {t.groom?.name && t.bride?.name ? `${t.groom.name} ♡ ${t.bride.name}` : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#8A8378', marginTop: 2 }}>
              {t.date?.toDate ? t.date.toDate().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '날짜 없음'}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button onClick={() => onPreview(t.id)} style={S.btn('ghost')} title="미리보기">🔗</button>
            <button onClick={() => onToggle(t)} style={S.btn('ghost')} title={t.isActive ? '비활성화' : '활성화'}>
              {t.isActive ? '⏸' : '▶'}
            </button>
            <button onClick={() => onEdit(t)} style={S.btn('secondary')}>편집</button>
            <button onClick={() => onDelete(t)} style={S.btn('danger')}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 관리자 앱
// ─────────────────────────────────────────────────────────────
function ManagerApp() {
  const [user, setUser]           = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [view, setView]           = useState('list'); // 'list' | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading]     = useState(false);

  // Auth 상태 감지
  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // 템플릿 로드
  const loadTemplates = async () => {
    setLoading(true);
    try { setTemplates(await listTemplates()); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (user) loadTemplates();
  }, [user]);

  const handleSave = async (data) => {
    await saveTemplate(editTarget?.id || null, data);
    await loadTemplates();
    setView('list');
    setEditTarget(null);
  };

  const handleDelete = async (t) => {
    if (!confirm(`"${t.label || t.id}" 템플릿을 삭제하시겠습니까?`)) return;
    await deleteTemplate(t.id);
    await loadTemplates();
  };

  const handleToggle = async (t) => {
    await toggleActive(t.id, t.isActive);
    await loadTemplates();
  };

  const handleEdit = (t) => {
    setEditTarget(t);
    setView('edit');
  };

  const handlePreview = (id) => {
    window.open(`/?t=${id}`, '_blank');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid #E0D9CE', borderTopColor: '#A07856', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={() => {}} />;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* 헤더 */}
      <header style={{ background: '#fff', borderBottom: '1px solid #ECE6DA', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setEditTarget(null); }} style={S.btn('ghost')}>← 목록</button>
          )}
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            {view === 'list' ? '청첩장 템플릿 관리' : view === 'create' ? '새 템플릿' : '템플릿 편집'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {view === 'list' && (
            <button onClick={() => { setEditTarget(null); setView('create'); }} style={S.btn('primary')}>+ 새 템플릿</button>
          )}
          <button onClick={() => auth.signOut()} style={S.btn('ghost')}>로그아웃</button>
        </div>
      </header>

      {/* 본문 */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {view === 'list' && (
          loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ width: 24, height: 24, border: '2px solid #E0D9CE', borderTopColor: '#A07856', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <TemplateList templates={templates} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} onPreview={handlePreview} />
          )
        )}
        {(view === 'create' || view === 'edit') && (
          <TemplateForm
            initial={editTarget ? templateToForm(editTarget) : null}
            onSave={handleSave}
            onCancel={() => { setView('list'); setEditTarget(null); }}
          />
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ManagerApp />);
