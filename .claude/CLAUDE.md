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
- Firebase Hosting + Firebase Functions
- Vanilla HTML/CSS/JS (`public/index.html`)
