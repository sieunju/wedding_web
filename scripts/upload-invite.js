#!/usr/bin/env node
'use strict';

/**
 * Firestore에 청첩장 데이터를 업로드합니다.
 *
 * 사용법:
 *   node scripts/upload-invite.js scripts/invite-data.json
 *
 * 필요 조건:
 *   - GOOGLE_APPLICATION_CREDENTIALS 환경변수 설정 (서비스 계정 키 경로)
 *     또는 `firebase login`으로 로그인된 상태에서 Application Default Credentials 사용
 *   - npm install firebase-admin (functions/ 디렉토리 안에 이미 있음)
 */

const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

const dataFilePath = process.argv[2];
if (!dataFilePath) {
  console.error('사용법: node scripts/upload-invite.js <json-파일-경로>');
  console.error('예시:  node scripts/upload-invite.js scripts/invite-data.json');
  process.exit(1);
}

const absolutePath = path.resolve(dataFilePath);
if (!fs.existsSync(absolutePath)) {
  console.error(`파일을 찾을 수 없습니다: ${absolutePath}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));

const functionsRequire = createRequire(path.resolve(__dirname, '../functions/package.json'));
const { initializeApp } = functionsRequire('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = functionsRequire('firebase-admin/firestore');

const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(keyPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

initializeApp();
const db = getFirestore();

async function upload() {
  const data = {
    ...raw,
    date: Timestamp.fromDate(new Date(raw.date)),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db.doc('invitations/main').set(data, { merge: true });
  console.log('✅ invitations/main 업로드 완료');
  console.log(`   신랑: ${raw.groom?.name} / 신부: ${raw.bride?.name}`);
  console.log(`   날짜: ${raw.date}`);
  console.log(`   장소: ${raw.venue?.name} ${raw.venue?.hall}`);
}

upload().catch(err => {
  console.error('❌ 업로드 실패:', err.message);
  process.exit(1);
});
