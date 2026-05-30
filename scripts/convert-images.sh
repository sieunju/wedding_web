#!/bin/bash
set -e
if [ -z "$1" ] || [ ! -d "$1" ]; then
  echo "Usage: $0 <folder>"
  exit 1
fi

OUTPUT_DIR="public/images/gallery"
mkdir -p "$OUTPUT_DIR"

FILES=()
while IFS= read -r f; do
  FILES+=("$f")
done < <(find "$1" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" \) | sort | head -9)

if [ ${#FILES[@]} -eq 0 ]; then
  echo "❌ JPG 파일을 찾을 수 없습니다."
  exit 1
fi

echo "📸 ${#FILES[@]}장 변환 시작..."
for i in "${!FILES[@]}"; do
  NUM=$(printf "%02d" $((i + 1)))
  OUT="$OUTPUT_DIR/$NUM.webp"
  echo "  $((i+1))/${#FILES[@]}: $(basename "${FILES[$i]}") → $NUM.webp"
  convert "${FILES[$i]}" -auto-orient -resize 1200x -quality 85 -define webp:lossless=false "$OUT"
done
echo "✅ 완료: $OUTPUT_DIR/"
