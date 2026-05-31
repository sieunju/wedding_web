'use strict';

const { setGlobalOptions } = require('firebase-functions');
const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getRemoteConfig } = require('firebase-admin/remote-config');
const path = require('path');
const fs = require('fs');

initializeApp();
setGlobalOptions({ region: 'asia-northeast3' });

const TEMPLATES = ['a', 'b', 'c', 'd'];
const COOKIE_NAME = 'wt';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const INVITE_DOC = 'invitations/main';

async function getInviteData() {
  try {
    const db = getFirestore();
    const snap = await db.doc(INVITE_DOC).get();
    if (!snap.exists) return null;
    const data = snap.data();
    const date = data.date instanceof Timestamp
      ? data.date.toDate().toISOString()
      : null;
    return { ...data, date };
  } catch {
    return null;
  }
}

async function getTemplateFromRemoteConfig() {
  try {
    const rc = getRemoteConfig();
    const tmpl = await rc.getTemplate();
    const param = tmpl.parameters['wedding_template'];
    if (param?.defaultValue && 'value' in param.defaultValue) {
      const value = param.defaultValue.value.trim().toLowerCase();
      if (TEMPLATES.includes(value)) return value;
    }
  } catch {}
  return null;
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k) cookies[k.trim()] = (v ?? '').trim();
  }
  return cookies;
}

function buildInviteScript(data) {
  if (!data) return '';
  const invite = {
    groom: data.groom ?? {},
    bride: data.bride ?? {},
    date: `__DATE__${data.date}__DATE__`,
    venue: data.venue ?? {},
    shareUrl: data.shareUrl ?? '',
    accounts: data.accounts ?? { groom: [], bride: [] },
    photos: data.photos ?? {},
  };
  const json = JSON.stringify(invite, null, 2)
    .replace('"__DATE__', "new Date('")
    .replace('__DATE__"', "')");
  return `<script>window.INVITE = ${json};</script>`;
}

function sendTemplate(template, invite, setCookie, res) {
  const filePath = path.join(__dirname, 'templates', `template-${template}.html`);
  try {
    let html = fs.readFileSync(filePath, 'utf-8');
    if (invite) {
      const groom = invite.groom?.name ?? '';
      const bride = invite.bride?.name ?? '';
      const couple = `${groom} ♡ ${bride}`;
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${couple} · 모바일 청첩장</title>`);
      html = html.replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${couple} 결혼합니다$2`);
      const script = buildInviteScript(invite);
      html = html.replace(/<script>\s*window\.INVITE\s*=[\s\S]*?<\/script>/, script);
    }
    if (setCookie) {
      res.setHeader('Set-Cookie',
        `${COOKIE_NAME}=${template}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch {
    res.status(500).send('Template not found');
  }
}

exports.serve = onRequest(async (req, res) => {
  const [invite, rcTemplate] = await Promise.all([
    getInviteData(),
    getTemplateFromRemoteConfig(),
  ]);

  const queryT = req.query.t;
  if (queryT && TEMPLATES.includes(queryT)) {
    return sendTemplate(queryT, invite, false, res);
  }

  const cookies = parseCookies(req.headers.cookie);
  const cookieT = cookies[COOKIE_NAME];
  if (cookieT && TEMPLATES.includes(cookieT)) {
    return sendTemplate(cookieT, invite, false, res);
  }

  const assigned = rcTemplate ?? TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  sendTemplate(assigned, invite, true, res);
});
