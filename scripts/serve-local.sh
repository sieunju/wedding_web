#!/bin/bash
set -e

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ -z "$JAVA_VER" ] || [ "$JAVA_VER" -lt 11 ]; then
  echo "⚠️  Java 11+ 필요 (현재: Java ${JAVA_VER:-없음})"
  echo "   설치: brew install openjdk@17"
  exit 1
fi

echo "🔥 포트 정리 중 (5000, 5001)..."
lsof -ti:5000,5001 | xargs kill -9 2>/dev/null || true

KEY="$(pwd)/serviceAccountKey.json"
if [ -f "$KEY" ]; then
  export GOOGLE_APPLICATION_CREDENTIALS="$KEY"
  echo "🔑 서비스 계정 키 로드: $KEY"
else
  echo "⚠️  serviceAccountKey.json 없음 — Firestore 데이터가 로드되지 않을 수 있습니다"
fi

echo "🔥 Firebase 에뮬레이터 실행..."
echo "   Hosting:   http://localhost:5000"
echo "   Functions: http://localhost:5001"
echo ""
firebase emulators:start --only hosting,functions
