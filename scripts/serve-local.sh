#!/bin/bash
set -e

echo "🔧 Local 개발 환경 설정..."

# functions/.env.local 존재 확인
if [ ! -f "functions/.env.local" ]; then
  echo "⚠️  functions/.env.local 파일이 없습니다."
  echo "   functions/.env.example 을 참고해서 functions/.env.local 을 만들어 주세요."
  exit 1
fi

# Functions 환경 파일 복사
echo "📦 Functions 환경 설정 복사 (local)..."
cp functions/.env.local functions/.env

# Firebase Hosting 에뮬레이터만 실행 (Java 불필요)
# Firestore/Functions 에뮬레이터는 Java 21+ 필요 — 운영 Firebase를 그대로 사용
echo "🔥 Firebase Hosting 에뮬레이터 실행..."
echo "   http://localhost:5000"
echo ""
firebase emulators:start --only hosting
