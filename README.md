# 모바일 청첩장 오픈소스 템플릿

누구나 fork해서 자신의 청첩장으로 커스터마이징할 수 있는 모바일 청첩장 템플릿입니다.

## 특징

- 4가지 디자인 테마 (A: Minimal / B: Botanical / C: Editorial / D: Midnight)
- Firebase Functions SSR — A/B 템플릿 자동 배정 (쿠키 기반)
- Remote Config로 템플릿 비율 조정 (`wedding_template` 파라미터)
- Firestore에서 청첩장 데이터 실시간 주입
- 계좌번호 복사, 지도 딥링크, 공유 시트, 큰글씨 모드
- Pretendard 단일 폰트 — Google Fonts 의존 없음
- 빌드 툴 없음 (CDN React/Babel 아님 — 순수 HTML/CSS/JS)

## 셋업 가이드

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/wedding_web.git
cd wedding_web
npm install -g firebase-tools
cd functions && npm install && cd ..
```

### 2. Firebase 프로젝트 생성

[Firebase Console](https://console.firebase.google.com)에서 새 프로젝트를 만든 뒤:
- Firestore Database 활성화
- Firebase Hosting 활성화
- Firebase Functions 활성화 (Blaze 요금제 필요)
- Remote Config 활성화

### 3. `.firebaserc` 설정

```bash
cp .firebaserc.example .firebaserc
```

`.firebaserc` 파일에서 `YOUR_PROJECT_ID`를 본인 프로젝트 ID로 교체하세요.

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

### 4. 서비스 계정 키 설정

Firestore·Storage 업로드 스크립트는 Firebase Admin SDK 인증이 필요합니다.

1. [Firebase 콘솔](https://console.firebase.google.com) → 프로젝트 설정 → **서비스 계정** 탭
2. **새 비공개 키 생성** → JSON 파일 다운로드
3. 프로젝트 루트에 `serviceAccountKey.json` 으로 저장

> `serviceAccountKey.json` 은 `.gitignore`에 포함되어 있으므로 커밋되지 않습니다.

### 5. 청첩장 데이터 업로드

`scripts/invite-data.json` 을 본인 정보로 수정한 뒤 Firestore에 업로드합니다.

```bash
node scripts/upload-invite.js scripts/invite-data.json
```

`invite-data.json` 주요 필드:

```json
{
  "groom": { "name": "홍길동", "father": "홍판서", "mother": "김춘섬", "order": "장남" },
  "bride": { "name": "이영희", "father": "이대감", "mother": "박소사", "order": "장녀" },
  "date": "2026-11-14T15:30:00+09:00",
  "venue": { "name": "웨딩홀 이름", "hall": "그랜드볼룸", "address": "서울 강남구 ...", "lat": 37.5065, "lng": 127.0536 },
  "accounts": {
    "groom": [{ "role": "신랑", "name": "홍길동", "bank": "국민은행", "number": "000-000000-00-000" }],
    "bride": [{ "role": "신부", "name": "이영희", "bank": "신한은행", "number": "000-000000-00-000" }]
  },
  "shareUrl": "https://your-domain.com"
}
```

> 예시 파일: `scripts/invite-data.example.json`

### 6. 웨딩 사진 변환 및 Storage 업로드

**① 사진 WebP 변환**

```bash
# 메인 사진 1장
bash scripts/convert-main.sh ~/Downloads/main.jpg

# 갤러리 사진 최대 9장
bash scripts/convert-images.sh ~/Downloads/gallery_folder/
```

변환된 파일은 `public/images/` 에 저장됩니다 (`.gitignore`에 포함).

**② Firebase Storage 업로드**

[Firebase 콘솔](https://console.firebase.google.com) → Storage 를 먼저 활성화하세요.

```bash
# 기본 버킷 사용
node scripts/upload-photos.js

# asia-northeast1 등 특정 버킷 지정
STORAGE_BUCKET=버킷이름 node scripts/upload-photos.js
```

업로드가 완료되면 Storage CDN URL이 Firestore `invitations/main.photos` 에 자동 저장됩니다.

### 7. 로컬 개발 서버

Java 11+ 가 필요합니다 (`brew install openjdk@17`).

```bash
bash scripts/serve-local.sh
# Hosting:   http://localhost:5000
# Functions: http://localhost:5001
```

템플릿 미리보기: `http://localhost:5000/preview.html`  
특정 템플릿 확인: `http://localhost:5000/?t=a` (a/b/c/d)

### 7. 배포

```bash
firebase deploy
```

## A/B 테스트 — Remote Config

Firebase Console → Remote Config → `wedding_template` 파라미터를 추가하세요.

- 값: `a`, `b`, `c`, `d` 중 하나
- 설정하지 않으면 방문자에게 랜덤 배정됩니다
- 한 번 배정된 템플릿은 쿠키로 30일간 유지됩니다

## 프로젝트 구조

```
wedding_web/
├── functions/
│   ├── index.js              # Cloud Function (SSR + A/B 라우팅)
│   ├── templates/            # 서버사이드 HTML 템플릿
│   │   ├── template-a.html
│   │   ├── template-b.html
│   │   ├── template-c.html
│   │   └── template-d.html
│   └── package.json
├── public/
│   ├── css/
│   │   ├── styles-a.css      # Template A — Minimal
│   │   ├── styles-b.css      # Template B — Botanical
│   │   ├── styles-c.css      # Template C — Editorial
│   │   └── styles-d.css      # Template D — Midnight
│   ├── fonts/                # Pretendard WOFF2 자체 호스팅
│   ├── images/               # 개인 사진 (.gitignore에 포함)
│   │   ├── main.webp
│   │   └── gallery/
│   ├── main.js               # 공용 클라이언트 JS
│   ├── showcase.html         # 4개 템플릿 쇼케이스 (개발용)
│   └── preview.html          # 4개 템플릿 동시 미리보기
├── scripts/
│   ├── serve-local.sh        # 로컬 에뮬레이터 실행
│   ├── upload-invite.js      # Firestore 청첩장 데이터 업로드
│   ├── upload-photos.js      # Firebase Storage 이미지 업로드
│   ├── convert-main.sh       # 메인 사진 WebP 변환
│   ├── convert-images.sh     # 갤러리 사진 WebP 변환
│   └── invite-data.json      # 청첩장 데이터 (.gitignore에 포함)
├── firebase.json
├── firestore.rules
├── storage.rules
└── .gitignore
```

## .gitignore 주요 항목

| 항목 | 이유 |
|------|------|
| `.firebaserc` | 프로젝트 ID 포함 — fork 시 각자 설정 |
| `public/images/` | 개인 웨딩 사진 — 오픈소스 배포 제외 |
| `functions/.env*` | API 키 등 민감 정보 |
| `.agents/`, `skills-lock.json` | Claude Code 내부 파일 |

## 기술 스택

- **Firebase Hosting** — CDN 및 리라이트
- **Firebase Functions v2** (Node.js) — SSR, 템플릿 선택, 쿠키 배정
- **Firebase Firestore** — 청첩장 데이터 저장
- **Firebase Remote Config** — A/B 템플릿 비율 제어
- **Firebase Storage** — 이미지 CDN (asia-northeast1 권장)
- **Pretendard** (자체 호스팅 WOFF2) — 단일 한국어 웹폰트
- 빌드 툴 없음 — 순수 HTML/CSS/Vanilla JS

## 라이선스

MIT License — 자유롭게 사용, 수정, 배포할 수 있습니다.
