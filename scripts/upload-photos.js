#!/usr/bin/env node
'use strict';

/**
 * 이미지를 Firebase Storage에 업로드하고 URL을 Firestore에 저장합니다.
 *
 * 사용법:
 *   node scripts/upload-photos.js
 *
 * 업로드 경로:
 *   public/images/main.webp        → Storage: photos/main.webp
 *   public/images/gallery/NN.webp  → Storage: photos/gallery/NN.webp
 *
 * Firestore invitations/main.photos 에 URL 객체를 저장합니다.
 */

const path = require('path');
const fs = require('fs');

const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(keyPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

const admin = require('../functions/node_modules/firebase-admin');

// 버킷 이름: 환경변수 > serviceAccountKey의 project_id로 추론
let storageBucket = process.env.STORAGE_BUCKET || '';
if (!storageBucket && fs.existsSync(keyPath)) {
  const key = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
  storageBucket = `${key.project_id}.appspot.com`;
}
if (!storageBucket) {
  console.error('❌ STORAGE_BUCKET 환경변수를 설정하거나 serviceAccountKey.json을 추가하세요.');
  process.exit(1);
}

admin.initializeApp({ storageBucket });

const db = admin.firestore();
const bucket = admin.storage().bucket();

const IMAGE_DIR = path.resolve(__dirname, '../public/images');

async function uploadFile(localPath, storagePath) {
  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  const file = bucket.file(storagePath);
  await file.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  console.log(`  ✅ ${path.basename(localPath)} → ${publicUrl}`);
  return publicUrl;
}

async function run() {
  const mainLocal = path.join(IMAGE_DIR, 'main.webp');
  const galleryDir = path.join(IMAGE_DIR, 'gallery');

  const galleryFiles = fs.existsSync(galleryDir)
    ? fs.readdirSync(galleryDir)
        .filter(f => /\.(webp|jpe?g|png)$/i.test(f))
        .sort()
    : [];

  console.log('📤 Firebase Storage 업로드 시작...');

  const [mainUrl, ...galleryUrls] = await Promise.all([
    fs.existsSync(mainLocal)
      ? uploadFile(mainLocal, 'photos/main.webp')
      : Promise.resolve(null),
    ...galleryFiles.map((f, i) =>
      uploadFile(path.join(galleryDir, f), `photos/gallery/${f}`)
    ),
  ]);

  const photos = {
    ...(mainUrl && { main: mainUrl }),
    gallery: galleryUrls.filter(Boolean),
  };

  await db.doc('invitations/main').set({ photos }, { merge: true });

  console.log('\n✅ Firestore invitations/main.photos 업데이트 완료');
  console.log(`   메인: ${photos.main ?? '(없음)'}`);
  console.log(`   갤러리: ${photos.gallery.length}장`);
}

run().catch(err => {
  console.error('❌ 실패:', err.message);
  process.exit(1);
});
