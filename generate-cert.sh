#!/bin/bash

CERT_KEY="private.key"
CERT_CRT="certificate.crt"

echo "📛 Удаляем старые сертификаты (если есть)..."
rm -f $CERT_KEY $CERT_CRT

echo "🔐 Генерируем новые self-signed сертификаты..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $CERT_KEY -out $CERT_CRT \
  -subj "/C=RU/ST=Moscow/L=Moscow/O=Piligrim/CN=localhost"

if [[ -f "$CERT_KEY" && -f "$CERT_CRT" ]]; then
  echo "✅ Сертификаты успешно созданы:"
  ls -lh $CERT_KEY $CERT_CRT
else
  echo "❌ Ошибка при создании сертификатов"
  exit 1
fi
