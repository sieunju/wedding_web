// manager.js — 청첩장 관리자 (순수 JS)

const db      = firebase.firestore();
const auth    = firebase.auth();
const storage = firebase.storage();

// ─────────────────────────────────────────────────────────────
// 뷰 전환
// ─────────────────────────────────────────────────────────────
function showView(name) {
  ['login-screen', 'main-screen'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );
  document.getElementById(name + '-screen').classList.remove('hidden');
}

function showMainPanel(panel) {
  ['list-loading', 'list-view', 'form-view'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );
  document.getElementById(panel).classList.remove('hidden');

  const isForm = panel === 'form-view';
  document.getElementById('btn-back').classList.toggle('hidden', !isForm);
  document.getElementById('btn-new').classList.toggle('hidden', isForm);
}

// ─────────────────────────────────────────────────────────────
// Firestore
// ─────────────────────────────────────────────────────────────
const col = () => db.collection('templates');

async function loadTemplates() {
  showMainPanel('list-loading');
  const snap = await col().orderBy('createdAt', 'desc').get();
  const templates = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderList(templates);
  showMainPanel('list-view');
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

// ─────────────────────────────────────────────────────────────
// 사진 업로드
// ─────────────────────────────────────────────────────────────
let currentPhotoUrl = '';

async function uploadPhoto(file, label) {
  const ext  = file.name.split('.').pop();
  const ref  = storage.ref(`photos/${Date.now()}_${label || 'img'}.${ext}`);
  await ref.put(file);
  return ref.getDownloadURL();
}

function renderPhotoArea() {
  const area = document.getElementById('photo-area');
  if (currentPhotoUrl) {
    area.innerHTML = `
      <div class="photo-preview">
        <img src="${currentPhotoUrl}" alt="photo" />
        <button type="button" class="btn-remove-photo" id="btn-remove-photo">✕</button>
      </div>`;
    document.getElementById('btn-remove-photo').addEventListener('click', () => {
      currentPhotoUrl = '';
      renderPhotoArea();
    });
  } else {
    area.innerHTML = `<button type="button" class="btn btn-upload" id="btn-upload">+ 사진 선택 (3:4 비율 권장)</button>`;
    document.getElementById('btn-upload').addEventListener('click', () =>
      document.getElementById('photo-file').click()
    );
  }
}

// ─────────────────────────────────────────────────────────────
// 폼 get/set (name 속성 기반 dot-path)
// ─────────────────────────────────────────────────────────────
function getField(name) {
  return document.querySelector(`[name="${name}"]`)?.value || '';
}
function setField(name, value) {
  const el = document.querySelector(`[name="${name}"]`);
  if (el) el.value = value ?? '';
}

const TRANSPORT_DEFAULTS = [
  { label: '지하철', text: '' },
  { label: '버스',   text: '' },
  { label: '주차',   text: '' },
];

function renderTransportRows(rows) {
  const container = document.getElementById('transport-rows');
  container.innerHTML = rows.map((r, i) => `
    <div class="transport-row">
      <input type="text" name="transport[${i}].label" value="${r.label}" />
      <input type="text" name="transport[${i}].text"  value="${r.text}" placeholder="비워두면 표시 안 됨" />
    </div>`
  ).join('');
}

function getTransportRows() {
  const rows = [];
  let i = 0;
  while (document.querySelector(`[name="transport[${i}].label"]`)) {
    rows.push({
      label: document.querySelector(`[name="transport[${i}].label"]`).value,
      text:  document.querySelector(`[name="transport[${i}].text"]`).value,
    });
    i++;
  }
  return rows.filter(r => r.text.trim());
}

function fillForm(t) {
  const dateStr = t.date?.toDate
    ? t.date.toDate().toISOString().slice(0, 16)
    : (t.date || '');

  setField('label',          t.label || '');
  setField('date',           dateStr);
  setField('shareUrl',       t.shareUrl || '');
  setField('groom.name',     t.groom?.name   || '');
  setField('groom.order',    t.groom?.order  || '장남');
  setField('groom.father',   t.groom?.father || '');
  setField('groom.mother',   t.groom?.mother || '');
  setField('bride.name',     t.bride?.name   || '');
  setField('bride.order',    t.bride?.order  || '장녀');
  setField('bride.father',   t.bride?.father || '');
  setField('bride.mother',   t.bride?.mother || '');
  setField('venue.name',     t.venue?.name    || '');
  setField('venue.hall',     t.venue?.hall    || '');
  setField('venue.address',  t.venue?.address || '');
  setField('venue.lat',      t.venue?.lat     || '');
  setField('venue.lng',      t.venue?.lng     || '');
  setField('greeting.title', t.greeting?.title || '소중한 분들을 초대합니다');
  setField('greeting.body',  t.greeting?.body  || '');
  setField('footer',         t.footer || '');

  currentPhotoUrl = t.photoUrl || '';
  renderPhotoArea();
  renderTransportRows(t.transport?.length ? t.transport : TRANSPORT_DEFAULTS);
}

function clearForm() {
  fillForm({});
  renderTransportRows(TRANSPORT_DEFAULTS);
}

function readForm() {
  return {
    label:    getField('label'),
    date:     firebase.firestore.Timestamp.fromDate(new Date(getField('date'))),
    shareUrl: getField('shareUrl'),
    groom: {
      name:   getField('groom.name'),
      order:  getField('groom.order'),
      father: getField('groom.father'),
      mother: getField('groom.mother'),
    },
    bride: {
      name:   getField('bride.name'),
      order:  getField('bride.order'),
      father: getField('bride.father'),
      mother: getField('bride.mother'),
    },
    venue: {
      name:    getField('venue.name'),
      hall:    getField('venue.hall'),
      address: getField('venue.address'),
      lat:     parseFloat(getField('venue.lat')) || 0,
      lng:     parseFloat(getField('venue.lng')) || 0,
    },
    greeting: {
      title: getField('greeting.title'),
      body:  getField('greeting.body'),
    },
    transport: getTransportRows(),
    photoUrl:  currentPhotoUrl,
    footer:    getField('footer'),
  };
}

// ─────────────────────────────────────────────────────────────
// 목록 렌더링
// ─────────────────────────────────────────────────────────────
function renderList(templates) {
  const container = document.getElementById('list-view');
  if (!templates.length) {
    container.innerHTML = `<div class="empty-state"><p>등록된 템플릿이 없습니다</p><small>상단 버튼으로 첫 번째 템플릿을 만들어 보세요</small></div>`;
    return;
  }
  container.innerHTML = templates.map(t => {
    const dateStr = t.date?.toDate
      ? t.date.toDate().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : '날짜 없음';
    const thumb = t.photoUrl
      ? `<div class="tpl-thumb"><img src="${t.photoUrl}" /></div>`
      : `<div class="tpl-thumb">📷</div>`;
    return `
      <div class="tpl-card">
        ${thumb}
        <div class="tpl-info">
          <div class="tpl-name">
            ${t.label || '(이름 없음)'}
            <span class="badge ${t.isActive ? 'badge-on' : 'badge-off'}">${t.isActive ? '활성' : '비활성'}</span>
          </div>
          <div class="tpl-names">${t.groom?.name && t.bride?.name ? `${t.groom.name} ♡ ${t.bride.name}` : '—'}</div>
          <div class="tpl-date">${dateStr}</div>
        </div>
        <div class="tpl-actions">
          <button class="btn btn-ghost" title="미리보기" data-action="preview" data-id="${t.id}">🔗</button>
          <button class="btn btn-ghost" title="${t.isActive ? '비활성화' : '활성화'}" data-action="toggle" data-id="${t.id}" data-active="${t.isActive}">${t.isActive ? '⏸' : '▶'}</button>
          <button class="btn btn-secondary" data-action="edit" data-id="${t.id}">편집</button>
          <button class="btn btn-danger"    data-action="delete" data-id="${t.id}" data-label="${t.label || t.id}">삭제</button>
        </div>
      </div>`;
  }).join('');
}

// ─────────────────────────────────────────────────────────────
// 페이지 타이틀
// ─────────────────────────────────────────────────────────────
let editingId = null;

function setPageTitle(title) {
  document.getElementById('page-title').textContent = title;
}

// ─────────────────────────────────────────────────────────────
// 초기화
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── 사진 파일 변경 ──────────────────────────────
  document.getElementById('photo-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const btn = document.getElementById('btn-upload');
    if (btn) btn.textContent = '업로드 중...';
    try {
      currentPhotoUrl = await uploadPhoto(file, getField('label'));
      renderPhotoArea();
    } catch {
      alert('사진 업로드에 실패했습니다');
    }
    e.target.value = '';
  });

  // ── 로그인 폼 ────────────────────────────────────
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    const btn   = document.getElementById('btn-login');
    errEl.classList.add('hidden');
    btn.textContent = '로그인 중...';
    btn.disabled = true;
    try {
      await auth.signInWithEmailAndPassword(
        document.getElementById('login-email').value,
        document.getElementById('login-pw').value
      );
    } catch {
      errEl.textContent = '이메일 또는 비밀번호가 올바르지 않습니다';
      errEl.classList.remove('hidden');
      btn.textContent = '로그인';
      btn.disabled = false;
    }
  });

  // ── 로그아웃 ──────────────────────────────────────
  document.getElementById('btn-logout').addEventListener('click', () => auth.signOut());

  // ── 새 템플릿 버튼 ────────────────────────────────
  document.getElementById('btn-new').addEventListener('click', () => {
    editingId = null;
    clearForm();
    setPageTitle('새 템플릿');
    showMainPanel('form-view');
  });

  // ── 뒤로 가기 ──────────────────────────────────────
  document.getElementById('btn-back').addEventListener('click', () => {
    setPageTitle('청첩장 템플릿 관리');
    loadTemplates();
  });

  // ── 취소 ─────────────────────────────────────────
  document.getElementById('btn-cancel').addEventListener('click', () => {
    setPageTitle('청첩장 템플릿 관리');
    loadTemplates();
  });

  // ── 폼 저장 ──────────────────────────────────────
  document.getElementById('form-view').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save');
    btn.textContent = '저장 중...';
    btn.disabled = true;
    try {
      await saveTemplate(editingId, readForm());
      setPageTitle('청첩장 템플릿 관리');
      await loadTemplates();
    } catch (err) {
      alert('저장에 실패했습니다: ' + err.message);
    } finally {
      btn.textContent = '저장';
      btn.disabled = false;
    }
  });

  // ── 목록 액션 (이벤트 위임) ───────────────────────
  document.getElementById('list-view').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id, active, label } = btn.dataset;

    if (action === 'preview') {
      window.open(`/?t=${id}`, '_blank');
    } else if (action === 'toggle') {
      await toggleActive(id, active === 'true');
      await loadTemplates();
    } else if (action === 'edit') {
      const doc = await db.collection('templates').doc(id).get();
      editingId = id;
      fillForm({ id, ...doc.data() });
      setPageTitle('템플릿 편집');
      showMainPanel('form-view');
    } else if (action === 'delete') {
      if (!confirm(`"${label}" 템플릿을 삭제하시겠습니까?`)) return;
      await deleteTemplate(id);
      await loadTemplates();
    }
  });

  // ── Auth 상태 감지 ────────────────────────────────
  auth.onAuthStateChanged(user => {
    if (user) {
      showView('main');
      loadTemplates();
    } else {
      showView('login');
    }
  });
});
