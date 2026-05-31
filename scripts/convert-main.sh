#!/bin/bash
set -e
if [ -z "$1" ]; then
  echo "Usage: $0 <image.jpg or folder>"
  exit 1
fi

OUTPUT="public/images/main.webp"
mkdir -p public/images

if [ -d "$1" ]; then
  INPUT=$(find "$1" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" \) | sort | head -1)
else
  INPUT="$1"
fi

if [ -z "$INPUT" ]; then
  echo "❌ JPG 파일을 찾을 수 없습니다."
  exit 1
fi

echo "📸 변환: $INPUT → $OUTPUT"
convert "$INPUT" -auto-orient -resize 1200x -quality 100 -define webp:lossless=false "$OUTPUT"
echo "✅ 완료: $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
