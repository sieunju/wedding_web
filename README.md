# 모바일 청첩장 오픈소스 템플릿

누구나 fork해서 자신의 청첩장으로 커스터마이징할 수 있는 모바일 청첩장 템플릿입니다.

## 템플릿 미리보기

**[→ 전체 미리보기 (GitHub Pages)](https://sieunju.github.io/wedding_web/example_snapshot/)**

| Template A — Pastel | Template B — Mint | Template C — Editorial | Template D — Midnight |
|---|---|---|---|
| [미리보기](https://sieunju.github.io/wedding_web/example_snapshot/invite-A-pastel.html) | [미리보기](https://sieunju.github.io/wedding_web/example_snapshot/invite-B-mint.html) | [미리보기](https://sieunju.github.io/wedding_web/example_snapshot/invite-C-editorial.html) | [미리보기](https://sieunju.github.io/wedding_web/example_snapshot/invite-D-midnight.html) |
| 따뜻한 파스텔 톤 | 민트 보태니컬 | 세리프 에디토리얼 | 다크 미드나잇 |

---

## 특징

- **4가지 디자인 테마** — A: Minimal / B: Botanical / C: Editorial / D: Midnight
- **Firebase Functions SSR** — 방문자마다 A/B 템플릿 자동 배정 (쿠키 30일 유지)
- **Remote Config** 로 템플릿 비율 조정 (`wedding_template` 파라미터)
- **Firestore** 에서 청첩장 데이터 실시간 주입 — 코드 수정 없이 데이터만 교체
- 계좌번호 복사, 네이버·카카오·티맵 지도 링크, 공유 시트, 큰글씨 모드
- **카카오톡·문자 공유 미리보기(OG 태그) 자동 생성** — 신랑·신부 이름, 예식 날짜·장소, 대표 사진을 서버에서 주입
- **Pretendard** 자체 호스팅 — Google Fonts 외부 의존 없음
- 빌드 툴 없음 — 순수 HTML / CSS / Vanilla JS

---

## 사용 가이드

### Step 1. Fork & Clone

```bash
# 이 저장소를 fork한 뒤
git clone https://github.com/YOUR_USERNAME/wedding_web.git
cd wedding_web

# Firebase CLI 설치
npm install -g firebase-tools

# Functions 의존성 설치
cd functions && npm install && cd ..
```

---

### Step 2. Firebase 프로젝트 생성

[Firebase Console](https://console.firebase.google.com) 에서 새 프로젝트를 만든 뒤 아래 서비스를 활성화하세요.

| 서비스 | 용도 |
|---|---|
| **Firestore Database** | 청첩장 데이터 저장 |
| **Firebase Hosting** | 정적 파일 및 Functions 연결 |
| **Firebase Functions** | SSR 및 A/B 템플릿 라우팅 (Blaze 요금제 필요) |
| **Firebase Storage** | 웨딩 사진 CDN |
| **Remote Config** | A/B 템플릿 비율 조정 (선택) |

---

### Step 3. 프로젝트 ID 설정

`.firebaserc` 파일에서 `YOUR_FIREBASE_PROJECT_ID` 를 본인의 프로젝트 ID로 교체하세요.

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

> `.firebaserc` 는 `.gitignore` 에 포함되어 있어 커밋되지 않습니다.

Firebase CLI 로그인 및 프로젝트 연결:

```bash
firebase login
firebase use your-project-id
```

---

### Step 4. 서비스 계정 키 발급

업로드 스크립트(Firestore·Storage)는 Firebase Admin SDK 인증이 필요합니다.

1. [Firebase Console](https://console.firebase.google.com) → 프로젝트 설정 → **서비스 계정** 탭
2. **새 비공개 키 생성** → JSON 파일 다운로드
3. 프로젝트 루트에 `serviceAccountKey.json` 으로 저장

```
wedding_web/
└── serviceAccountKey.json   ← 여기에 저장 (.gitignore에 포함)
```

> **절대 커밋하지 마세요.** `.gitignore` 에 이미 포함되어 있습니다.

---

### Step 5. 청첩장 데이터 작성 및 업로드

`scripts/invite-data.example.json` 을 참고해서 `scripts/invite-data.json` 을 작성하세요.

```bash
cp scripts/invite-data.example.json scripts/invite-data.json
```

> `scripts/invite-data.json` 은 `.gitignore` 에 포함되어 커밋되지 않습니다.

#### 주요 필드

```json
{
  "groom": {
    "name": "홍길동",
    "father": "홍판서",
    "mother": "김춘섬",
    "order": "장남"
  },
  "bride": {
    "name": "이영희",
    "father": "이대감",
    "mother": "박소사",
    "order": "장녀"
  },
  "date": "2026-11-14T15:30:00+09:00",
  "venue": {
    "name": "웨딩홀 이름",
    "hall": "그랜드볼룸",
    "address": "서울특별시 강남구 테헤란로 123",
    "lat": 37.5065,
    "lng": 127.0536
  },
  "accounts": {
    "groom": [
      { "role": "신랑", "name": "홍길동", "bank": "국민은행", "number": "000-000000-00-000" }
    ],
    "bride": [
      { "role": "신부", "name": "이영희", "bank": "신한은행", "number": "000-000000-00-000" }
    ]
  },
  "transport": {
    "subway": "2호선 강남역 3번 출구 도보 5분",
    "bus": "146, 360 → 강남역 하차",
    "parking": "건물 지하 2층 주차 가능"
  },
  "maps": {
    "naver": "https://naver.me/xxxxxxxx",
    "kakao": "https://place.map.kakao.com/xxxxxxxx",
    "tmap": "https://tmap.life/xxxxx"
  },
  "photos": {
    "mainByTemplate": {
      "a": "https://firebasestorage.googleapis.com/v0/b/your-project-id.firebasestorage.app/o/a-main.webp?alt=media",
      "b": "https://firebasestorage.googleapis.com/v0/b/your-project-id.firebasestorage.app/o/b-main.webp?alt=media",
      "c": "https://firebasestorage.googleapis.com/v0/b/your-project-id.firebasestorage.app/o/c-main.webp?alt=media",
      "d": "https://firebasestorage.googleapis.com/v0/b/your-project-id.firebasestorage.app/o/d-main.webp?alt=media"
    },
    "gallery": [
      "https://firebasestorage.googleapis.com/v0/b/your-project-id.firebasestorage.app/o/gallery%2F01.webp?alt=media",
      "https://firebasestorage.googleapis.com/v0/b/your-project-id.firebasestorage.app/o/gallery%2F02.webp?alt=media"
    ]
  },
  "shareUrl": "https://your-project-id.web.app"
}
```

#### 필드 설명

| 필드 | 설명 |
|---|---|
| `groom` / `bride` | 신랑·신부 이름, 부모님 성함, 서열 (장남/차녀 등) |
| `date` | ISO 8601 형식, 한국 시간 `+09:00` 필수 |
| `venue` | 웨딩홀 이름·홀·주소·위도·경도 |
| `accounts` | 계좌 목록 (여러 개 가능) |
| `transport.subway/bus/parking` | 교통 안내 — 빈 값이면 항목 숨김 |
| `maps.naver/kakao/tmap` | 각 지도 앱 공유 링크 — 빈 값이면 위도·경도 기반 기본 링크 사용 |
| `photos.mainByTemplate.a~d` | 템플릿별 메인 사진 URL (Firebase Storage) |
| `photos.gallery` | 갤러리 사진 URL 배열 |
| `shareUrl` | 청첩장 공유 URL — 카카오톡·문자 공유 시 `og:url` 로 사용 |

> **공유 미리보기(OG 태그)**: `groom`/`bride` 이름, `date`, `venue.name`, `photos.mainByTemplate.{템플릿}`, `shareUrl` 값을 조합해 방문 시점에 `og:title`/`og:description`/`og:image`/`og:url` 이 서버(`functions/index.js`)에서 자동으로 채워집니다. 별도 설정이 필요 없습니다.

#### Firestore 업로드

```bash
node scripts/upload-invite.js scripts/invite-data.json
```

---

### Step 6. 웨딩 사진 준비 및 Storage 업로드

#### ① 사진 WebP 변환 (선택)

`public/images/` 에 사진을 넣고 스크립트를 실행하면 jpg/jpeg/png → webp 로 일괄 변환됩니다.

```
public/
└── images/
    ├── main.jpg          ← 메인 사진
    └── gallery/
        ├── 01.jpg
        └── ...
```

```bash
bash scripts/convert-images.sh
```

변환 후 원본 파일은 자동 삭제되며 `.webp` 파일이 생성됩니다.

#### ② Firebase Storage 업로드

[Firebase Console](https://console.firebase.google.com) → **Storage** 를 먼저 활성화하세요.

Storage 업로드는 두 가지 방법 중 하나를 선택하세요.

**방법 A — 스크립트 자동 업로드**

```bash
STORAGE_BUCKET=your-project-id.firebasestorage.app node scripts/upload-photos.js
```

업로드 완료 후 Storage CDN URL이 Firestore `invitations/main.photos` 에 자동 저장됩니다.

**방법 B — Firebase 콘솔 수동 업로드**

콘솔에서 직접 파일을 업로드한 뒤, URL을 복사해서 `invite-data.json` 의 `photos` 필드에 붙여넣으세요.

Firebase Storage 공개 URL 형식:
```
https://firebasestorage.googleapis.com/v0/b/{버킷명}/o/{파일명}.webp?alt=media
```

> `?alt=media` 가 없으면 파일이 아닌 메타데이터 JSON이 반환됩니다.

#### Storage 공개 규칙 설정

Firebase Console → Storage → **Rules** 탭에서 읽기를 허용하세요.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

### Step 7. 로컬 개발 서버

Java 11+ 가 필요합니다.

```bash
# Java 설치 (없는 경우)
brew install openjdk@17

# 에뮬레이터 실행
bash scripts/serve-local.sh
```

| 주소 | 설명 |
|---|---|
| `http://localhost:5000` | 청첩장 메인 |
| `http://localhost:5000/?t=a` | 템플릿 A 강제 확인 (a/b/c/d) |
| `http://localhost:5000/showcase.html` | 4개 템플릿 동시 쇼케이스 |

---

### Step 8. 배포

```bash
firebase deploy
```

특정 서비스만 배포:

```bash
firebase deploy --only functions   # 데이터 주입 로직 변경 시
firebase deploy --only hosting     # 정적 파일(CSS/JS) 변경 시
```

---

## A/B 템플릿 배정 동작 방식

방문자에게 템플릿이 배정되는 우선순위:

1. URL 파라미터 `?t=a` (미리보기·테스트용)
2. 쿠키 `wt` (이전 방문 시 배정된 템플릿, 30일 유지)
3. Remote Config `wedding_template` 파라미터 값
4. `isActive=true` 템플릿 중 랜덤 배정 후 쿠키 저장

**Remote Config 설정 방법:**  
Firebase Console → Remote Config → 파라미터 추가 → 키: `wedding_template` / 값: `a`, `b`, `c`, `d` 중 하나

---

## 프로젝트 구조

```
wedding_web/
├── functions/
│   ├── index.js              # Cloud Function — SSR + A/B 라우팅
│   └── templates/            # 서버사이드 HTML 템플릿
│       ├── template-a.html   # Minimal
│       ├── template-b.html   # Botanical
│       ├── template-c.html   # Editorial
│       └── template-d.html   # Midnight
├── public/
│   ├── css/
│   │   ├── styles-a.css
│   │   ├── styles-b.css
│   │   ├── styles-c.css
│   │   └── styles-d.css
│   ├── fonts/                # Pretendard WOFF2 자체 호스팅
│   ├── images/               # 웨딩 사진 (.gitignore 포함)
│   ├── main.js               # 공용 클라이언트 JS
│   └── showcase.html         # 개발용 쇼케이스
├── scripts/
│   ├── serve-local.sh        # 로컬 에뮬레이터 실행
│   ├── upload-invite.js      # Firestore 데이터 업로드
│   ├── upload-photos.js      # Storage 이미지 업로드
│   ├── convert-images.sh     # JPG/PNG → WebP 일괄 변환
│   ├── invite-data.json      # 본인 청첩장 데이터 (.gitignore 포함)
│   └── invite-data.example.json
├── firebase.json
├── storage.rules
└── .gitignore
```

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| Firebase Hosting | CDN 및 Functions 리라이트 |
| Firebase Functions v2 (Node.js) | SSR, 템플릿 선택, 쿠키 배정 |
| Firebase Firestore | 청첩장 데이터 저장 |
| Firebase Remote Config | A/B 템플릿 비율 제어 |
| Firebase Storage | 이미지 CDN |
| Pretendard (자체 호스팅 WOFF2) | 한국어 웹폰트 |
| HTML / CSS / Vanilla JS | 빌드 툴 없음 |

---

## 라이선스

MIT License — 자유롭게 사용, 수정, 배포할 수 있습니다.
