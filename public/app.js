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

function showError() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display   = 'flex';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await resolveTemplate();
    if (!data) { showError(); return; }

    renderInvite(data);
    startCountdown(data.date);
    initLargeText();

    document.getElementById('loading').style.display = 'none';
    document.getElementById('invite').classList.remove('hidden');
  } catch (e) {
    console.error(e);
    showError();
  }
});
