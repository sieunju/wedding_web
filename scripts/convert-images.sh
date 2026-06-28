#!/bin/bash
set -e

SRC_DIR="public/images"

FILES=()
while IFS= read -r f; do
  FILES+=("$f")
done < <(find "$SRC_DIR" -maxdepth 2 \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | sort)

if [ ${#FILES[@]} -eq 0 ]; then
  echo "❌ 변환할 JPG/PNG 파일이 없습니다: $SRC_DIR"
  exit 1
fi

echo "📸 ${#FILES[@]}개 변환 시작..."
for f in "${FILES[@]}"; do
  OUT="${f%.*}.webp"
  echo "  $(basename "$f") → $(basename "$OUT")"
  magick "$f" -auto-orient -resize 1200x -quality 100 -define webp:lossless=false "$OUT"
  rm "$f"
done
echo "✅ 완료"
