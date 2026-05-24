// app.js — Firestore 템플릿 로딩 + A/B 배정

function normalizeTemplate(id, raw) {
  return {
    ...raw,
    id,
    date: raw.date?.toDate ? raw.date.toDate() : new Date(raw.date),
  };
}

async function resolveTemplate() {
  const db = firebase.firestore();

  // 1) URL 파라미터 우선: ?t={templateId}
  const urlId = new URLSearchParams(location.search).get('t');
  if (urlId) {
    const doc = await db.collection('templates').doc(urlId).get();
    if (doc.exists) return normalizeTemplate(doc.id, doc.data());
  }

  // 2) 세션 내 이전 배정 유지
  const sessionId = sessionStorage.getItem('wedding.templateId');
  if (sessionId) {
    const doc = await db.collection('templates').doc(sessionId).get();
    if (doc.exists) return normalizeTemplate(doc.id, doc.data());
  }

  // 3) 활성 템플릿 중 랜덤 배정
  const snap = await db.collection('templates').where('isActive', '==', true).get();
  if (!snap.empty) {
    const chosen = snap.docs[Math.floor(Math.random() * snap.docs.length)];
    sessionStorage.setItem('wedding.templateId', chosen.id);
    return normalizeTemplate(chosen.id, chosen.data());
  }

  return null;
}

function showError(msg) {
  document.getElementById('loading').style.display = 'none';
  const el = document.getElementById('error');
  el.style.display = 'flex';
  if (msg) el.querySelector('div').textContent = msg;
}

document.addEventListener('DOMContentLoaded', async () => {
  // 10초 타임아웃 — Firestore 미설정 시 무한 대기 방지
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 10000)
  );

  try {
    const data = await Promise.race([resolveTemplate(), timeout]);

    if (!data) {
      showError('등록된 템플릿이 없습니다.\n/manager 에서 템플릿을 추가해 주세요.');
      return;
    }

    renderInvite(data);
    startCountdown(data.date);
    initLargeText();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('invite').classList.remove('hidden');
  } catch (e) {
    console.error('[app]', e);
    const isTimeout = e.message === 'timeout';
    showError(isTimeout
      ? 'Firebase 연결 시간 초과\nFirebase Console에서 Firestore 데이터베이스를 생성해 주세요.'
      : '청첩장을 불러올 수 없습니다.\n잠시 후 다시 시도해 주세요.'
    );
  }
});
