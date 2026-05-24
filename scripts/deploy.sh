#!/bin/bash
set -e

echo "🚀 Production 환경으로 배포 시작..."

# functions/.env.prod 존재 확인
if [ ! -f "functions/.env.prod" ]; then
  echo "⚠️  functions/.env.prod 파일이 없습니다."
  echo "   functions/.env.example 을 참고해서 functions/.env.prod 를 만들어 주세요."
  exit 1
fi

# Functions 환경 파일 복사
echo "📦 Functions 환경 설정 복사 (prod)..."
cp functions/.env.prod functions/.env

# Functions 의존성 설치
echo "📦 Functions 의존성 설치..."
cd functions && npm ci && cd ..

# Firebase 배포
echo "🔥 Firebase 배포 중..."
firebase deploy

echo "✅ 배포 완료!"
