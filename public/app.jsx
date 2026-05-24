// app.jsx — 템플릿 로딩 + A/B 배정
const { useState, useEffect } = React;

// Firestore Timestamp → Date 변환 포함 정규화
function normalizeTemplate(raw) {
  return {
    ...raw,
    date: raw.date?.toDate ? raw.date.toDate() : new Date(raw.date),
  };
}

async function resolveTemplate() {
  const db = firebase.firestore();

  // 1) URL 파라미터 우선: ?t={templateId}
  const urlId = new URLSearchParams(location.search).get('t');
  if (urlId) {
    const doc = await db.collection('templates').doc(urlId).get();
    if (doc.exists) return normalizeTemplate({ id: doc.id, ...doc.data() });
  }

  // 2) 세션 내 이전 배정 유지
  const sessionId = sessionStorage.getItem('wedding.templateId');
  if (sessionId) {
    const doc = await db.collection('templates').doc(sessionId).get();
    if (doc.exists) return normalizeTemplate({ id: doc.id, ...doc.data() });
  }

  // 3) 활성 템플릿 중 랜덤 배정 (A/B 테스트)
  const snap = await db.collection('templates').where('isActive', '==', true).get();
  if (!snap.empty) {
    const docs = snap.docs;
    const chosen = docs[Math.floor(Math.random() * docs.length)];
    sessionStorage.setItem('wedding.templateId', chosen.id);
    return normalizeTemplate({ id: chosen.id, ...chosen.data() });
  }

  return null;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #ECE6DA', borderTopColor: '#A07856', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

function ErrorScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF7F2', fontFamily: '"Noto Serif KR", serif', color: '#8A8378', gap: 8 }}>
      <div style={{ fontSize: 14 }}>청첩장을 불러올 수 없습니다</div>
      <div style={{ fontSize: 12 }}>잠시 후 다시 시도해 주세요</div>
    </div>
  );
}

function App() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    resolveTemplate()
      .then(t => { setTemplate(t); setLoading(false); if (!t) setError(true); })
      .catch(() => { setLoading(false); setError(true); });
  }, []);

  if (loading) return <LoadingScreen />;
  if (error || !template) return <ErrorScreen />;

  return (
    <div style={{ minHeight: '100vh', background: '#E8E2D6', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#FAF7F2', minHeight: '100vh', boxShadow: '0 0 60px rgba(0,0,0,0.06)' }}>
        <WeddingInvite data={template} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
