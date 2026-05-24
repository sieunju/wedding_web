# Wedding Web — Project Guidelines

## 프로젝트 목적

이 프로젝트는 **모바일 청첩장 오픈소스 템플릿**입니다.
누구나 자유롭게 fork해서 자신의 청첩장으로 커스터마이징할 수 있도록 설계합니다.

## 개발 원칙

### 재사용성 우선
- 이름, 날짜, 장소, 사진 등 개인 정보는 반드시 설정 파일이나 변수로 분리할 것
- 하드코딩된 개인 정보를 코드 곳곳에 흩뿌리지 말 것
- fork한 사람이 최소한의 수정으로 자신의 청첩장을 만들 수 있어야 함

### 공개 저장소 규칙
- API 키, 비밀번호, 토큰 등 민감한 정보는 절대 커밋하지 말 것
- `.env` 파일이나 Firebase 서비스 계정 키는 `.gitignore`에 포함
- `.agents/`, `skills-lock.json` 등 Claude Code 내부 파일은 커밋하지 말 것

### Firebase 구조
- Hosting: `public/` 디렉토리
- Functions: `functions/` 디렉토리 (Node.js)
- 프로젝트 ID: `YOUR_FIREBASE_PROJECT_ID` (`.firebaserc` 참고)

## 기술 스택
- Firebase Hosting + Firebase Functions + Firestore + Storage
- React 18 (CDN) + Babel standalone (빌드 툴 없음)
- `public/index.html` → 청첩장 페이지
- `public/manager/` → 관리자 페이지 (Firebase Auth 필요)

## 아키텍처

### 데이터 구조 (Firestore)
```
templates/{id}
  label: string          # 관리자용 이름 (예: "A안")
  isActive: boolean      # A/B 배정 풀 포함 여부
  groom/bride: { name, father, mother, order }
  date: Timestamp
  venue: { name, hall, address, lat, lng }
  greeting: { title, body }
  transport: [{ label, text }]
  photoUrl: string       # Firebase Storage URL
  shareUrl: string
  footer: string
  createdAt/updatedAt: Timestamp
```

### A/B 템플릿 배정 로직
1. URL 파라미터 `?t={templateId}` 우선
2. `sessionStorage` 내 이전 배정 유지
3. 없으면 `isActive=true` 템플릿 중 랜덤 선택 후 저장

### 관리자 페이지 (`/manager`)
- Firebase Auth 이메일/비밀번호 로그인
- 템플릿 CRUD, 활성/비활성 토글
- 사진 업로드 (Firebase Storage `photos/`)
- 미리보기 링크 (`/?t={id}`)

## 디자인 레퍼런스
UI를 구현/수정할 때는 항상 `.claude/design/README.md`의 스펙과
`.claude/design/invite.jsx`의 인라인 스타일 값을 참고하세요.
색상·간격·타이포그래피는 `design/README.md`의 Design Tokens 섹션이 단일 진실 소스(SSOT)입니다.
